-- V4__rename_fiserv_note_to_company_note.sql
-- Rename the fiserv_note column to company_note for a generic, reusable label.
ALTER TABLE lessons RENAME COLUMN fiserv_note TO company_note;
