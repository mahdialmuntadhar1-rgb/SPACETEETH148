-- Enable helpers
create extension if not exists pgcrypto;

-- USERS
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null unique,
  avatar text,
  role text not null check (role in ('user','owner','admin')),
  business_id text,
  updated_at timestamptz default now()
);

-- BUSINESSES
create table if not exists public.businesses (
  id text primary key,
  name text not null,
  name_ar text,
  name_ku text,
  image_url text,
  cover_image text,
  is_premium boolean default false,
  is_featured boolean default false,
  category text not null,
  subcategory text,
  rating numeric default 0,
  status text,
  is_verified boolean default false,
  review_count integer default 0,
  governorate text not null,
  city text not null,
  address text,
  phone text,
  whatsapp text,
  website text,
  description text,
  description_ar text,
  description_ku text,
  open_hours text,
  price_range smallint,
  tags text[],
  lat double precision,
  lng double precision,
  owner_id uuid references auth.users(id)
);

-- POSTS
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  business_id text not null references public.businesses(id) on delete cascade,
  business_name text not null,
  business_avatar text not null,
  caption text not null,
  image_url text,
  created_at timestamptz not null default now(),
  likes integer not null default 0,
  is_verified boolean default false
);

-- LIKES
create table if not exists public.likes (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

-- BUSINESS POSTCARDS
create table if not exists public.business_postcards (
  id text primary key,
  title text not null,
  city text not null,
  neighborhood text not null,
  governorate text not null,
  category_tag text not null,
  phone text not null,
  website text,
  instagram text,
  hero_image text not null,
  image_gallery text[] not null,
  postcard_content text not null,
  google_maps_url text not null,
  rating numeric not null,
  review_count integer not null,
  verified boolean not null default false,
  updated_at timestamptz not null default now()
);

-- DEALS
create table if not exists public.deals (
  id text primary key,
  business_id text not null references public.businesses(id) on delete cascade,
  discount integer not null,
  business_logo text,
  title text not null,
  description text not null,
  expires_in text,
  claimed integer default 0,
  total integer not null,
  created_at timestamptz default now()
);

-- STORIES
create table if not exists public.stories (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  media text[] not null,
  type text not null check (type in ('business','community')),
  created_at timestamptz not null default now()
);

-- EVENTS
create table if not exists public.events (
  id text primary key,
  title text not null,
  date timestamptz not null,
  venue text not null,
  price integer not null,
  category text,
  governorate text
);

-- RLS
alter table public.users enable row level security;
alter table public.businesses enable row level security;
alter table public.posts enable row level security;
alter table public.likes enable row level security;
alter table public.business_postcards enable row level security;
alter table public.deals enable row level security;
alter table public.stories enable row level security;
alter table public.events enable row level security;

-- helper predicates
create or replace function public.is_admin() returns boolean language sql stable as $$
  select exists (
    select 1 from public.users u where u.id = auth.uid() and u.role = 'admin'
  ) or auth.jwt() ->> 'email' = 'safaribosafar@gmail.com';
$$;

create or replace function public.owns_business(target_business_id text) returns boolean language sql stable as $$
  select exists (
    select 1 from public.users u where u.id = auth.uid() and u.business_id = target_business_id
  );
$$;

-- USERS policies
create policy "users read authenticated" on public.users for select using (auth.uid() is not null);
create policy "users insert self" on public.users for insert with check (auth.uid() = id and role in ('user','owner'));
create policy "users update self role locked" on public.users for update using (auth.uid() = id) with check (auth.uid() = id and role = (select role from public.users where id = auth.uid()));
create policy "users admin full" on public.users for all using (public.is_admin()) with check (public.is_admin());

-- POSTS policies
create policy "posts read public" on public.posts for select using (true);
create policy "posts owner insert" on public.posts for insert with check (
  auth.uid() is not null and public.owns_business(business_id)
);
create policy "posts owner or admin update" on public.posts for update using (
  public.owns_business(business_id) or public.is_admin()
) with check (
  public.owns_business(business_id) or public.is_admin() or (likes >= 0)
);
create policy "posts owner or admin delete" on public.posts for delete using (
  public.owns_business(business_id) or public.is_admin()
);

-- BUSINESSES policies
create policy "businesses read public" on public.businesses for select using (true);
create policy "businesses admin create" on public.businesses for insert with check (public.is_admin());
create policy "businesses owner or admin update" on public.businesses for update using (owner_id = auth.uid() or public.is_admin()) with check (owner_id = auth.uid() or public.is_admin());
create policy "businesses admin delete" on public.businesses for delete using (public.is_admin());

-- LIKES policies
create policy "likes read public" on public.likes for select using (true);
create policy "likes create self" on public.likes for insert with check (auth.uid() = user_id and id = auth.uid()::text || '_' || post_id::text);
create policy "likes delete self" on public.likes for delete using (auth.uid()::text = split_part(id, '_', 1));

-- BUSINESS POSTCARDS policies
create policy "postcards read public" on public.business_postcards for select using (true);
create policy "postcards admin write" on public.business_postcards for all using (public.is_admin()) with check (public.is_admin());

-- DEALS policies
create policy "deals read public" on public.deals for select using (true);
create policy "deals owner or admin create" on public.deals for insert with check (public.is_admin() or public.owns_business(business_id));
create policy "deals owner or admin update" on public.deals for update using (public.is_admin() or public.owns_business(business_id)) with check (public.is_admin() or public.owns_business(business_id));
create policy "deals owner or admin delete" on public.deals for delete using (public.is_admin() or public.owns_business(business_id));

-- STORIES policies
create policy "stories read public" on public.stories for select using (true);
create policy "stories self create" on public.stories for insert with check (auth.uid() = user_id);
create policy "stories self or admin modify" on public.stories for update using (auth.uid() = user_id or public.is_admin()) with check (auth.uid() = user_id or public.is_admin());
create policy "stories self or admin delete" on public.stories for delete using (auth.uid() = user_id or public.is_admin());

-- EVENTS policies
create policy "events read public" on public.events for select using (true);
create policy "events admin write" on public.events for all using (public.is_admin()) with check (public.is_admin());
