-- Add new columns to existing tasks table
-- Copy and paste this into your Supabase SQL Editor and click "Run"

ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS due_date DATE,
ADD COLUMN IF NOT EXISTS due_time TIME,
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_time ON public.tasks(due_time);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);

-- Create a composite index for efficient sorting
CREATE INDEX IF NOT EXISTS idx_tasks_sorting ON public.tasks(user_id, completed, priority, due_date, created_at);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Verify the columns were added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'tasks' AND table_schema = 'public'
ORDER BY ordinal_position;

-- Function to get weekly task statistics
CREATE OR REPLACE FUNCTION get_weekly_task_stats(
    user_id_param UUID,
    start_date TIMESTAMP DEFAULT NOW() - INTERVAL '7 days',
    end_date TIMESTAMP DEFAULT NOW()
)
RETURNS JSON AS $$
DECLARE
    stats JSON;
BEGIN
    SELECT json_build_object(
        'total_tasks', COUNT(*),
        'completed_tasks', COUNT(*) FILTER (WHERE completed = true),
        'pending_tasks', COUNT(*) FILTER (WHERE completed = false),
        'high_priority_tasks', COUNT(*) FILTER (WHERE priority = 'high'),
        'medium_priority_tasks', COUNT(*) FILTER (WHERE priority = 'medium'),
        'low_priority_tasks', COUNT(*) FILTER (WHERE priority = 'low'),
        'categories_used', COALESCE(json_agg(DISTINCT category) FILTER (WHERE category IS NOT NULL), '[]'::json),
        'completion_rate', CASE 
            WHEN COUNT(*) > 0 THEN ROUND((COUNT(*) FILTER (WHERE completed = true)::numeric / COUNT(*)::numeric) * 100, 1)
            ELSE 0 
        END,
        'daily_breakdown', (
            SELECT json_agg(
                json_build_object(
                    'date', date_trunc('day', created_at)::date,
                    'day_name', to_char(created_at, 'Day'),
                    'task_count', day_count,
                    'completed_count', completed_count
                )
            )
            FROM (
                SELECT 
                    created_at,
                    COUNT(*) as day_count,
                    COUNT(*) FILTER (WHERE completed = true) as completed_count
                FROM tasks 
                WHERE user_id = user_id_param 
                    AND created_at >= start_date 
                    AND created_at <= end_date
                GROUP BY date_trunc('day', created_at), created_at
                ORDER BY date_trunc('day', created_at)
            ) daily_stats
        )
    ) INTO stats
    FROM tasks 
    WHERE user_id = user_id_param 
        AND created_at >= start_date 
        AND created_at <= end_date;
    
    RETURN COALESCE(stats, '{}'::json);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
