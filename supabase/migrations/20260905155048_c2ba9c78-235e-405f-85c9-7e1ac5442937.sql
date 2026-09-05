CREATE TABLE public.store_storefront (
  store_id UUID PRIMARY KEY REFERENCES public.stores(id) ON DELETE CASCADE,
  blocks JSONB NOT NULL DEFAULT '[]'::jsonb,
  settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.store_storefront TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_storefront TO authenticated;
GRANT ALL ON public.store_storefront TO service_role;

ALTER TABLE public.store_storefront ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view storefront layouts"
ON public.store_storefront FOR SELECT
USING (true);

CREATE POLICY "Owners manage their storefront layout"
ON public.store_storefront FOR ALL
TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()));