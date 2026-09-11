-- Reading Archive · Personal Writing Lab · Production schema
-- Run in Supabase SQL Editor. Keep Storage bucket PRIVATE.
create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Member',
  role text not null default 'member' check (role in ('member','admin')),
  invited_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists invitations (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  created_by uuid not null references auth.users(id),
  status text not null default 'unused' check (status in ('unused','used','revoked','expired')),
  invited_email text,
  used_by uuid references auth.users(id),
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists books (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, author text, status text not null default 'reading', progress numeric(5,2) not null default 0 check(progress between 0 and 100),
  current_page integer default 0, total_pages integer, last_read_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists reading_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid references books(id) on delete cascade, started_at timestamptz not null default now(), ended_at timestamptz, minutes integer default 0,
  pages_read integer default 0, created_at timestamptz not null default now()
);

create table if not exists excerpts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  book_id uuid references books(id) on delete set null, quote text not null, source text, why text, tags text[] not null default '{}', ai_analysis jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists ideas (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, body text not null default '', tags text[] not null default '{}', ai_analysis jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);

create table if not exists writings (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, status text not null default 'draft', content text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists exercises (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  writing_id uuid references writings(id) on delete set null, source_note_id uuid references excerpts(id) on delete set null,
  title text not null, prompt text, skill text, submission text not null default '', status text not null default '未完成', score numeric(3,2), ai_feedback jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table if not exists training_records (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  skill text not null, score numeric(3,2) not null check(score between 0 and 5), source_type text not null, source_id uuid, feedback jsonb, created_at timestamptz not null default now()
);
create table if not exists skill_profiles (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  skill text not null, mastery numeric(3,2) not null default 0 check(mastery between 0 and 5), ai_reason text, assessed_at timestamptz not null default now(),
  unique(user_id, skill)
);

-- Private uploaded manuscripts. Never make this Storage bucket public.
create table if not exists writing_documents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  writing_id uuid references writings(id) on delete set null,
  filename text not null, title text not null, format text not null check(format in ('TXT','DOCX','EPUB')),
  storage_bucket text not null default 'private-manuscripts', storage_path text not null,
  source_chars bigint not null default 0, chapter_count integer default 0, volume_count integer default 0, chunk_count integer default 0,
  status text not null default 'queued' check(status in ('queued','processing','completed','failed')),
  focus text, analysis_levels text[] not null default array['章节级','卷级','全书级'], error_message text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), analyzed_at timestamptz
);
create table if not exists document_chunks (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references writing_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, sequence_no integer not null, chapter_label text, volume_label text,
  char_count integer not null default 0, status text not null default 'queued' check(status in ('queued','processing','completed','failed')),
  analysis jsonb, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(document_id, sequence_no)
);
create table if not exists document_reports (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references writing_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, level text not null check(level in ('chapter','volume','book')),
  report jsonb not null default '{}', version integer not null default 1, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  unique(document_id, level, version)
);
create table if not exists analysis_jobs (
  id uuid primary key default gen_random_uuid(), document_id uuid not null references writing_documents(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade, job_type text not null, status text not null default 'queued', progress integer not null default 0,
  error_message text, started_at timestamptz, finished_at timestamptz, created_at timestamptz not null default now()
);

create table if not exists growth_records (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  period_type text not null check(period_type in ('month','quarter','year')), period_start date not null, period_end date not null,
  metrics jsonb not null default '{}', summary text, created_at timestamptz not null default now(), unique(user_id, period_type, period_start)
);

-- Automatic updated_at trigger.
create or replace function set_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end; $$;
do $$ declare t text; begin foreach t in array array['profiles','books','excerpts','ideas','writings','exercises','writing_documents','document_chunks','document_reports'] loop execute format('drop trigger if exists %I on %I', 'trg_'||t, t); execute format('create trigger %I before update on %I for each row execute function set_updated_at()', 'trg_'||t, t); end loop; end $$;

-- Helper for admin checks.
create or replace function is_admin(uid uuid) returns boolean language sql security definer set search_path=public stable as $$
  select exists(select 1 from profiles where id=uid and role='admin');
$$;

alter table profiles enable row level security; alter table invitations enable row level security; alter table books enable row level security;
alter table reading_sessions enable row level security; alter table excerpts enable row level security; alter table ideas enable row level security;
alter table writings enable row level security; alter table exercises enable row level security; alter table training_records enable row level security;
alter table skill_profiles enable row level security; alter table writing_documents enable row level security; alter table document_chunks enable row level security;
alter table document_reports enable row level security; alter table analysis_jobs enable row level security; alter table growth_records enable row level security;

-- Own-data policies.
create policy profiles_self on profiles for select using(auth.uid()=id);
create policy profiles_update_self on profiles for update using(auth.uid()=id) with check(auth.uid()=id);
create policy books_self on books for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy reading_sessions_self on reading_sessions for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy excerpts_self on excerpts for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy ideas_self on ideas for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy writings_self on writings for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy exercises_self on exercises for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy training_self on training_records for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy skills_self on skill_profiles for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy docs_self on writing_documents for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy chunks_self on document_chunks for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy reports_self on document_reports for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy jobs_self on analysis_jobs for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy growth_self on growth_records for all using(auth.uid()=user_id) with check(auth.uid()=user_id);

-- Admin can read/manage invitations. Invite redemption should be done server-side with service role.
create policy invitations_admin on invitations for all using(is_admin(auth.uid())) with check(is_admin(auth.uid()));

-- Storage: create a PRIVATE bucket named private-manuscripts in Storage UI, then add policies:
-- SELECT/INSERT/UPDATE/DELETE when (storage.foldername(name))[1] = auth.uid()::text.

-- Private Storage bucket + object policies.
insert into storage.buckets (id,name,public) values ('private-manuscripts','private-manuscripts',false) on conflict (id) do update set public=false;
drop policy if exists manuscript_select_own on storage.objects;
drop policy if exists manuscript_insert_own on storage.objects;
drop policy if exists manuscript_update_own on storage.objects;
drop policy if exists manuscript_delete_own on storage.objects;
create policy manuscript_select_own on storage.objects for select using(bucket_id='private-manuscripts' and (storage.foldername(name))[1]=auth.uid()::text);
create policy manuscript_insert_own on storage.objects for insert with check(bucket_id='private-manuscripts' and (storage.foldername(name))[1]=auth.uid()::text);
create policy manuscript_update_own on storage.objects for update using(bucket_id='private-manuscripts' and (storage.foldername(name))[1]=auth.uid()::text) with check(bucket_id='private-manuscripts' and (storage.foldername(name))[1]=auth.uid()::text);
create policy manuscript_delete_own on storage.objects for delete using(bucket_id='private-manuscripts' and (storage.foldername(name))[1]=auth.uid()::text);
