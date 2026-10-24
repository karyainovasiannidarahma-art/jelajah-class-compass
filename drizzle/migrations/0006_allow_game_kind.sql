CREATE OR REPLACE FUNCTION public.record_activity(_student_id uuid, _kind text, _score integer, _payload jsonb)
 RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
BEGIN
  IF _kind NOT IN ('diagnostik','level-1','level-2','level-3','uji','refleksi','asesmen','prasyarat-b','modul-b','game') THEN RAISE EXCEPTION 'bad kind'; END IF;
  IF NOT EXISTS (SELECT 1 FROM students s JOIN class_tokens t ON t.id = s.token_id WHERE s.id = _student_id AND t.active) THEN
    RAISE EXCEPTION 'Sesi tidak valid';
  END IF;
  INSERT INTO activities(student_id, kind, score, payload) VALUES (_student_id, _kind, _score, coalesce(_payload, '{}'::jsonb));
END $function$;