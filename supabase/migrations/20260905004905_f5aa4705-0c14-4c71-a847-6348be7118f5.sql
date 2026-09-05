REVOKE SELECT ON public.products FROM anon;

DROP POLICY IF EXISTS "Products are public readable" ON public.products;

CREATE POLICY "Active product catalog is public"
ON public.products
FOR SELECT
TO anon
USING (is_active = true);

CREATE POLICY "Paid buyers can read purchased products"
ON public.products
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.order_items oi
    JOIN public.orders o ON o.id = oi.order_id
    WHERE oi.product_id = products.id
      AND o.buyer_user_id = auth.uid()
      AND o.status = 'paid'
  )
);

CREATE OR REPLACE VIEW public.public_products
WITH (security_barrier = true)
AS
SELECT
  id,
  store_id,
  name,
  slug,
  description,
  price,
  currency,
  product_type,
  is_active,
  created_at,
  updated_at,
  billing_interval
FROM public.products
WHERE is_active = true;

REVOKE ALL ON public.public_products FROM PUBLIC;
GRANT SELECT ON public.public_products TO anon, authenticated;
GRANT ALL ON public.public_products TO service_role;