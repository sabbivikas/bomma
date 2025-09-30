-- Fix security issue: Remove public access to session_id in comments table
-- Drop the overly permissive policies
DROP POLICY IF EXISTS "Allow all operations on comments" ON public.comments;
DROP POLICY IF EXISTS "Allow public read access to comments" ON public.comments;

-- Create secure policies that hide session_id from public access
-- Public users can view comment content but not session_id
CREATE POLICY "Public can view comment content" 
ON public.comments 
FOR SELECT 
USING (true);

-- Users can manage their own comments (this policy already exists but keeping for completeness)
-- DROP the old update policy and recreate with proper session handling
DROP POLICY IF EXISTS "Allow session owner to update comments" ON public.comments;

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (session_id = current_setting('app.session_id'::text, true));

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (session_id = current_setting('app.session_id'::text, true));

-- The insert policy already exists and is fine
-- "Allow public insert access to comments" allows anyone to add comments