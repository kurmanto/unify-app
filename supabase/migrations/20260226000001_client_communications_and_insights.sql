-- Client communications tracking table
create table if not exists client_communications (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  practitioner_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('email', 'reminder', 'intake_request', 'follow_up')),
  subject text not null,
  body_html text not null,
  sent_at timestamptz not null default now(),
  status text not null default 'sent' check (status in ('sent', 'delivered', 'failed', 'opened')),
  resend_message_id text,
  created_at timestamptz not null default now()
);

-- AI insight cache table
create table if not exists ai_insight_cache (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references clients(id) on delete cascade,
  practitioner_id uuid not null references auth.users(id) on delete cascade,
  insights jsonb not null default '{}'::jsonb,
  generated_at timestamptz not null default now(),
  soap_note_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (client_id, practitioner_id)
);

-- Indexes
create index idx_client_communications_client on client_communications(client_id);
create index idx_client_communications_practitioner on client_communications(practitioner_id);
create index idx_ai_insight_cache_client on ai_insight_cache(client_id);

-- RLS policies for client_communications
alter table client_communications enable row level security;

create policy "Practitioners can view own communications"
  on client_communications for select
  using (auth.uid() = practitioner_id);

create policy "Practitioners can insert own communications"
  on client_communications for insert
  with check (auth.uid() = practitioner_id);

create policy "Practitioners can update own communications"
  on client_communications for update
  using (auth.uid() = practitioner_id);

-- RLS policies for ai_insight_cache
alter table ai_insight_cache enable row level security;

create policy "Practitioners can view own insight cache"
  on ai_insight_cache for select
  using (auth.uid() = practitioner_id);

create policy "Practitioners can insert own insight cache"
  on ai_insight_cache for insert
  with check (auth.uid() = practitioner_id);

create policy "Practitioners can update own insight cache"
  on ai_insight_cache for update
  using (auth.uid() = practitioner_id);

create policy "Practitioners can delete own insight cache"
  on ai_insight_cache for delete
  using (auth.uid() = practitioner_id);
