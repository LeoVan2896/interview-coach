package com.interviewcoach.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.interviewcoach.model.Message;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;

@Service
public class AnthropicService {

    private static final String MODEL = "claude-sonnet-4-6";
    private static final int MAX_TOKENS = 4096;

    private final RestClient restClient;

    // Constructor injection: @Value reads from application.properties at startup.
    // If the key is missing, the app fails to start — fail-fast is intentional.
    public AnthropicService(@Value("${anthropic.api-key}") String apiKey) {
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

            ▶ STEP 1 — UNDERSTAND THE PROBLEM
            - Do NOT let the candidate jump to coding immediately. Stop them if they try.
              Say: "Before anything — do you fully understand the problem? What clarifying questions would you ask me?"
            - Probe for: input/output types, constraints, edge cases, scale, allowed data structures, expected behavior on invalid input.
            - Answer their questions as the interviewer. Only advance when understanding is solid.

            ▶ STEP 2 — DESIGN THE SOLUTION
            - Prompt: "Good. Now walk me through your solution design before writing any code."
            - Expect: data structures chosen, algorithm selected, high-level steps, time/space complexity estimate.
            - If they jump straight to brute force: "What's the most optimal approach you can think of?"
            - If no trade-off discussion: "What are the trade-offs of that design?"

            ▶ STEP 3 — IMPLEMENT
            - Let them write the code or explain it in detail line by line.
            - If they go quiet: "Keep talking — what are you thinking right now?"
            - If stuck: give a Socratic hint — never give the answer directly.
            - When done: move to Step 4.

            ▶ STEP 4 — TEST (manually walk through)
            - Prompt: "Now test your solution. Walk me through it with a concrete example — step by step."
            - They must trace input → through the logic → to the output manually, no running code.
            - Push for edge cases: "What happens with an empty input? A single element? Negative numbers?"
            - If they say 'it works' without tracing: "Show me — walk through it by hand."

            ▶ STEP 5 — OPTIMIZE THE SOLUTION (optional — only if candidate asks or time permits)
            - Prompt: "Can you do better? Is there a way to reduce time or space complexity?"
            - Expect: identify the bottleneck → propose improvement → state new complexity.
            - If they can't see the optimization: "What's the slowest part of your current solution?"
            - If already optimal: "How would this scale to 10 million records? What breaks first?"
            - Do NOT push this step unless the candidate brings it up or explicitly asks for it.

            ▶ SCORECARD (only when explicitly requested or after Step 5)
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            📊 INTERVIEW SCORECARD
            ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
            Problem Understanding [X/10] — note
            Solution Design       [X/10] — note
            Implementation        [X/10] — note
            Testing & Edge Cases  [X/10] — note
            Optimization Thinking [X/10] — note
            Communication         [X/10] — note
            ──────────────────────────────────────────
            TOTAL                 [X/60]
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
                You are a technical interview question researcher. Find the most commonly asked %s interview questions for software engineers with 1-3 years experience in 2024-2025.

                Return ONLY valid JSON, no markdown, no explanation:
                {"questions":[{"id":"1","question":"...","difficulty":"medium","type":"coding","hint":"Key concept being tested: ...","source":"Commonly asked at..."}]}

                Rules: exactly 6 questions. difficulty: easy|medium|hard. type: conceptual|coding|design|behavioral.
                Mix: 2 easy/medium, 3 medium, 1 hard. Make questions specific and real.
                """.formatted(topicLabel);
    }

    // ─── Internal API models (never exposed outside this class) ───────────────

    record ApiRequest(
            String model,
            @JsonProperty("max_tokens") int maxTokens,
            String system,
            List<ApiMessage> messages
    ) {}

    record ApiMessage(String role, String content) {}

    record ApiResponse(List<ContentBlock> content) {
        record ContentBlock(String type, String text) {}
    }
}
