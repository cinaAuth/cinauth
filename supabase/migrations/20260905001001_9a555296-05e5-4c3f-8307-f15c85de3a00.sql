ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS order_number text,
  ADD COLUMN IF NOT EXISTS platform_fee numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seller_earnings numeric NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS delivered_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'sandbox';

UPDATE public.orders SET order_number = upper(substr(replace(id::text, '-', ''), 1, 10)) WHERE order_number IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS orders_order_number_key ON public.orders(order_number);
CREATE INDEX IF NOT EXISTS orders_store_id_idx ON public.orders(store_id);
CREATE INDEX IF NOT EXISTS orders_stripe_session_id_idx ON public.orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS order_items_order_id_idx ON public.order_items(order_id);

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS delivery_content text;

DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();