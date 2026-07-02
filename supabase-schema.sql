create table if not exists products (
  id text primary key,
  name text not null,
  category text not null,
  price numeric(10,2) not null default 0,
  description text not null,
  image text not null,
  images jsonb not null default '[]'::jsonb,
  sizes jsonb not null default '[]'::jsonb,
  colors jsonb not null default '[]'::jsonb,
  featured boolean not null default false,
  in_stock boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id text primary key,
  items jsonb not null,
  customer jsonb not null,
  payment_method text not null,
  status text not null default 'pending',
  date timestamptz not null default now(),
  total numeric(10,2) not null default 0
);

alter table products enable row level security;
alter table orders enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Allow public read products'
  ) then
    create policy "Allow public read products"
      on products for select
      using (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'products' and policyname = 'Allow service role manage products'
  ) then
    create policy "Allow service role manage products"
      on products for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'Allow public insert orders'
  ) then
    create policy "Allow public insert orders"
      on orders for insert
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'orders' and policyname = 'Allow service role manage orders'
  ) then
    create policy "Allow service role manage orders"
      on orders for all
      using (auth.role() = 'service_role')
      with check (auth.role() = 'service_role');
  end if;
end $$;