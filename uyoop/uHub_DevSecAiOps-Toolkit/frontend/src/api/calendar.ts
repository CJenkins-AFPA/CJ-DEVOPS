import client from './client'

export interface CalendarEvent {
    id: number
    title: string
    start: string
    end?: string
    allDay: boolean
    backgroundColor?: string
    borderColor?: string
    extendedProps: {
        project_id: number
        job_id?: number
        event_type: string
        conflict: boolean
        project_name?: string
    }
}

export interface EventCreate {
    project_id: number
    title: string
    start: string
    end?: string
    event_type: 'job' | 'meeting' | 'maintenance' | 'incident' | 'other'
    all_day?: boolean
    color?: string
}

export interface EventUpdate {
    title?: string
    start?: string
    end?: string
    all_day?: boolean
    color?: string
}

export const calendarApi = {
    getEvents: (start: string, end: string, projectId?: number) =>
        client.get<CalendarEvent[]>('/calendar/events', {
            params: { start, end, project_id: projectId }
        }),

    createEvent: (event: EventCreate) =>
        client.post<CalendarEvent>('/calendar/events', event),

    updateEvent: (id: number, data: EventUpdate) =>
        client.patch<CalendarEvent>(`/calendar/events/${id}`, data),

    deleteEvent: (id: number) =>
        client.delete(`/calendar/events/${id}`)
}
