DROP POLICY IF EXISTS "Anyone can view enabled store payment methods" ON public.store_payment_methods;

CREATE OR REPLACE VIEW public.store_payment_methods_public
WITH (security_invoker = off) AS
SELECT store_id, method_key
FROM public.store_payment_methods
WHERE enabled = true;

REVOKE ALL ON public.store_payment_methods FROM anon;
GRANT SELECT ON public.store_payment_methods_public TO anon, authenticated;