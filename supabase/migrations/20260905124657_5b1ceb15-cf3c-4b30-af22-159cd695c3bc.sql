CREATE TABLE public.store_payment_methods (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  method_key TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (store_id, method_key)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.store_payment_methods TO authenticated;
GRANT SELECT ON public.store_payment_methods TO anon;
GRANT ALL ON public.store_payment_methods TO service_role;

ALTER TABLE public.store_payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view enabled store payment methods"
ON public.store_payment_methods FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Store owners manage their payment methods"
ON public.store_payment_methods FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.stores s WHERE s.id = store_id AND s.user_id = auth.uid()));

CREATE TRIGGER update_store_payment_methods_updated_at
BEFORE UPDATE ON public.store_payment_methods
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();