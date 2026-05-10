package com.interviewcoach.controller;

import com.interviewcoach.dto.*;
import com.interviewcoach.service.SessionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {

    private final SessionService sessionService;

    public SessionController(SessionService sessionService) {
        this.sessionService = sessionService;
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
