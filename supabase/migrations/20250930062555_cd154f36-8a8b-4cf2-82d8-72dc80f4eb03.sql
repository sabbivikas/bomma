-- Enable RLS on tables that don't have it enabled
ALTER TABLE public.story_frames ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stories ENABLE ROW LEVEL SECURITY;

-- Check and create missing policies for stories table using conditional logic

-- Basic RLS policies for stories (if they don't exist)
DO $$
BEGIN
  -- Allow public read access only to approved stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'stories' 
    AND policyname = 'Public can view approved stories'
  ) THEN
    CREATE POLICY "Public can view approved stories" 
    ON public.stories 
    FOR SELECT 
    USING (moderation_status = 'approved');
  END IF;

  -- Allow users to create their own stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'stories' 
    AND policyname = 'Users can create their own stories'
  ) THEN
    CREATE POLICY "Users can create their own stories" 
    ON public.stories 
    FOR INSERT 
    WITH CHECK (session_id = current_setting('app.session_id', true));
  END IF;

  -- Allow users to update their own stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'stories' 
    AND policyname = 'Users can update their own stories'
  ) THEN
    CREATE POLICY "Users can update their own stories" 
    ON public.stories 
    FOR UPDATE 
    USING (session_id = current_setting('app.session_id', true));
  END IF;

  -- Allow users to delete their own stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'stories' 
    AND policyname = 'Users can delete their own stories'
  ) THEN
    CREATE POLICY "Users can delete their own stories" 
    ON public.stories 
    FOR DELETE 
    USING (session_id = current_setting('app.session_id', true));
  END IF;
END $$;

-- Create RLS policies for story_frames table
DO $$
BEGIN
  -- Allow public read access to frames of approved stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'story_frames' 
    AND policyname = 'Public can view frames of approved stories'
  ) THEN
    CREATE POLICY "Public can view frames of approved stories" 
    ON public.story_frames 
    FOR SELECT 
    USING (
      EXISTS (
        SELECT 1 FROM public.stories 
        WHERE stories.id = story_frames.story_id 
        AND stories.moderation_status = 'approved'
      )
    );
  END IF;

  -- Allow users to insert frames for their own stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'story_frames' 
    AND policyname = 'Users can add frames to their own stories'
  ) THEN
    CREATE POLICY "Users can add frames to their own stories" 
    ON public.story_frames 
    FOR INSERT 
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.stories 
        WHERE stories.id = story_frames.story_id 
        AND stories.session_id = current_setting('app.session_id', true)
      )
    );
  END IF;

  -- Allow users to update frames of their own stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'story_frames' 
    AND policyname = 'Users can update frames of their own stories'
  ) THEN
    CREATE POLICY "Users can update frames of their own stories" 
    ON public.story_frames 
    FOR UPDATE 
    USING (
      EXISTS (
        SELECT 1 FROM public.stories 
        WHERE stories.id = story_frames.story_id 
        AND stories.session_id = current_setting('app.session_id', true)
      )
    );
  END IF;

  -- Allow users to delete frames of their own stories
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'story_frames' 
    AND policyname = 'Users can delete frames of their own stories'
  ) THEN
    CREATE POLICY "Users can delete frames of their own stories" 
    ON public.story_frames 
    FOR DELETE 
    USING (
      EXISTS (
        SELECT 1 FROM public.stories 
        WHERE stories.id = story_frames.story_id 
        AND stories.session_id = current_setting('app.session_id', true)
      )
    );
  END IF;
END $$;

-- Create RLS policies for content_reports table
DO $$
BEGIN
  -- Allow users to view their own reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'content_reports' 
    AND policyname = 'Users can view their own reports'
  ) THEN
    CREATE POLICY "Users can view their own reports" 
    ON public.content_reports 
    FOR SELECT 
    USING (session_id = current_setting('app.session_id', true));
  END IF;

  -- Allow users to create reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'content_reports' 
    AND policyname = 'Users can create reports'
  ) THEN
    CREATE POLICY "Users can create reports" 
    ON public.content_reports 
    FOR INSERT 
    WITH CHECK (session_id = current_setting('app.session_id', true));
  END IF;

  -- Allow users to update their own reports
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'content_reports' 
    AND policyname = 'Users can update their own reports'
  ) THEN
    CREATE POLICY "Users can update their own reports" 
    ON public.content_reports 
    FOR UPDATE 
    USING (session_id = current_setting('app.session_id', true));
  END IF;
END $$;