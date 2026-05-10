-- V2__create_lessons.sql

CREATE TABLE lessons (
    id           BIGSERIAL    PRIMARY KEY,
    category     VARCHAR(50)  NOT NULL,
    title        VARCHAR(255) NOT NULL,
    description  TEXT         NOT NULL,
    level        VARCHAR(20)  NOT NULL DEFAULT 'INTERMEDIATE',
    duration_min INT          NOT NULL DEFAULT 45,
    content_html TEXT,
    fiserv_note  TEXT,
    status       VARCHAR(20)  NOT NULL DEFAULT 'NOT_STARTED',
    sort_order   INT          NOT NULL DEFAULT 0,
    created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lessons_category  ON lessons(category);
CREATE INDEX idx_lessons_status    ON lessons(status);
CREATE INDEX idx_lessons_sort      ON lessons(sort_order);
