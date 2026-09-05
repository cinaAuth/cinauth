DROP VIEW IF EXISTS public.public_products;

GRANT SELECT (id, store_id, name, slug, description, price, currency, product_type, is_active, created_at, updated_at, billing_interval) ON public.products TO anon;