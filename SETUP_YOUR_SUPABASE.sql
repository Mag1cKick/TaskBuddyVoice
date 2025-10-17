-- ============================================
-- COMPLETE DATABASE SETUP FOR YOUR SUPABASE
-- ============================================
-- Copy and paste this ENTIRE script into Supabase SQL Editor and run it

-- Step 1: Create tasks table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
    due_date DATE,
    due_time TIME,
    category TEXT,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: ENABLE Row Level Security
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Step 3: DROP existing policies (if any)
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

-- Step 4: CREATE RLS Policies
-- Policy: Users can SELECT (view) their own tasks
CREATE POLICY "Users can view their own tasks" 
ON public.tasks FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own tasks
CREATE POLICY "Users can insert their own tasks" 
ON public.tasks FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own tasks
CREATE POLICY "Users can update their own tasks" 
ON public.tasks FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own tasks
CREATE POLICY "Users can delete their own tasks" 
ON public.tasks FOR DELETE 
USING (auth.uid() = user_id);

-- Step 5: Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_time ON public.tasks(due_time);
CREATE INDEX IF NOT EXISTS idx_tasks_category ON public.tasks(category);
CREATE INDEX IF NOT EXISTS idx_tasks_sorting ON public.tasks(user_id, completed, priority, due_date, created_at);

-- Step 6: Create auto-update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Step 7: Verify setup
SELECT 
    'Table exists' as status,
    COUNT(*) as total_tasks
FROM public.tasks;

SELECT 
    'RLS enabled' as status,
    relrowsecurity as enabled
FROM pg_class 
WHERE relname = 'tasks';

SELECT 
    'Policies count' as status,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'tasks';

-- Step 8: Show all policies
SELECT 
    policyname,
    cmd as command,
    qual as using_expression,
    with_check as check_expression
FROM pg_policies 
WHERE tablename = 'tasks'
ORDER BY policyname;

-- Done! You should see:
-- ✅ Table exists
-- ✅ RLS enabled: true
-- ✅ Policies count: 4
-- ✅ List of all 4 policies (SELECT, INSERT, UPDATE, DELETE)

