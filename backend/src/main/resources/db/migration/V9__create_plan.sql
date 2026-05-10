-- V9__create_plan.sql
-- plans: the 8-week study plan definition (one row)
-- Columns: id (primary key), start_date, end_date

CREATE TABLE IF NOT EXISTS plans (
  id         BIGSERIAL PRIMARY KEY,
  start_date DATE      NOT NULL,
  end_date   DATE      NOT NULL
);

INSERT INTO plans (start_date, end_date) VALUES ('2026-05-04', '2026-06-28');
