CREATE TABLE public.platform_facts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  position INTEGER NOT NULL UNIQUE,
  title TEXT NOT NULL DEFAULT '',
  content TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.platform_facts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.platform_facts TO authenticated;
GRANT ALL ON public.platform_facts TO service_role;

ALTER TABLE public.platform_facts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view platform facts" ON public.platform_facts FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can insert platform facts" ON public.platform_facts FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update platform facts" ON public.platform_facts FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete platform facts" ON public.platform_facts FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER platform_facts_updated_at BEFORE UPDATE ON public.platform_facts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.platform_facts (position, title, content) VALUES
  (1, '', ''),
  (2, '', ''),
  (3, '', ''),
  (4, '', ''),
  (5, '', ''),
  (6, '', ''),
  (7, '', ''),
  (8, '', '');