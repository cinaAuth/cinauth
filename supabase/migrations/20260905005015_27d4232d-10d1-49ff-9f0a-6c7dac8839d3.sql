REVOKE EXECUTE ON FUNCTION public.get_public_products(text, text, integer) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_products(text, text, integer) TO service_role;