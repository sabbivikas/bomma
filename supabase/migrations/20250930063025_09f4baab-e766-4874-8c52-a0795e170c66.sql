-- Create a simple migration that only drops the problematic view if it exists
-- and restores a working state for comments

-- Drop any existing policies that might be causing issues
DROP POLICY IF EXISTS "Allow reading comments for display" ON public.comments;

-- Create a basic working policy for reading comments
CREATE POLICY "Public can read comments" 
ON public.comments 
FOR SELECT 
USING (true);