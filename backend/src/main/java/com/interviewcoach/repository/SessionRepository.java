package com.interviewcoach.repository;

import com.interviewcoach.model.Session;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface SessionRepository extends JpaRepository<Session, UUID> {
    // Spring Data JPA derives the SQL from the method name — no @Query needed.
    List<Session> findAll(Sort sort);
}
