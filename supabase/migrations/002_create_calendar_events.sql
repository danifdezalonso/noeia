-- Generic calendar events table (all categories)
-- Run this in your Supabase SQL editor (https://app.supabase.com → SQL Editor)

create table if not exists calendar_events (
  id                     text primary key,
  title                  text not null,
  start_time             text not null,
  end_time               text not null,
  category               text not null check (category in ('session','ooo','meeting','task','focus','appointment','documentation')),
  all_day                boolean default false,
  -- common
  location               text,
  recurrence             text default 'none',
  done                   boolean default false,
  description            text,
  notification           integer,
  visibility             text default 'default',
  deadline               text,
  color                  text,
  -- session
  patient_id             text,
  patient_name           text,
  modality               text,
  meeting_link           text,
  session_type           text,
  cancelled              boolean default false,
  cancellation_reason    text,
  notify_patient         boolean default false,
  notify_patient_minutes integer,
  -- ooo
  decline_mode           text,
  ooo_message            text,
  -- focus
  focus_dnd              boolean default false,
  focus_decline_invites  boolean default false,
  -- appointment slots
  appointment_duration   integer,
  booking_link           text,
  -- documentation
  linked_session_id      text,
  -- org / doctor
  doctor_id              text,
  doctor_name            text,
  created_at             timestamptz default now(),
  updated_at             timestamptz default now()
);

create or replace function update_calendar_events_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger calendar_events_updated_at
  before update on calendar_events
  for each row execute procedure update_calendar_events_updated_at();

alter table calendar_events enable row level security;
create policy "allow all for now" on calendar_events for all using (true) with check (true);
