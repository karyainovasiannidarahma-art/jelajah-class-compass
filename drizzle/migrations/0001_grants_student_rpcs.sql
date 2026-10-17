GRANT EXECUTE ON FUNCTION public.student_join(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_activity(uuid, text, integer, jsonb) TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_tokens TO authenticated;
GRANT SELECT, DELETE ON public.students TO authenticated;
GRANT SELECT ON public.activities TO authenticated;
GRANT ALL ON public.class_tokens, public.students, public.activities TO service_role;