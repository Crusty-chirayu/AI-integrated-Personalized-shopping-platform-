create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  phone text,
  avatar_url text,
  role text not null default 'customer' check (role in ('customer','admin')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.site_settings (
  id uuid primary key default uuid_generate_v4(),
  site_name text default 'Atelier',
  tagline text,
  logo_url text,
  logo_inverted_url text,
  favicon_url text,
  contact_email text,
  contact_phone text,
  business_address text,
  currency_code text default 'USD',
  currency_symbol text default '$',
  tax_rate numeric default 0,
  tax_inclusive boolean default false,
  announcement_bar_active boolean default false,
  announcement_bar_text text,
  announcement_bar_link text,
  announcement_bar_color text,
  social_instagram text,
  social_facebook text,
  social_twitter text,
  social_tiktok text,
  social_youtube text,
  updated_at timestamptz default now()
);

create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  description text,
  image_url text,
  parent_id uuid references public.categories(id) on delete set null,
  sort_order integer default 0,
  created_at timestamptz default now()
);

create table if not exists public.products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description text,
  category_id uuid references public.categories(id) on delete set null,
  price numeric not null default 0,
  sale_price numeric,
  sale_start timestamptz,
  sale_end timestamptz,
  sku text unique,
  stock_quantity integer default 0,
  track_inventory boolean default true,
  allow_backorders boolean default false,
  status text default 'active' check (status in ('draft','active')),
  meta_title text,
  meta_description text,
  og_image_url text,
  tags text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  image_url text not null,
  sort_order integer default 0,
  alt_text text
);

create table if not exists public.addresses (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  address_line1 text,
  address_line2 text,
  city text,
  state text,
  zip text,
  country text,
  is_default boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text unique,
  user_id uuid references auth.users(id) on delete set null,
  email text,
  shipping_address jsonb,
  billing_address jsonb,
  shipping_method text,
  shipping_cost numeric default 0,
  subtotal numeric default 0,
  discount_amount numeric default 0,
  tax_amount numeric default 0,
  total numeric default 0,
  coupon_code text,
  payment_status text default 'pending' check (payment_status in ('pending','paid','failed','refunded')),
  fulfillment_status text default 'pending' check (fulfillment_status in ('pending','processing','shipped','delivered','cancelled')),
  razorpay_order_id text,
  razorpay_payment_id text,
  tracking_number text,
  tracking_carrier text,
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid,
  title text,
  variant_info jsonb,
  quantity integer default 1,
  unit_price numeric default 0,
  line_total numeric default 0
);

create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  rating integer check (rating between 1 and 5),
  title text,
  body text,
  is_verified boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.coupons (
  id uuid primary key default uuid_generate_v4(),
  code text unique not null,
  type text check (type in ('percentage','fixed')),
  value numeric not null,
  min_order_amount numeric default 0,
  usage_limit integer,
  per_customer_limit integer,
  times_used integer default 0,
  valid_from timestamptz,
  valid_to timestamptz,
  applicable_products uuid[],
  applicable_categories uuid[],
  is_active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  created_at timestamptz default now()
);

create table if not exists public.contacts (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  email text not null,
  message text not null,
  created_at timestamptz default now()
);

create table if not exists public.hero_slides (
  id uuid primary key default uuid_generate_v4(),
  image_url text,
  heading text,
  subheading text,
  cta_text text,
  cta_link text,
  sort_order integer default 0,
  is_active boolean default true
);

create table if not exists public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  product_id uuid references public.products(id) on delete cascade,
  created_at timestamptz default now(),
  unique (user_id, product_id)
);

create table if not exists public.media (
  id uuid primary key default uuid_generate_v4(),
  url text not null,
  filename text,
  size bigint,
  mime_type text,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz default now()
);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

create trigger products_set_updated_at
before update on public.products
for each row execute procedure public.set_updated_at();

create trigger orders_set_updated_at
before update on public.orders
for each row execute procedure public.set_updated_at();

alter table public.profiles enable row level security;
alter table public.site_settings enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.coupons enable row level security;
alter table public.subscribers enable row level security;
alter table public.hero_slides enable row level security;
alter table public.wishlist enable row level security;
alter table public.media enable row level security;

create policy "Public read access for products and categories" on public.products for select using (true);
create policy "Public read access for categories" on public.categories for select using (true);
create policy "Public read access for site settings" on public.site_settings for select using (true);
create policy "Public read access for reviews" on public.reviews for select using (true);
create policy "Public read access for coupons" on public.coupons for select using (true);

create policy "Users can manage own profile" on public.profiles
for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can manage own addresses" on public.addresses
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can manage own orders" on public.orders
for select using (auth.uid() = user_id or auth.role() = 'authenticated');
create policy "Users can create orders" on public.orders
for insert with check (auth.uid() = user_id or auth.role() = 'authenticated');

create policy "Users can manage own wishlist" on public.wishlist
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can create reviews" on public.reviews
for insert with check (auth.uid() is not null);

create policy "Admins can manage products" on public.products
for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage categories" on public.categories
for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage orders" on public.orders
for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage coupons" on public.coupons
for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage media" on public.media
for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage site settings" on public.site_settings
for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "Admins can manage hero slides" on public.hero_slides
for all using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
