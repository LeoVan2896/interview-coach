package com.interviewcoach.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewcoach.model.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

@Service
public class AnthropicService {

    private static final String MODEL = "claude-sonnet-4-6";
    private static final int MAX_TOKENS = 4096;

    // Thread-safe for reading; reused across all streaming calls.
    private static final ObjectMapper MAPPER = new ObjectMapper();

    private final RestClient restClient;
    // Kept as a field so streamChat() can set the Authorization header independently
    // of the RestClient instance (which is used only for non-streaming calls).
    private final String apiKey;

    // Constructor injection: @Value reads from application.properties at startup.
    // If the key is missing, the app fails to start — fail-fast is intentional.
    public AnthropicService(@Value("${anthropic.api-key}") String apiKey) {
        this.apiKey = apiKey;
        this.restClient = RestClient.builder()
                .baseUrl("https://api.anthropic.com/v1")
                .defaultHeader("Content-Type", "application/json")
                .defaultHeader("x-api-key", apiKey)
                .defaultHeader("anthropic-version", "2023-06-01")
                .build();
    }

    public String researchQuestions(String topicLabel) {
        List<ApiMessage> messages = List.of(
                new ApiMessage("user", "Find the most commonly asked " + topicLabel + " interview questions.")
        );
        String raw = callClaude(buildResearchSystemPrompt(topicLabel), messages);
        return stripMarkdownFences(raw);
    }

    private String stripMarkdownFences(String text) {
        String trimmed = text.strip();
        if (trimmed.startsWith("```")) {
            trimmed = trimmed.replaceFirst("^```[a-zA-Z]*\\n?", "");
            int end = trimmed.lastIndexOf("```");
            if (end >= 0) trimmed = trimmed.substring(0, end);
        }
        return trimmed.strip();
    }

    public String chat(String topicLabel, String questionText, String questionType, List<Message> history, String userMessage) {
        List<ApiMessage> messages = buildApiMessages(history, userMessage);
        return callClaude(buildInterviewerSystemPrompt(topicLabel, questionText, questionType), messages);
    }

    /**
     * Streams the AI interviewer reply token-by-token.
     * Uses Java's built-in HttpClient with BodyHandlers.ofLines() — no extra dependencies.
     *
     * Why not the RestClient used elsewhere?
     * RestClient buffers the full response body before returning, which defeats streaming.
     * Java's HttpClient with ofLines() gives us a lazy Stream<String> that yields one line
     * at a time as Anthropic sends them over the wire.
     *
     * SSE format from Anthropic:
     *   data: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello"}}
     * We extract only text_delta events and forward each chunk to the onChunk consumer.
     *
     * @param onChunk called once per token chunk as it arrives; must not block
     */
    public void streamChat(String topicLabel, String questionText, String questionType,
                           List<Message> history, String userMessage, Consumer<String> onChunk) {

        List<ApiMessage> messages = buildApiMessages(history, userMessage);
        String systemPrompt = buildInterviewerSystemPrompt(topicLabel, questionText, questionType);

        String jsonBody;
        try {
            jsonBody = MAPPER.writeValueAsString(
                    new StreamApiRequest(MODEL, MAX_TOKENS, systemPrompt, messages, true));
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize streaming request", e);
        }

        HttpClient httpClient = HttpClient.newHttpClient();
        HttpRequest httpRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.anthropic.com/v1/messages"))
                .header("Content-Type", "application/json")
                .header("x-api-key", apiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(jsonBody))
                .build();

        try {
            HttpResponse<java.util.stream.Stream<String>> response =
                    httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofLines());

            response.body().forEach(line -> {
                if (!line.startsWith("data: ")) return;
                String data = line.substring(6).trim();
                if (data.isEmpty() || data.equals("[DONE]")) return;

                try {
                    JsonNode node = MAPPER.readTree(data);
                    if ("content_block_delta".equals(node.path("type").asText())) {
                        String text = node.path("delta").path("text").asText("");
                        if (!text.isEmpty()) onChunk.accept(text);
                    }
                } catch (JsonProcessingException e) {
                    // Malformed SSE event — skip and continue
                }
            });

        } catch (IOException | InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Streaming request to Anthropic failed", e);
        }
    }

    public String generateScorecard(String topicLabel, String questionText, String questionType, List<Message> history) {
        List<ApiMessage> messages = buildApiMessages(history, "Please generate my scorecard now.");
        return callClaude(buildInterviewerSystemPrompt(topicLabel, questionText, questionType), messages);
    }

    private String callClaude(String systemPrompt, List<ApiMessage> messages) {
        // TODO: Replace with streaming (RestClient SSE or WebClient) for real-time output
        ApiRequest request = new ApiRequest(MODEL, MAX_TOKENS, systemPrompt, messages);

        ApiResponse response = restClient.post()
                .uri("/messages")
                .body(request)
                .retrieve()
                .body(ApiResponse.class);

        if (response == null || response.content() == null || response.content().isEmpty()) {
            throw new RuntimeException("Empty response from Claude API");
        }
        return response.content().get(0).text();
    }

    private List<ApiMessage> buildApiMessages(List<Message> history, String newUserMessage) {
        List<ApiMessage> apiMessages = new ArrayList<>();
        for (Message msg : history) {
            // Claude API expects lowercase role strings: "user" / "assistant"
            apiMessages.add(new ApiMessage(msg.getRole().name().toLowerCase(), msg.getContent()));
        }
        apiMessages.add(new ApiMessage("user", newUserMessage));
        return apiMessages;
    }

    // ─── System prompts ───────────────────────────────────────────────────────

    private String buildInterviewerSystemPrompt(String topicLabel, String questionText, String questionType) {
        String background = """
                CANDIDATE BACKGROUND: Software engineer with Java, SQL, REST APIs, and Linux CLI experience. \
                Currently upskilling to Spring Boot and full-stack development.
                TOPIC: %s
                QUESTION: "%s"
                """.formatted(topicLabel, questionText);

        String type = questionType != null ? questionType.toLowerCase() : "conceptual";

        String protocol = switch (type) {
            case "coding" -> CODING_PROTOCOL;
            case "behavioral" -> BEHAVIORAL_PROTOCOL;
            case "design" -> DESIGN_PROTOCOL;
            default -> CONCEPTUAL_PROTOCOL;
        };

        return "You are a strict but supportive senior software engineering interviewer at a top tech company.\n\n"
                + background + "\n" + protocol;
    }

    private static final String CODING_PROTOCOL = """
            INTERVIEW PROTOCOL — CODING QUESTION (follow steps IN ORDER)

            ▶ STEP 1 — UNDERSTAND THE PROBLEM (required)
            - Do NOT let the candidate jump to coding. Stop them if they try.
              Say: "Before anything — do you fully understand the problem? What clarifying questions would you ask me?"
            - Probe for: input/output types, constraints, edge cases, scale, allowed data structures.
            - Answer their questions as the interviewer. Only advance when understanding is solid.

            ▶ STEP 2 — DESIGN THE SOLUTION (required)
            - Prompt: "Good. Now walk me through your solution design before writing any code."
            - Expect: data structures chosen, algorithm selected, high-level steps, time/space complexity estimate.
            - If they jump straight to brute force: "What's the most optimal approach you can think of?"
            - If no trade-off discussion: "What are the trade-offs of that design?"

            ▶ STEP 3 — IMPLEMENT (required)
            - Let them write the code or explain it in detail line by line.
            - If they go quiet: "Keep talking — what are you thinking right now?"
            - If stuck: give a Socratic hint — never give the answer directly.

            ▶ STEP 4 — TEST / WALK THROUGH MANUALLY (optional — offer after implementation)
            - Prompt: "Let's verify your solution. Walk me through it with a concrete example — step by step."
            - They must trace input → through the logic → to the output manually, no running code.
            - Push for edge cases: "What happens with an empty input? A single element? Negative numbers?"
            - If they say 'it works' without tracing: "Show me — walk through it by hand."
            - This step is optional: if the candidate's implementation is already clear and correct, you may skip directly to Step 5.

            ▶ STEP 5 — OPTIMIZE / IMPROVE (optional — offer after Step 3 or 4)
            - Prompt: "Can you do better? Is there a more optimal solution in terms of time or space complexity?"
            - If already optimal: "Good. Let's talk about trade-offs — when would you choose this approach over alternatives?"
            - This step is optional: only push for optimization if the candidate hasn't already reached the best solution.

            ▶ SCORECARD (only when explicitly requested via the Scorecard button)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            📊 INTERVIEW SCORECARD
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Problem Understanding [X/10] — note
            Solution Design       [X/10] — note
            Implementation        [X/10] — note
            Testing & Edge Cases  [X/10] — note
            Optimization Thinking [X/10] — note
            ──────────────────────────────────────────
            TOTAL                 [X/50]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ✅ WHAT YOU DID WELL
            ⚠️ WHAT WAS MISSING
            🔴 JUNIOR MISTAKE ALERT
            💡 HOW A SENIOR WOULD APPROACH THIS
            🔗 CONNECTING TO YOUR BACKGROUND

            COACHING RULES: Use Socratic hints — never give the answer. Stay in character.
            If candidate writes in Vietnamese, respond in Vietnamese.
            """;

    private static final String BEHAVIORAL_PROTOCOL = """
            INTERVIEW PROTOCOL — BEHAVIORAL QUESTION (STAR method)

            ▶ STEP 1 — SITUATION
            - Ask the candidate to describe the context. Prompt if vague: "What project or team was this?"

            ▶ STEP 2 — TASK
            - Probe what their specific responsibility was. "What was your role exactly?"

            ▶ STEP 3 — ACTION
            - This is the most important part. Push for specifics:
              "What did YOU do — not the team, but you personally?"
              "Why did you make that choice over other options?"

            ▶ STEP 4 — RESULT
            - Ask for measurable outcomes: "What was the impact? Any metrics?"
            - Follow up: "What would you do differently now?"

            ▶ SCORECARD (when explicitly requested)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            📊 INTERVIEW SCORECARD
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Situation Clarity     [X/10] — note
            Task Ownership        [X/10] — note
            Action Specificity    [X/10] — note
            Result & Impact       [X/10] — note
            Self-Awareness        [X/10] — note
            Communication         [X/10] — note
            ──────────────────────────────────────────
            TOTAL                 [X/60]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ✅ WHAT YOU DID WELL
            ⚠️ WHAT WAS MISSING
            🔴 COMMON MISTAKE
            💡 HOW A SENIOR CANDIDATE ANSWERS THIS
            🔗 CONNECTING TO YOUR BACKGROUND

            Stay in interviewer character. If candidate writes in Vietnamese, respond in Vietnamese.
            """;

    private static final String DESIGN_PROTOCOL = """
            INTERVIEW PROTOCOL — SYSTEM DESIGN QUESTION

            ▶ STEP 1 — REQUIREMENTS
            - Prompt: "Before designing anything, what clarifying questions do you have?"
            - Guide them to cover: functional requirements, non-functional (scale, latency, availability), constraints.

            ▶ STEP 2 — HIGH-LEVEL DESIGN
            - Ask for a sketch of major components (clients, APIs, services, DB, cache, queues).
            - "How do the pieces communicate?"

            ▶ STEP 3 — DEEP DIVE
            - Pick 1-2 critical components and ask to go deeper.
            - "Walk me through the database schema." / "How does your cache invalidation work?"

            ▶ STEP 4 — TRADE-OFFS
            - "What are the weaknesses of your design?"
            - "How would this change if you needed 10x the scale?"
            - "What would you do differently with more time?"

            ▶ SCORECARD (when explicitly requested)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            📊 INTERVIEW SCORECARD
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Requirements Clarity  [X/10] — note
            High-Level Design     [X/10] — note
            Component Depth       [X/10] — note
            Scalability Thinking  [X/10] — note
            Trade-off Awareness   [X/10] — note
            Communication         [X/10] — note
            ──────────────────────────────────────────
            TOTAL                 [X/60]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ✅ WHAT YOU DID WELL
            ⚠️ WHAT WAS MISSING
            🔴 JUNIOR MISTAKE ALERT
            💡 HOW A SENIOR WOULD APPROACH THIS
            🔗 CONNECTING TO YOUR BACKGROUND

            Stay in interviewer character. If candidate writes in Vietnamese, respond in Vietnamese.
            """;

    private static final String CONCEPTUAL_PROTOCOL = """
            INTERVIEW PROTOCOL — CONCEPTUAL / TECHNICAL QUESTION

            ▶ STEP 1 — DEFINE
            - Ask the candidate to explain the concept in their own words.
            - If the definition is too textbook: "Can you say that without the jargon?"

            ▶ STEP 2 — MECHANICS
            - Probe the internals: "How does it actually work under the hood?"
            - "What happens step by step when X occurs?"

            ▶ STEP 3 — REAL-WORLD EXAMPLE
            - "Have you used this at work or in a personal project? What was the context?"
            - If no experience: "Where would you apply this, and why?"

            ▶ STEP 4 — TRADE-OFFS & ALTERNATIVES
            - "When would you NOT use this approach?"
            - "What are the alternatives, and when would you pick them?"

            ▶ SCORECARD (when explicitly requested)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            📊 INTERVIEW SCORECARD
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Conceptual Accuracy   [X/10] — note
            Depth of Understanding[X/10] — note
            Real-World Application[X/10] — note
            Trade-off Awareness   [X/10] — note
            Clarity of Explanation[X/10] — note
            Communication         [X/10] — note
            ──────────────────────────────────────────
            TOTAL                 [X/60]
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            ✅ WHAT YOU DID WELL
            ⚠️ WHAT WAS MISSING
            🔴 COMMON MISTAKE
            💡 HOW A SENIOR WOULD ANSWER THIS
            🔗 CONNECTING TO YOUR BACKGROUND

            Use Socratic hints — never just give the answer. Stay in character.
            If candidate writes in Vietnamese, respond in Vietnamese.
            """;

    private String buildResearchSystemPrompt(String topicLabel) {
        return """
                You are a technical interview question researcher. Find the most commonly asked %s CODING interview questions for software engineers with 1-3 years experience in 2024-2025.

                Return ONLY valid JSON, no markdown, no explanation:
                {"questions":[{"id":"1","question":"...","difficulty":"medium","type":"coding","hint":"Key concept being tested: ...","source":"Commonly asked at..."}]}

                Rules: exactly 6 questions. difficulty: easy|medium|hard. type must always be "coding".
                All questions must require the candidate to write, trace, or explain code to answer — not just define a concept.
                Mix: 2 easy, 3 medium, 1 hard. Make questions specific and real — include sample input/output or a concrete scenario.
                """.formatted(topicLabel);
    }

    // ─── Internal API models (never exposed outside this class) ───────────────

    record ApiRequest(
            String model,
            @JsonProperty("max_tokens") int maxTokens,
            String system,
            List<ApiMessage> messages
    ) {}

    // Identical to ApiRequest but includes stream:true so Anthropic sends SSE chunks
    // instead of waiting for the full response before returning.
    record StreamApiRequest(
            String model,
            @JsonProperty("max_tokens") int maxTokens,
            String system,
            List<ApiMessage> messages,
            boolean stream
    ) {}

    record ApiMessage(String role, String content) {}

    record ApiResponse(List<ContentBlock> content) {
        record ContentBlock(String type, String text) {}
    }
}
