DROP POLICY IF EXISTS "Active product catalog is public" ON public.products;
REVOKE SELECT ON public.products FROM anon;

CREATE OR REPLACE FUNCTION public.get_public_products(
  store_slug text DEFAULT NULL,
  product_slug text DEFAULT NULL,
  result_limit integer DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  store_id uuid,
  name text,
  slug text,
  description text,
  price numeric,
  currency text,
  product_type text,
  billing_interval text,
  is_active boolean,
  created_at timestamptz,
  store_name text,
  store_slug_result text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.store_id,
    p.name,
    p.slug,
    p.description,
    p.price,
    p.currency,
    p.product_type,
    p.billing_interval,
    p.is_active,
    p.created_at,
    s.name,
    s.slug
  FROM public.products p
  JOIN public.stores s ON s.id = p.store_id
  WHERE p.is_active = true
    AND s.is_active = true
    AND (store_slug IS NULL OR s.slug = store_slug)
    AND (product_slug IS NULL OR p.slug = product_slug)
  ORDER BY p.created_at DESC
  LIMIT LEAST(GREATEST(result_limit, 1), 100);
$$;

REVOKE ALL ON FUNCTION public.get_public_products(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_public_products(text, text, integer) TO anon, authenticated, service_role;