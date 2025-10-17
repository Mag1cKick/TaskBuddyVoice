-- ============================================
-- ENABLE REALTIME FOR TASKS TABLE
-- ============================================
-- Run this in Supabase SQL Editor to enable real-time updates

-- Enable Realtime for the tasks table
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;

-- Verify it's enabled
SELECT 
    schemaname,
    tablename,
    'Realtime enabled' as status
FROM pg_publication_tables 
WHERE pubname = 'supabase_realtime' 
AND tablename = 'tasks';

-- You should see one row showing: public | tasks | Realtime enabled

