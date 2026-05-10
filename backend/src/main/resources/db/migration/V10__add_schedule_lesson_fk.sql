-- V10__add_schedule_lesson_fk.sql
-- Add lesson_id foreign key to schedule_days with best-effort backfill from learning_topic.
-- Rows where no lesson title matches keep lesson_id = NULL; dashboard Learning card falls back to /lessons.

ALTER TABLE schedule_days ADD COLUMN lesson_id BIGINT REFERENCES lessons(id);

UPDATE schedule_days sd
SET lesson_id = (SELECT id FROM lessons WHERE title = sd.learning_topic LIMIT 1);
