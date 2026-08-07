-- ========================================================
-- COMSATS Resource Portal - Supabase SQL Database Schema
-- Run this script in your Supabase SQL Editor (Database -> SQL Editor)
-- ========================================================

-- 1. Create Courses Table
CREATE TABLE IF NOT EXISTS public.courses (
    id TEXT PRIMARY KEY,
    code TEXT NOT NULL,
    title TEXT NOT NULL,
    abbreviation TEXT DEFAULT '',
    aliases JSONB DEFAULT '[]'::jsonb,
    department TEXT DEFAULT '',
    semester INTEGER DEFAULT 1,
    credit_hours INTEGER DEFAULT 3,
    description TEXT DEFAULT '',
    icon_name TEXT DEFAULT 'BookOpen',
    instructor_ids JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Create Instructors Table
CREATE TABLE IF NOT EXISTS public.instructors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    title TEXT DEFAULT 'Lecturer',
    department TEXT DEFAULT '',
    email TEXT DEFAULT '',
    office TEXT DEFAULT '',
    specialization TEXT DEFAULT '',
    rating NUMERIC DEFAULT 5.0,
    avatar_url TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 3. Create Resources Table
CREATE TABLE IF NOT EXISTS public.resources (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    course_id TEXT,
    instructor_id TEXT,
    exam_type TEXT,
    semester_session TEXT,
    file_size TEXT DEFAULT '1.5 MB',
    file_type TEXT DEFAULT 'pdf',
    uploader_name TEXT DEFAULT 'Student',
    url TEXT DEFAULT '',
    status TEXT DEFAULT 'approved',
    downloads_count INTEGER DEFAULT 0,
    file_hash TEXT DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Migration Helper for Existing Databases
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';
ALTER TABLE public.resources ADD COLUMN IF NOT EXISTS file_hash TEXT DEFAULT NULL;

-- 4. Enable Row Level Security (RLS) & Allow Anonymous Read/Write Access
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.instructors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Allow Public Read Access
CREATE POLICY "Allow Public Select Courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow Public Select Instructors" ON public.instructors FOR SELECT USING (true);
CREATE POLICY "Allow Public Select Resources" ON public.resources FOR SELECT USING (true);

-- Allow Public Insert/Update Access
CREATE POLICY "Allow Public Insert/Update Courses" ON public.courses FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Insert/Update Instructors" ON public.instructors FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow Public Insert/Update Resources" ON public.resources FOR ALL USING (true) WITH CHECK (true);

-- 5. Create Storage Bucket for Document Uploads (comsats-resources)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('comsats-resources', 'comsats-resources', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Bucket Public Access Policies
CREATE POLICY "Public Read Access on comsats-resources" 
ON storage.objects FOR SELECT USING (bucket_id = 'comsats-resources');

CREATE POLICY "Public Upload Access on comsats-resources" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'comsats-resources');
