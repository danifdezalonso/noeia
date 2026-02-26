import type { CalendarEvent } from './useCalendar'

// ── DB ↔ CalendarEvent mapping ────────────────────────────────────────────────
function toRow(e: CalendarEvent) {
  return {
    id:                      e.id,
    title:                   e.title,
    start_time:              e.start,
    end_time:                e.end,
    category:                e.category,
    all_day:                 e.allDay            ?? false,
    location:                e.location          ?? null,
    recurrence:              e.recurrence        ?? 'none',
    done:                    e.done              ?? false,
    description:             e.description       ?? null,
    notification:            e.notification      ?? null,
    visibility:              e.visibility        ?? 'default',
    deadline:                e.deadline          ?? null,
    color:                   e.color             ?? null,
    // session
    patient_id:              e.patientId         ?? null,
    patient_name:            e.patientName       ?? null,
    modality:                e.modality          ?? null,
    meeting_link:            e.meetingLink       ?? null,
    session_type:            e.sessionType       ?? null,
    cancelled:               e.cancelled         ?? false,
    cancellation_reason:     e.cancellationReason ?? null,
    notify_patient:          e.notifyPatient     ?? false,
    notify_patient_minutes:  e.notifyPatientMinutes ?? null,
    // ooo
    decline_mode:            e.declineMode       ?? null,
    ooo_message:             e.oooMessage        ?? null,
    // focus
    focus_dnd:               e.focusDnd          ?? false,
    focus_decline_invites:   e.focusDeclineInvites ?? false,
    // appointment
    appointment_duration:    e.appointmentDuration ?? null,
    booking_link:            e.bookingLink       ?? null,
    // documentation
    linked_session_id:       e.linkedSessionId   ?? null,
    // org / doctor
    doctor_id:               e.doctorId          ?? null,
    doctor_name:             e.doctorName        ?? null,
  }
}

function fromRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id:                    row.id as string,
    title:                 row.title as string,
    start:                 row.start_time as string,
    end:                   row.end_time as string,
    category:              row.category as CalendarEvent['category'],
    allDay:                (row.all_day as boolean)          ?? false,
    location:              (row.location as string)          || undefined,
    recurrence:            (row.recurrence as CalendarEvent['recurrence']) ?? 'none',
    done:                  (row.done as boolean)             ?? false,
    description:           (row.description as string)       || undefined,
    notification:          (row.notification as number)      ?? undefined,
    visibility:            (row.visibility as CalendarEvent['visibility']) ?? 'default',
    deadline:              (row.deadline as string)          || undefined,
    color:                 (row.color as string)             || undefined,
    // session
    patientId:             (row.patient_id as string)        || undefined,
    patientName:           (row.patient_name as string)      || undefined,
    modality:              (row.modality as 'online' | 'inperson') || undefined,
    meetingLink:           (row.meeting_link as string)      || undefined,
    sessionType:           (row.session_type as string)      || undefined,
    cancelled:             (row.cancelled as boolean)        ?? false,
    cancellationReason:    (row.cancellation_reason as string) || undefined,
    notifyPatient:         (row.notify_patient as boolean)   ?? false,
    notifyPatientMinutes:  (row.notify_patient_minutes as number) || undefined,
    // ooo
    declineMode:           (row.decline_mode as CalendarEvent['declineMode']) || undefined,
    oooMessage:            (row.ooo_message as string)       || undefined,
    // focus
    focusDnd:              (row.focus_dnd as boolean)        ?? false,
    focusDeclineInvites:   (row.focus_decline_invites as boolean) ?? false,
    // appointment
    appointmentDuration:   (row.appointment_duration as number) || undefined,
    bookingLink:           (row.booking_link as string)      || undefined,
    // documentation
    linkedSessionId:       (row.linked_session_id as string) || undefined,
    // org / doctor
    doctorId:              (row.doctor_id as string)         || undefined,
    doctorName:            (row.doctor_name as string)       || undefined,
  }
}

// ── Composable ────────────────────────────────────────────────────────────────
export const useEventsDb = () => {
  async function upsertEvent(event: CalendarEvent): Promise<void> {
    const client = useSupabase()
    if (!client) { console.warn('[events] skipping upsert – Supabase client not available'); return }
    const { error } = await client.from('calendar_events').upsert(toRow(event))
    if (error) console.error('[events] upsert error:', error.message)
  }

  async function removeEvent(id: string): Promise<void> {
    const client = useSupabase()
    if (!client) return
    const { error } = await client.from('calendar_events').delete().eq('id', id)
    if (error) console.error('[events] delete error:', error.message)
  }

  async function fetchEvents(): Promise<CalendarEvent[]> {
    const client = useSupabase()
    if (!client) return []
    const { data, error } = await client
      .from('calendar_events')
      .select('*')
      .order('start_time')
    if (error) { console.error('[events] fetch error:', error.message); return [] }
    return (data ?? []).map(fromRow)
  }

  return { upsertEvent, removeEvent, fetchEvents }
}
