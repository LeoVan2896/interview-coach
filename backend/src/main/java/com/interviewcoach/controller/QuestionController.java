package com.interviewcoach.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.interviewcoach.model.Topic;
import com.interviewcoach.service.AnthropicService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/questions")
public class QuestionController {

    private final AnthropicService anthropicService;
    private final ObjectMapper objectMapper;

    public QuestionController(AnthropicService anthropicService, ObjectMapper objectMapper) {
        this.anthropicService = anthropicService;
        this.objectMapper = objectMapper;
    }

    @GetMapping("/research")
    public ResponseEntity<Object> researchQuestions(@RequestParam String topic) {
        // Topic.valueOf throws IllegalArgumentException for invalid values — caught by GlobalExceptionHandler
        Topic t = Topic.valueOf(topic.toUpperCase());
        String json = anthropicService.researchQuestions(t.getLabel());
        try {
            // Parse the raw JSON string Claude returns into a proper object so Spring serializes it cleanly
            Object parsed = objectMapper.readValue(json, Object.class);
            return ResponseEntity.ok(parsed);
        } catch (Exception e) {
            throw new RuntimeException("Claude returned invalid JSON for topic: " + topic);
        }
    }
}
