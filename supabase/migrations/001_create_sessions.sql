-- Sessions table
-- Run this in your Supabase SQL editor (https://app.supabase.com → SQL Editor)

create table if not exists sessions (
  id                    text primary key,
  title                 text not null,
  start_time            text not null,  -- local ISO "YYYY-MM-DDTHH:mm:ss"
  end_time              text not null,
  patient_id            text,
  patient_name          text,
  modality              text default 'online' check (modality in ('online', 'inperson')),
  location              text,
  session_type          text,
  cancelled             boolean default false,
  cancellation_reason   text,
  notify_patient        boolean default false,
  notify_patient_minutes integer,
  doctor_id             text,
  doctor_name           text,
  recurrence            text default 'none' check (recurrence in ('none', 'weekly', 'biweekly', 'monthly')),
  description           text,
  meeting_link          text,
  all_day               boolean default false,
  color                 text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger sessions_updated_at
  before update on sessions
  for each row execute procedure update_updated_at();

-- Enable Row Level Security (add policies as needed when you add auth)
alter table sessions enable row level security;

-- Allow all operations while unauthenticated (remove once you add auth)
create policy "allow all for now" on sessions for all using (true) with check (true);
