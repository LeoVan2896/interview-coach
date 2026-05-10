package com.interviewcoach.repository;

import com.interviewcoach.model.Message;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MessageRepository extends JpaRepository<Message, Long> {

    List<Message> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

    // COUNT avoids loading full message content just to get the size (avoids N+1 for list view)
    @Query("SELECT COUNT(m) FROM Message m WHERE m.session.id = :sessionId")
    int countBySessionId(@Param("sessionId") UUID sessionId);
}
