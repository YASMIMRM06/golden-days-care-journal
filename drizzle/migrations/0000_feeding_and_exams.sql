CREATE OR REPLACE FUNCTION public.is_approved(_user_id uuid) RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = _user_id AND status = 'approved');
$$;

CREATE TABLE public.feeding_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idoso_id text NOT NULL,
  idoso_nome text NOT NULL DEFAULT '',
  tipo text NOT NULL DEFAULT '',
  formula text NOT NULL DEFAULT '',
  quantidade_ml numeric,
  horario text NOT NULL DEFAULT '',
  frequencia text NOT NULL DEFAULT '',
  administracao text NOT NULL DEFAULT '',
  observacoes text NOT NULL DEFAULT '',
  data_inicio date,
  data_fim date,
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feeding_records TO authenticated;
GRANT ALL ON public.feeding_records TO service_role;
ALTER TABLE public.feeding_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved users manage feeding" ON public.feeding_records FOR ALL TO authenticated
  USING (public.is_approved(auth.uid())) WITH CHECK (public.is_approved(auth.uid()));
CREATE TRIGGER feeding_records_updated_at BEFORE UPDATE ON public.feeding_records FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.medical_exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  idoso_id text NOT NULL,
  nome text NOT NULL,
  tipo text NOT NULL DEFAULT '',
  data_exame date,
  descricao text NOT NULL DEFAULT '',
  file_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text NOT NULL DEFAULT '',
  created_by uuid DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.medical_exams TO authenticated;
GRANT ALL ON public.medical_exams TO service_role;
ALTER TABLE public.medical_exams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Approved users manage exams" ON public.medical_exams FOR ALL TO authenticated
  USING (public.is_approved(auth.uid())) WITH CHECK (public.is_approved(auth.uid()));