CREATE TABLE public.class_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  label text,
  active boolean NOT NULL DEFAULT true,
  teacher_id uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.class_tokens TO authenticated;
GRANT ALL ON public.class_tokens TO service_role;
ALTER TABLE public.class_tokens ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher own tokens" ON public.class_tokens FOR ALL TO authenticated
  USING (teacher_id = auth.uid()) WITH CHECK (teacher_id = auth.uid());

CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_id uuid NOT NULL REFERENCES public.class_tokens(id) ON DELETE CASCADE,
  nickname text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (token_id, nickname)
);
GRANT SELECT, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher reads students" ON public.students FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.class_tokens t WHERE t.id = token_id AND t.teacher_id = auth.uid()));
CREATE POLICY "teacher deletes students" ON public.students FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.class_tokens t WHERE t.id = token_id AND t.teacher_id = auth.uid()));

CREATE TABLE public.activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  kind text NOT NULL,
  score int,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.activities TO authenticated;
GRANT ALL ON public.activities TO service_role;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "teacher reads activities" ON public.activities FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.students s JOIN public.class_tokens t ON t.id = s.token_id
                 WHERE s.id = student_id AND t.teacher_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.student_join(_code text, _nickname text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE tid uuid; sid uuid; nick text := trim(_nickname);
BEGIN
  IF nick = '' OR length(nick) > 40 THEN RAISE EXCEPTION 'Nama tidak valid'; END IF;
  SELECT id INTO tid FROM class_tokens WHERE upper(code) = upper(trim(_code)) AND active;
  IF tid IS NULL THEN RAISE EXCEPTION 'Token tidak ditemukan atau tidak aktif'; END IF;
  INSERT INTO students(token_id, nickname) VALUES (tid, nick)
    ON CONFLICT (token_id, nickname) DO UPDATE SET nickname = EXCLUDED.nickname
    RETURNING id INTO sid;
  RETURN sid;
END $$;

CREATE OR REPLACE FUNCTION public.record_activity(_student_id uuid, _kind text, _score int, _payload jsonb)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF _kind NOT IN ('diagnostik','level-1','level-2','level-3','uji','refleksi') THEN RAISE EXCEPTION 'bad kind'; END IF;
  IF NOT EXISTS (SELECT 1 FROM students s JOIN class_tokens t ON t.id = s.token_id WHERE s.id = _student_id AND t.active) THEN
    RAISE EXCEPTION 'Sesi tidak valid';
  END IF;
  INSERT INTO activities(student_id, kind, score, payload) VALUES (_student_id, _kind, _score, coalesce(_payload, '{}'::jsonb));
END $$;

REVOKE ALL ON FUNCTION public.student_join(text, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.record_activity(uuid, text, int, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.student_join(text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_activity(uuid, text, int, jsonb) TO anon, authenticated;