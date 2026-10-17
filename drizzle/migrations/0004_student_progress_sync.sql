CREATE OR REPLACE FUNCTION public.student_sync(_student_id uuid, _page text)
 RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE r jsonb; d jsonb; dg int;
BEGIN
  UPDATE students SET current_page = left(_page, 40), last_seen = now() WHERE id = _student_id;
  SELECT coalesce(jsonb_agg(DISTINCT x), '[]'::jsonb) INTO d FROM (
    SELECT coalesce(payload->>'from', substring(payload->>'info' from 'Setelah (level-[0-9])')) AS x FROM activities WHERE student_id = _student_id AND kind = 'asesmen'
    UNION SELECT 'prasyarat-b' FROM activities WHERE student_id = _student_id AND kind = 'prasyarat-b' AND score = 5
    UNION SELECT kind FROM activities WHERE student_id = _student_id AND kind IN ('level-1','level-2','level-3','modul-b')
  ) q WHERE x IS NOT NULL;
  SELECT score INTO dg FROM activities WHERE student_id = _student_id AND kind = 'diagnostik' ORDER BY created_at DESC LIMIT 1;
  SELECT jsonb_build_object('unlocked', t.unlocked, 'mode', t.mode, 'focus_page', t.focus_page,
    'quiz_url', t.quiz_url, 'message', t.message, 'extras', t.extras, 'active', t.active,
    'done', d, 'diag', dg)
  INTO r FROM students s JOIN class_tokens t ON t.id = s.token_id WHERE s.id = _student_id;
  RETURN r;
END $function$;