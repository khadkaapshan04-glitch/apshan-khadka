-- ================================================================
-- Flavoré Restaurant: Supabase Database Schema
-- Run this SQL in the Supabase SQL Editor (Dashboard → SQL Editor)
-- ================================================================

-- ─── 1. Profiles Table ───
-- Linked to auth.users; stores app-specific role info
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text unique not null,
  full_name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'staff', 'admin')),
  created_at timestamptz not null default now()
);

create schema if not exists private;

-- Auto-create a profile row on user signup
create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    'customer'
  )
  on conflict (id) do update set
    email = excluded.email,
    full_name = coalesce(nullif(public.profiles.full_name, ''), excluded.full_name),
    role = coalesce(public.profiles.role, 'customer');
  return new;
end;
$$;

-- Drop trigger if exists and recreate
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();


-- ─── 2. Menu Items Table ───
create table if not exists public.menu_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text not null default '',
  price numeric not null default 0,
  category text not null default 'Starters',
  image_url text not null default '',
  is_available boolean not null default true,
  created_at timestamptz not null default now()
);


-- ─── 3. Restaurant Tables ───
create table if not exists public.restaurant_tables (
  id uuid primary key default gen_random_uuid(),
  number text not null,
  capacity integer not null default 2,
  type text not null default 'standard',
  position_x numeric not null default 0,
  position_y numeric not null default 0,
  created_at timestamptz not null default now()
);


-- ─── 4. Orders Table ───
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null default '',
  customer_email text not null default '',
  items jsonb not null default '[]'::jsonb,
  status text not null default 'pending',
  total numeric not null default 0,
  type text not null default 'dine-in',
  table_number text,
  delivery_address text,
  delivery_phone text,
  delivery_notes text,
  estimated_delivery timestamptz,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);


-- ─── 5. Reservations Table ───
create table if not exists public.reservations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text not null default '',
  date date not null,
  time time not null,
  guests integer not null default 1,
  status text not null default 'pending',
  table_id uuid references public.restaurant_tables(id) on delete set null,
  table_number text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);


-- ─── 6. Helper Function: Get User Role ───
create or replace function private.get_user_role()
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  user_role text;
begin
  select role into user_role
  from public.profiles
  where id = (select auth.uid());
  return coalesce(user_role, 'customer');
end;
$$;

create or replace function private.is_admin_or_staff()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role in ('admin', 'staff')
  );
end;
$$;

create or replace function private.is_admin()
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'admin'
  );
end;
$$;

revoke all on function private.get_user_role() from public;
revoke all on function private.is_admin_or_staff() from public;
revoke all on function private.is_admin() from public;
revoke all on function private.handle_new_user() from public;
grant usage on schema private to authenticated;
grant execute on function private.get_user_role() to authenticated;
grant execute on function private.is_admin_or_staff() to authenticated;
grant execute on function private.is_admin() to authenticated;


-- ================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================

-- ─── Profiles RLS ───
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = (select auth.uid()));

create policy "Admin can view all profiles"
  on public.profiles for select
  to authenticated
  using (private.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (id = (select auth.uid()))
  with check (
    id = (select auth.uid())
    and role = private.get_user_role()
  );


-- ─── Menu Items RLS ───
alter table public.menu_items enable row level security;

-- Everyone (including anonymous) can read menu items
create policy "Anyone can view menu items"
  on public.menu_items for select
  to anon, authenticated
  using (true);

create policy "Admin can insert menu items"
  on public.menu_items for insert
  to authenticated
  with check (private.is_admin());

create policy "Admin can update menu items"
  on public.menu_items for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admin can delete menu items"
  on public.menu_items for delete
  to authenticated
  using (private.is_admin());


-- ─── Restaurant Tables RLS ───
alter table public.restaurant_tables enable row level security;

-- Everyone can read tables (needed for booking flow)
create policy "Anyone can view tables"
  on public.restaurant_tables for select
  to anon, authenticated
  using (true);

create policy "Admin can insert tables"
  on public.restaurant_tables for insert
  to authenticated
  with check (private.is_admin());

create policy "Admin can update tables"
  on public.restaurant_tables for update
  to authenticated
  using (private.is_admin())
  with check (private.is_admin());

create policy "Admin can delete tables"
  on public.restaurant_tables for delete
  to authenticated
  using (private.is_admin());


-- ─── Orders RLS ───
alter table public.orders enable row level security;

-- Admin/staff can view all orders
create policy "Admin and staff can view all orders"
  on public.orders for select
  to authenticated
  using (private.is_admin_or_staff());

-- Customers can view their own orders
create policy "Customers can view own orders"
  on public.orders for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Authenticated users can create orders
create policy "Authenticated users can create orders"
  on public.orders for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Admin/staff can update orders (status changes)
create policy "Admin and staff can update orders"
  on public.orders for update
  to authenticated
  using (private.is_admin_or_staff())
  with check (private.is_admin_or_staff());

-- Admin can delete orders
create policy "Admin can delete orders"
  on public.orders for delete
  to authenticated
  using (private.is_admin());


-- ─── Reservations RLS ───
alter table public.reservations enable row level security;

-- Admin/staff can view all reservations
create policy "Admin and staff can view all reservations"
  on public.reservations for select
  to authenticated
  using (private.is_admin_or_staff());

-- Customers can view their own reservations
create policy "Customers can view own reservations"
  on public.reservations for select
  to authenticated
  using (user_id = (select auth.uid()));

-- Authenticated users can create reservations
create policy "Authenticated users can create reservations"
  on public.reservations for insert
  to authenticated
  with check (user_id = (select auth.uid()));

-- Admin/staff can update reservations
create policy "Admin and staff can update reservations"
  on public.reservations for update
  to authenticated
  using (private.is_admin_or_staff())
  with check (private.is_admin_or_staff());

-- Users can update own reservations (e.g. cancel)
create policy "Users can update own reservations"
  on public.reservations for update
  to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Admin can delete reservations
create policy "Admin can delete reservations"
  on public.reservations for delete
  to authenticated
  using (private.is_admin());
