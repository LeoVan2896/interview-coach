-- V5__create_schedule.sql
-- schedule_weeks: one row per week of the 8-week prep plan
-- schedule_days: one row per day (56 total = 8 weeks × 7 days)
-- IF NOT EXISTS matches the V1/V2 style used in this project.

CREATE TABLE IF NOT EXISTS schedule_weeks (
    id            BIGSERIAL    PRIMARY KEY,
    week_num      INT          NOT NULL UNIQUE,
    theme         VARCHAR(100) NOT NULL,
    focus_java    TEXT,
    focus_dsa     TEXT,
    focus_project TEXT
);

CREATE TABLE IF NOT EXISTS schedule_days (
    id                BIGSERIAL    PRIMARY KEY,
    week_num          INT          NOT NULL,
    day_num           INT          NOT NULL,
    day_label         VARCHAR(10)  NOT NULL,
    learning_topic    VARCHAR(200),
    learning_desc     TEXT,
    learning_resource TEXT,
    dsa_pattern       VARCHAR(100),
    dsa_problems      TEXT,
    project_task      TEXT,
    is_milestone      BOOLEAN      NOT NULL DEFAULT FALSE,
    UNIQUE (week_num, day_num)
);

CREATE INDEX idx_schedule_days_week_num ON schedule_days (week_num);
