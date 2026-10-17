ALTER TABLE public.class_tokens
  ADD COLUMN unlocked text[] NOT NULL DEFAULT ARRAY['beranda','diagnostik','materi','level-1','level-2','level-3','uji','refleksi'],
  ADD COLUMN mode text NOT NULL DEFAULT 'mandiri',
  ADD COLUMN focus_page text NOT NULL DEFAULT 'beranda',
  ADD COLUMN quiz_url text,
  ADD COLUMN message text,
  ADD COLUMN extras jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.students
  ADD COLUMN current_page text,
  ADD COLUMN last_seen timestamptz;

GRANT DELETE ON public.activities TO authenticated;
CREATE POLICY "teacher deletes activities" ON public.activities FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM students s JOIN class_tokens t ON t.id = s.token_id WHERE s.id = activities.student_id AND t.teacher_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.student_sync(_student_id uuid, _page text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE r jsonb;
BEGIN
  UPDATE students SET current_page = left(_page, 40), last_seen = now() WHERE id = _student_id;
  SELECT jsonb_build_object('unlocked', t.unlocked, 'mode', t.mode, 'focus_page', t.focus_page,
    'quiz_url', t.quiz_url, 'message', t.message, 'extras', t.extras, 'active', t.active)
  INTO r FROM students s JOIN class_tokens t ON t.id = s.token_id WHERE s.id = _student_id;
  RETURN r;
END $$;
GRANT EXECUTE ON FUNCTION public.student_sync(uuid, text) TO anon, authenticated;