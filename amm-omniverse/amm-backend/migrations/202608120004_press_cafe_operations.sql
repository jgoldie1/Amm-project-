-- Kingdoms Press operating workflow + AI Cafe order system

create table if not exists public.publication_rights (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  rights_scope text not null default 'creator-owned',
  territories text[] not null default array['worldwide'],
  formats text[] not null default array['ebook'],
  adaptation_allowed boolean not null default false,
  agreement_status text not null default 'draft' check (agreement_status in ('draft','review','accepted','expired','terminated')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.editorial_tasks (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid not null references public.publications(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  task_type text not null check (task_type in ('developmental-edit','copy-edit','source-check','rights-review','accessibility','translation','formatting','audio','interactive-adaptation')),
  status text not null default 'todo' check (status in ('todo','in-progress','blocked','complete')),
  notes text not null default '',
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.book_circle_selections (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid references public.publications(id) on delete set null,
  category text not null,
  title text not null,
  status text not null default 'nominated' check (status in ('nominated','selected','featured','archived')),
  starts_at timestamptz,
  ends_at timestamptz,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.author_events (
  id uuid primary key default gen_random_uuid(),
  publication_id uuid references public.publications(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null default 'reading',
  title text not null,
  venue_type text not null default 'virtual' check (venue_type in ('virtual','ai-cafe','living-world','hybrid')),
  starts_at timestamptz not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.cafe_menu_items (
  id uuid primary key default gen_random_uuid(),
  cafe_id uuid not null references public.cafe_locations(id) on delete cascade,
  item_key text not null,
  name text not null,
  category text not null,
  description text not null default '',
  price numeric not null check (price >= 0),
  active boolean not null default true,
  ingredients jsonb not null default '[]'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  unique(cafe_id,item_key)
);

create table if not exists public.cafe_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  cafe_id uuid not null references public.cafe_locations(id) on delete cascade,
  status text not null default 'placed' check (status in ('placed','preparing','ready','completed','cancelled')),
  items jsonb not null default '[]'::jsonb,
  subtotal numeric not null default 0,
  simulation boolean not null default true,
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

alter table public.publication_rights enable row level security;
alter table public.editorial_tasks enable row level security;
alter table public.book_circle_selections enable row level security;
alter table public.author_events enable row level security;
alter table public.cafe_menu_items enable row level security;
alter table public.cafe_orders enable row level security;

create policy "owners manage publication rights" on public.publication_rights for all using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "owners manage editorial tasks" on public.editorial_tasks for all using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "public read book circle" on public.book_circle_selections for select using (status in ('selected','featured'));
create policy "public read author events" on public.author_events for select using (true);
create policy "owners create author events" on public.author_events for insert with check ((select auth.uid())=owner_id);
create policy "owners update author events" on public.author_events for update using ((select auth.uid())=owner_id) with check ((select auth.uid())=owner_id);
create policy "public read cafe menu" on public.cafe_menu_items for select using (active=true);
create policy "users manage own cafe orders" on public.cafe_orders for all using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);

insert into public.cafe_menu_items(cafe_id,item_key,name,category,description,price,ingredients)
select id,'free-market-drip','Free Market Coffee','coffee','House coffee for Creator Tables and everyday guests.',4.50,'["coffee","water"]'::jsonb from public.cafe_locations where slug='ai-cafe-chicago-digital'
on conflict(cafe_id,item_key) do update set name=excluded.name,price=excluded.price;
insert into public.cafe_menu_items(cafe_id,item_key,name,category,description,price,ingredients)
select id,'creator-latte','Creator Latte','coffee','Espresso and milk; alternate milk can be selected in the final ordering UI.',5.75,'["espresso","milk"]'::jsonb from public.cafe_locations where slug='ai-cafe-chicago-digital'
on conflict(cafe_id,item_key) do update set name=excluded.name,price=excluded.price;
insert into public.cafe_menu_items(cafe_id,item_key,name,category,description,price,ingredients)
select id,'earth-breakfast','Earth Kitchen Breakfast','food','Breakfast plate used in the restaurant operations simulation.',11.00,'["eggs","grain","fruit"]'::jsonb from public.cafe_locations where slug='ai-cafe-chicago-digital'
on conflict(cafe_id,item_key) do update set name=excluded.name,price=excluded.price;
insert into public.cafe_menu_items(cafe_id,item_key,name,category,description,price,ingredients)
select id,'global-bowl','Global Kitchen Bowl','food','Rotating globally inspired meal slot for local operators.',14.00,'["grain","vegetables","protein"]'::jsonb from public.cafe_locations where slug='ai-cafe-chicago-digital'
on conflict(cafe_id,item_key) do update set name=excluded.name,price=excluded.price;
