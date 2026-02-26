import type { CalendarEvent } from './useCalendar'

// ── DB ↔ CalendarEvent mapping ────────────────────────────────────────────────
function toRow(e: CalendarEvent) {
  return {
    id: e.id,
    title: e.title,
    start_time: e.start,
    end_time: e.end,
    patient_id: e.patientId ?? null,
    patient_name: e.patientName ?? null,
    modality: e.modality ?? 'online',
    location: e.location ?? null,
    session_type: e.sessionType ?? null,
    cancelled: e.cancelled ?? false,
    cancellation_reason: e.cancellationReason ?? null,
    notify_patient: e.notifyPatient ?? false,
    notify_patient_minutes: e.notifyPatientMinutes ?? null,
    doctor_id: e.doctorId ?? null,
    doctor_name: e.doctorName ?? null,
    recurrence: e.recurrence ?? 'none',
    description: e.description ?? null,
    meeting_link: e.meetingLink ?? null,
    all_day: e.allDay ?? false,
    color: e.color ?? null,
  }
}

function fromRow(row: Record<string, unknown>): CalendarEvent {
  return {
    id: row.id as string,
    title: row.title as string,
    start: row.start_time as string,
    end: row.end_time as string,
    category: 'session',
    patientId: (row.patient_id as string) || undefined,
    patientName: (row.patient_name as string) || undefined,
    modality: (row.modality as 'online' | 'inperson') ?? 'online',
    location: (row.location as string) || undefined,
    sessionType: (row.session_type as string) || undefined,
    cancelled: (row.cancelled as boolean) ?? false,
    cancellationReason: (row.cancellation_reason as string) || undefined,
    notifyPatient: (row.notify_patient as boolean) ?? false,
    notifyPatientMinutes: (row.notify_patient_minutes as number) || undefined,
    doctorId: (row.doctor_id as string) || undefined,
    doctorName: (row.doctor_name as string) || undefined,
    recurrence: (row.recurrence as CalendarEvent['recurrence']) ?? 'none',
    description: (row.description as string) || undefined,
    meetingLink: (row.meeting_link as string) || undefined,
    allDay: (row.all_day as boolean) ?? false,
    color: (row.color as string) || undefined,
  }
}

// ── Composable ────────────────────────────────────────────────────────────────
export const useSessionsDb = () => {
  async function upsertSession(event: CalendarEvent): Promise<void> {
    const client = useSupabase()
    if (!client) return
    const { error } = await client.from('sessions').upsert(toRow(event))
    if (error) console.error('[sessions] upsert error:', error.message)
  }

  async function removeSession(id: string): Promise<void> {
    const client = useSupabase()
    if (!client) return
    const { error } = await client.from('sessions').delete().eq('id', id)
    if (error) console.error('[sessions] delete error:', error.message)
  }

  async function fetchSessions(): Promise<CalendarEvent[]> {
    const client = useSupabase()
    if (!client) return []
    const { data, error } = await client
      .from('sessions')
      .select('*')
      .order('start_time')
    if (error) { console.error('[sessions] fetch error:', error.message); return [] }
    return (data ?? []).map(fromRow)
  }

  return { upsertSession, removeSession, fetchSessions }
}
