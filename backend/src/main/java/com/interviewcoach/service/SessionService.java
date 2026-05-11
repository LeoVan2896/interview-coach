package com.interviewcoach.service;

import com.interviewcoach.dto.*;
import com.interviewcoach.model.Message;
import com.interviewcoach.model.Session;
import com.interviewcoach.model.Topic;
import com.interviewcoach.repository.MessageRepository;
import com.interviewcoach.repository.SessionRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

// @Transactional at class level means every public method runs in a transaction by default.
// Individual methods can override with @Transactional(readOnly = true) for SELECT-only paths
// — this hint lets the DB skip dirty-checking and can improve performance.
@Service
@Transactional
public class SessionService {

    private final SessionRepository sessionRepository;
    private final MessageRepository messageRepository;
    private final AnthropicService anthropicService;

    public SessionService(
            SessionRepository sessionRepository,
            MessageRepository messageRepository,
            AnthropicService anthropicService) {
        this.sessionRepository = sessionRepository;
        this.messageRepository = messageRepository;
        this.anthropicService = anthropicService;
    }

    public SessionDetail createSession(CreateSessionRequest request) {
        Topic topic = Topic.valueOf(request.topic());

        Session session = new Session();
        session.setTopic(topic);
        session.setQuestionText(request.questionText());
        session.setQuestionHint(request.questionHint());
        session.setQuestionType(request.questionType());
        session = sessionRepository.save(session);

        return SessionDetail.from(session, List.of());
    }

    @Transactional(readOnly = true)
    public List<SessionSummary> getAllSessions() {
        // TODO: replace per-session COUNT with a single GROUP BY query for large datasets
        return sessionRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(s -> SessionSummary.from(s, messageRepository.countBySessionId(s.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public SessionDetail getSession(UUID id) {
        Session session = findSessionById(id);
        List<Message> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(id);
        return SessionDetail.from(session, messages);
    }

    public MessageDto sendMessage(UUID sessionId, String userContent) {
        Session session = findSessionById(sessionId);
        List<Message> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        Message userMessage = new Message();
        userMessage.setSession(session);
        userMessage.setRole(Message.Role.USER);
        userMessage.setContent(userContent);
        messageRepository.save(userMessage);

        // Full conversation history is sent to Claude on every turn for context.
        String aiReply = anthropicService.chat(
                session.getTopic().getLabel(),
                session.getQuestionText(),
                session.getQuestionType(),
                history,
                userContent
        );

        Message assistantMessage = new Message();
        assistantMessage.setSession(session);
        assistantMessage.setRole(Message.Role.ASSISTANT);
        assistantMessage.setContent(aiReply);
        assistantMessage = messageRepository.save(assistantMessage);

        return MessageDto.from(assistantMessage);
    }

    public MessageDto generateScorecard(UUID sessionId) {
        Session session = findSessionById(sessionId);
        List<Message> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        String scorecard = anthropicService.generateScorecard(
                session.getTopic().getLabel(),
                session.getQuestionText(),
                session.getQuestionType(),
                history
        );

        Message scorecardMessage = new Message();
        scorecardMessage.setSession(session);
        scorecardMessage.setRole(Message.Role.ASSISTANT);
        scorecardMessage.setContent(scorecard);
        scorecardMessage = messageRepository.save(scorecardMessage);

        session.setCompleted(true);
        sessionRepository.save(session);

        return MessageDto.from(scorecardMessage);
    }

    /**
     * Carries the session + its full history across the transaction boundary into
     * the async streaming thread.  All fields are simple value types (enum, String,
     * List of detached entities whose basic columns are already fetched) — safe to
     * read after the originating transaction closes.
     */
    public record StreamContext(Session session, List<Message> history) {}

    /**
     * Phase 1 of the streaming flow (runs in its own short transaction):
     *  - validates the session exists
     *  - saves the user's message
     *  - loads the full history that Claude needs for context
     *  - returns it all as a StreamContext the controller hands to the async thread
     *
     * Keeping this separate from the streaming itself means the DB connection is
     * released before the long-running HTTP call to Anthropic begins.
     */
    @Transactional
    public StreamContext prepareStream(UUID sessionId, String userContent) {
        Session session = findSessionById(sessionId);
        List<Message> history = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        Message userMessage = new Message();
        userMessage.setSession(session);
        userMessage.setRole(Message.Role.USER);
        userMessage.setContent(userContent);
        messageRepository.save(userMessage);

        return new StreamContext(session, history);
    }

    /**
     * Phase 2 of the streaming flow (runs in its own short transaction):
     * persists the fully-assembled AI reply after streaming completes.
     */
    @Transactional
    public MessageDto saveAssistantMessage(UUID sessionId, String content) {
        Session session = findSessionById(sessionId);
        Message msg = new Message();
        msg.setSession(session);
        msg.setRole(Message.Role.ASSISTANT);
        msg.setContent(content);
        msg = messageRepository.save(msg);
        return MessageDto.from(msg);
    }

    public void deleteSession(UUID id) {
        if (!sessionRepository.existsById(id)) {
            throw new EntityNotFoundException("Session not found: " + id);
        }
        sessionRepository.deleteById(id);
    }

    private Session findSessionById(UUID id) {
        return sessionRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Session not found: " + id));
    }
}
