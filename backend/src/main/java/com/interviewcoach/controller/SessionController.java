package com.interviewcoach.controller;

import com.interviewcoach.dto.*;
import com.interviewcoach.service.AnthropicService;
import com.interviewcoach.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;
    private final AnthropicService anthropicService;

    // Virtual threads (Java 21+): each streaming request gets its own lightweight thread.
    // No thread-pool sizing needed — the JVM manages the carrier threads automatically.
    private final ExecutorService streamExecutor =
            Executors.newVirtualThreadPerTaskExecutor();

    public SessionController(SessionService sessionService, AnthropicService anthropicService) {
        this.sessionService = sessionService;
        this.anthropicService = anthropicService;
    }

    @PostMapping
    public ResponseEntity<SessionDetail> createSession(@Valid @RequestBody CreateSessionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.createSession(request));
    }

    @GetMapping
    public List<SessionSummary> getAllSessions() {
        return sessionService.getAllSessions();
    }

    @GetMapping("/{id}")
    public SessionDetail getSession(@PathVariable UUID id) {
        return sessionService.getSession(id);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDto> sendMessage(
            @PathVariable UUID id,
            @Valid @RequestBody ChatRequest request) {
        return ResponseEntity.ok(sessionService.sendMessage(id, request.content()));
    }

    /**
     * Streams the AI interviewer reply as Server-Sent Events.
     *
     * Flow:
     *  1. prepareStream() — short @Transactional: saves user message, loads history, releases DB conn
     *  2. Virtual thread calls Anthropic with stream:true; each arriving chunk is sent as an SSE data event
     *  3. saveAssistantMessage() — short @Transactional: persists the assembled reply
     *  4. SSE "done" event carries the saved message UUID so the frontend can swap its temp ID
     *
     * Why the controller coordinates instead of SessionService?
     * SessionService is @Transactional. Putting the long-running HTTP stream inside a service
     * method would hold the DB connection open for the full streaming duration (~5–15 s).
     * Splitting into two focused @Transactional calls (prepare + save) keeps connections short.
     */
    @PostMapping(value = "/{id}/messages/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamMessage(
            @PathVariable UUID id,
            @Valid @RequestBody ChatRequest request) {

        SseEmitter emitter = new SseEmitter(120_000L); // 2-minute timeout

        // Phase 1 — runs synchronously here so exceptions (session not found, etc.)
        // are returned as normal HTTP errors before we open the SSE stream.
        SessionService.StreamContext ctx = sessionService.prepareStream(id, request.content());

        streamExecutor.submit(() -> {
            StringBuilder fullResponse = new StringBuilder();
            try {
                anthropicService.streamChat(
                        ctx.session().getTopic().getLabel(),
                        ctx.session().getQuestionText(),
                        ctx.session().getQuestionType(),
                        ctx.history(),
                        request.content(),
                        chunk -> {
                            fullResponse.append(chunk);
                            try {
                                emitter.send(SseEmitter.event().data(chunk));
                            } catch (IOException e) {
                                // Client disconnected mid-stream — abort
                                throw new UncheckedIOException(e);
                            }
                        }
                );

                // Phase 2 — save the complete assembled response
                MessageDto saved = sessionService.saveAssistantMessage(id, fullResponse.toString());
                emitter.send(SseEmitter.event().name("done").data(saved.id().toString()));
                emitter.complete();

            } catch (Exception e) {
                emitter.completeWithError(e);
            }
        });

        return emitter;
    }

    @PostMapping("/{id}/scorecard")
    public ResponseEntity<MessageDto> generateScorecard(@PathVariable UUID id) {
        return ResponseEntity.ok(sessionService.generateScorecard(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSession(@PathVariable UUID id) {
        sessionService.deleteSession(id);
        return ResponseEntity.noContent().build();
    }
}
