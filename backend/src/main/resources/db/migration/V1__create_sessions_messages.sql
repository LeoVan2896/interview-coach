-- V1__create_sessions_messages.sql
-- Migrated from postgres-schema.sql into Flyway management
-- question_type column added to match Session entity @Column mapping

CREATE TABLE IF NOT EXISTS sessions (
    id            UUID        PRIMARY KEY,
    topic         VARCHAR(50) NOT NULL,
    question_text TEXT        NOT NULL,
    question_hint TEXT,
    question_type VARCHAR(20),
    created_at    TIMESTAMP   NOT NULL DEFAULT NOW(),
    completed     BOOLEAN     NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS messages (
    id         BIGSERIAL PRIMARY KEY,
    session_id UUID      NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    role       VARCHAR(20) NOT NULL,
    content    TEXT        NOT NULL,
    created_at TIMESTAMP   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_messages_session_id ON messages(session_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
