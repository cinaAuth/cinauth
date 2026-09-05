CREATE TABLE public.store_page_views (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  path text not null,
  visitor_id text not null,
  session_id text not null,
  referrer text,
  browser text,
  os text,
  device text,
  country text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  created_at timestamptz not null default now()
);

CREATE INDEX store_page_views_store_created_idx ON public.store_page_views (store_id, created_at DESC);

GRANT SELECT, INSERT ON public.store_page_views TO anon;
GRANT SELECT, INSERT ON public.store_page_views TO authenticated;
GRANT ALL ON public.store_page_views TO service_role;

ALTER TABLE public.store_page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can record a page view"
ON public.store_page_views FOR INSERT TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Store owners can read their page views"
ON public.store_page_views FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()));