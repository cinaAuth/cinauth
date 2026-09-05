CREATE TABLE public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  buyer_email text not null,
  store_id uuid not null references public.stores(id) on delete cascade,
  stripe_subscription_id text not null unique,
  stripe_customer_id text not null,
  product_id text not null,
  price_id text not null,
  status text not null default 'active',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean default false,
  environment text not null default 'sandbox',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_store_id ON public.subscriptions(store_id);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Buyers can view own subscription" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Store owners can view store subscriptions" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = (SELECT stores.user_id FROM public.stores WHERE stores.id = subscriptions.store_id));

CREATE TABLE public.notifications (
  id uuid primary key default gen_random_uuid(),
  store_id uuid not null references public.stores(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null default 'sale',
  title text not null,
  message text not null,
  order_id uuid references public.orders(id) on delete set null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id, read);
GRANT SELECT, UPDATE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can mark own notifications read" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.products ADD COLUMN billing_interval text;
ALTER TABLE public.orders ADD COLUMN buyer_user_id uuid references auth.users(id) on delete set null;
ALTER TABLE public.orders ADD COLUMN stripe_subscription_id text;

CREATE POLICY "Buyers can view own orders" ON public.orders FOR SELECT TO authenticated USING (auth.uid() = buyer_user_id);
CREATE POLICY "Buyers can view own order items" ON public.order_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders WHERE orders.id = order_items.order_id AND orders.buyer_user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid, check_env text default 'live')
RETURNS boolean LANGUAGE sql SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions
    WHERE user_id = user_uuid
    AND environment = check_env
    AND (
      (status IN ('active', 'trialing') AND (current_period_end IS NULL OR current_period_end > now()))
      OR (status = 'canceled' AND current_period_end > now())
    )
  );
$$;