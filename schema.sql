-- ============================================
-- SOLE OUTLET EGYPT — Supabase Schema
-- ============================================

-- PRODUCTS
create table products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  brand text not null,
  sizes text[] default '{}',
  original_price_egp numeric(10,2) not null,
  outlet_price_egp numeric(10,2) not null,
  image_url text not null,
  primary_color text,
  primary_color_hex text,
  in_stock boolean default true,
  featured boolean default false,
  created_at timestamptz default now()
);

-- ORDERS
create table orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique not null default ('ORD-' || upper(substring(gen_random_uuid()::text, 1, 8))),
  customer_name text not null,
  phone text not null,
  address text not null,
  city text not null,
  governorate text not null,
  items jsonb not null, -- [{product_id, title, size, outlet_price_egp, qty, image_url}]
  subtotal_egp numeric(10,2) not null,
  shipping_egp numeric(10,2) not null default 60,
  total_egp numeric(10,2) not null,
  payment_method text not null check (payment_method in ('cod', 'paymob')),
  paymob_order_id text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AUTO-UPDATE updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger orders_updated_at
  before update on orders
  for each row execute function update_updated_at();

-- RLS
alter table products enable row level security;
alter table orders enable row level security;

-- Products: public read
create policy "products_public_read" on products
  for select using (true);

-- Products: service role write only
create policy "products_service_write" on products
  for all using (auth.role() = 'service_role');

-- Orders: anyone can insert
create policy "orders_insert" on orders
  for insert with check (true);

-- Orders: service role full access
create policy "orders_service_all" on orders
  for all using (auth.role() = 'service_role');

-- SEED: migrate existing shoes.json data (Nike + NB, convert USD → EGP ~50x, outlet ~40% of original)
-- Run separately after importing your real inventory

-- INDEXES
create index products_brand_idx on products (brand);
create index products_in_stock_idx on products (in_stock);
create index orders_status_idx on orders (status);
create index orders_phone_idx on orders (phone);
