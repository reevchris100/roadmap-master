-- Add expiration column to roadmaps
ALTER TABLE roadmaps ADD COLUMN public_until timestamp with time zone;
