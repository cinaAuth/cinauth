-- Categories per store
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  store_id uuid references public.stores(id) on delete cascade not null,
  name text not null,
  slug text not null,
  created_at timestamptz not null default now(),
  unique (store_id, slug)
);
grant select on public.categories to anon;
grant select on public.categories to authenticated;
grant all on public.categories to service_role;
alter table public.categories enable row level security;
create policy "Public can read categories" on public.categories for select to anon, authenticated using (true);
create policy "Store owners manage categories" on public.categories for all to authenticated
  using (exists (select 1 from public.stores s where s.id = categories.store_id and s.user_id = auth.uid()))
  with check (exists (select 1 from public.stores s where s.id = categories.store_id and s.user_id = auth.uid()));

-- Products get an optional category
alter table public.products add column if not exists category_id uuid references public.categories(id) on delete set null;

-- Reviews (one per buyer per product)
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade not null,
  store_id uuid references public.stores(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  rating smallint not null check (rating between 1 and 5),
  comment text,
  verified_purchase boolean not null default false,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
grant select on public.reviews to anon;
grant select, insert, update, delete on public.reviews to authenticated;
grant all on public.reviews to service_role;
alter table public.reviews enable row level security;
create policy "Public can read reviews" on public.reviews for select to anon, authenticated using (true);
create policy "Users manage own reviews" on public.reviews for insert to authenticated with check (user_id = auth.uid());
create policy "Users update own reviews" on public.reviews for update to authenticated using (user_id = auth.uid());
create policy "Users delete own reviews" on public.reviews for delete to authenticated using (user_id = auth.uid());

-- Wishlist
create table public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete cascade not null,
  created_at timestamptz not null default now(),
  unique (user_id, product_id)
);
grant select, insert, delete on public.wishlists to authenticated;
grant all on public.wishlists to service_role;
alter table public.wishlists enable row level security;
create policy "Users read own wishlist" on public.wishlists for select to authenticated using (user_id = auth.uid());
create policy "Users add to own wishlist" on public.wishlists for insert to authenticated with check (user_id = auth.uid());
create policy "Users remove from own wishlist" on public.wishlists for delete to authenticated using (user_id = auth.uid());