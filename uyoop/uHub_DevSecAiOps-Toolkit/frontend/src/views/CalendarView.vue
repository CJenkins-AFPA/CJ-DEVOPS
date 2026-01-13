<script setup lang="ts">
import { ref, onMounted } from 'vue'

import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { CalendarOptions, EventDropArg } from '@fullcalendar/core'
import type { EventResizeDoneArg } from '@fullcalendar/interaction'
import { calendarApi } from '@/api/calendar'
import { projectsApi, type Project } from '@/api/projects'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'


const showModal = ref(false)
const showEditModal = ref(false)
const projects = ref<Project[]>([])
// const isCreating = ref(false)
const isSaving = ref(false)

const eventForm = ref({
  id: 0,
  title: '',
  project_id: '',
  start: '',
  end: '',
  type: 'job',
  job_id: null as number | null
})

onMounted(async () => {
    try {
        const res = await projectsApi.getProjects()
        projects.value = res.data
    } catch (e) {
        console.error('Failed to load projects', e)
    }
})

const handleDateClick = (arg: any) => {
    eventForm.value = {
        id: 0,
        title: '',
        project_id: projects.value.length ? String(projects.value[0]?.id) : '',
        start: arg.dateStr + 'T09:00',
        end: arg.dateStr + 'T10:00',
        type: 'job',
        job_id: null
    }
    showModal.value = true
}

const handleCreateEvent = async () => {
    isSaving.value = true
    try {
        await calendarApi.createEvent({
            title: eventForm.value.title,
            project_id: Number(eventForm.value.project_id),
            start: new Date(eventForm.value.start).toISOString(),
            end: new Date(eventForm.value.end).toISOString(),
            event_type: eventForm.value.type as any,
            all_day: false
        })
        showModal.value = false
        window.location.reload()
    } catch (e) {
        console.error('Create failed', e)
        alert('Failed to create event')
    } finally {
        isSaving.value = false
    }
}

const handleEventClick = (info: any) => {
    const e = info.event
    // Format dates for input datetime-local (YYYY-MM-DDTHH:mm)
    const formatDate = (d: Date | null) => {
        if (!d) return ''
        return d.toISOString().slice(0, 16)
    }

    eventForm.value = {
        id: Number(e.id),
        title: e.title,
        project_id: e.extendedProps.project_id,
        start: formatDate(e.start),
        end: formatDate(e.end),
        type: e.extendedProps.event_type || 'job',
        job_id: e.extendedProps.job_id
    }
    showEditModal.value = true
}

const handleUpdateEvent = async () => {
    isSaving.value = true
    try {
        await calendarApi.updateEvent(eventForm.value.id, {
            title: eventForm.value.title,
            start: new Date(eventForm.value.start).toISOString(),
            end: new Date(eventForm.value.end).toISOString(),
            // type and project are usually not mutable via this simple API for now
        })
        showEditModal.value = false
        window.location.reload()
    } catch (e) {
        console.error('Update failed', e)
        alert('Failed to update event')
    } finally {
        isSaving.value = false
    }
}

const handleDeleteEvent = async () => {
    if(!confirm('Are you sure you want to delete this event?')) return
    
    try {
        await calendarApi.deleteEvent(eventForm.value.id)
        showEditModal.value = false
        window.location.reload()
    } catch (e) {
        console.error('Delete failed', e)
        alert('Failed to delete event')
    }
}

const calendarOptions = ref<CalendarOptions>({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: 'dayGridMonth',
  dateClick: handleDateClick,
  headerToolbar: {
    left: 'prev,next today',
    center: 'title',
    right: 'dayGridMonth,timeGridWeek,timeGridDay'
  },
  height: 'auto',
  events: async (fetchInfo, successCallback, failureCallback) => {
    try {
      const response = await calendarApi.getEvents(
        fetchInfo.start.toISOString(),
        fetchInfo.end.toISOString()
      )
      successCallback(response.data.map((e: any) => ({ ...e, id: String(e.id) })))
    } catch (error) {
      console.error('Failed to fetch calendar events:', error)
      failureCallback(error as Error)
    }
  },
  eventClick: handleEventClick,
  eventClassNames: (arg) => {
    const classes = []
    if (arg.event.extendedProps.conflict) {
      classes.push('event-conflict')
    }
    return classes
  },
  editable: true,
  eventDrop: async (info: EventDropArg) => {
    try {
      await calendarApi.updateEvent(Number(info.event.id), {
        start: info.event.start?.toISOString(),
        end: info.event.end?.toISOString(),
        all_day: info.event.allDay
      })
      // Refetch to update conflict visuals on all events
      info.view.calendar.refetchEvents()
    } catch (e) {
      console.error('Update failed', e)
      info.revert()
    }
  },
  eventResize: async (info: EventResizeDoneArg) => {
    try {
      await calendarApi.updateEvent(Number(info.event.id), {
        start: info.event.start?.toISOString(),
        end: info.event.end?.toISOString(),
        all_day: info.event.allDay
      })
      info.view.calendar.refetchEvents()
    } catch (e) {
      console.error('Resize failed', e)
      info.revert()
    }
  }
})
</script>

<template>
  <div class="calendar-view fade-in">
    <header class="mb-8">
      <h1>Operational Calendar</h1>
      <p class="text-muted">Timeline of all jobs, maintenances, and incidents</p>
    </header>
    
    <div class="calendar-container">
      <FullCalendar :options="calendarOptions" />
    </div>
    
    <BaseModal :show="showModal" title="Create Event" @close="showModal = false">
      <form @submit.prevent="handleCreateEvent" class="event-form">
        <BaseInput 
          v-model="eventForm.title" 
          id="event-title"
          label="Title" 
          placeholder="New Event" 
          type="text" 
          required 
        />
        
        <div class="form-group">
          <label>Project</label>
          <select v-model="eventForm.project_id" class="base-select" required>
            <option v-for="p in projects" :key="p.id" :value="p.id">{{ p.name }}</option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group half">
             <label>Start</label>
             <input v-model="eventForm.start" type="datetime-local" class="base-select" required />
          </div>
          <div class="form-group half">
             <label>End</label>
             <input v-model="eventForm.end" type="datetime-local" class="base-select" required />
          </div>
        </div>

        <div class="form-group">
          <label>Type</label>
          <select v-model="eventForm.type" class="base-select">
            <option value="job">Job</option>
            <option value="meeting">Meeting</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        
        <div class="modal-actions">
          <button type="button" @click="showModal = false" class="btn-cancel">Cancel</button>
          <button type="submit" class="btn-primary" :disabled="isSaving">
            {{ isSaving ? 'Creating...' : 'Create' }}
          </button>
        </div>
      </form>
    </BaseModal>

    <!-- Edit Event Modal -->
    <BaseModal :show="showEditModal" title="Edit Event" @close="showEditModal = false">
      <form @submit.prevent="handleUpdateEvent" class="event-form">
        <BaseInput 
          v-model="eventForm.title" 
          id="edit-event-title"
          label="Title" 
          :disabled="!!eventForm.job_id"
          type="text" 
          required 
        />
        <p v-if="eventForm.job_id" class="text-xs text-muted">
            Linked to Job #{{ eventForm.job_id }}. Title managed by Job. 
            <router-link :to="`/jobs/${eventForm.job_id}`" class="text-primary">View Job</router-link>
        </p>
        
        <div class="form-row">
          <div class="form-group half">
             <label>Start</label>
             <input v-model="eventForm.start" type="datetime-local" class="base-select" required />
          </div>
          <div class="form-group half">
             <label>End</label>
             <input v-model="eventForm.end" type="datetime-local" class="base-select" required />
          </div>
        </div>

        <div class="modal-actions space-between">
          <button type="button" @click="handleDeleteEvent" class="btn-danger">Delete</button>
          <div class="flex gap-2">
            <button type="button" @click="showEditModal = false" class="btn-cancel">Cancel</button>
            <button type="submit" class="btn-primary" :disabled="isSaving">
                {{ isSaving ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </div>
      </form>
    </BaseModal>
  </div>
</template>


<style scoped>
/* Global styles inherited */

.text-muted {
  color: var(--c-text-muted);
  font-size: 0.95rem;
}

.calendar-container {
  background: #111;
  padding: 1.5rem;
  border-radius: 16px;
  border: 1px solid #333;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

/* FullCalendar dark theme overrides */
.calendar-container :deep(.fc) {
  --fc-border-color: #333;
  --fc-bg-event-color: rgba(0, 255, 0, 0.2);
  --fc-bg-event-opacity: 1;
  --fc-event-border-color: #00ff00;
  --fc-event-text-color: #fff;
  --fc-page-bg-color: #111;
  --fc-neutral-bg-color: #1a1a1a;
  --fc-neutral-text-color: #fff;
  --fc-button-bg-color: #00ff00;
  --fc-button-border-color: #00ff00;
  --fc-button-text-color: #000;
  --fc-button-hover-bg-color: #00cc00;
  --fc-button-hover-border-color: #00cc00;
  --fc-button-active-bg-color: #009900;
  --fc-button-active-border-color: #009900;
}

.calendar-container :deep(.fc-theme-standard td),
.calendar-container :deep(.fc-theme-standard th) {
  border-color: #333;
}

.calendar-container :deep(.fc-daygrid-day) {
  background: #000;
}

.calendar-container :deep(.fc-daygrid-day:hover) {
  background: #0a0a0a;
}

.calendar-container :deep(.fc-col-header-cell) {
  background: #1a1a1a;
  color: var(--c-primary);
  font-weight: 600;
  border-color: #333;
}

.calendar-container :deep(.fc-day-today) {
  background: rgba(0, 255, 0, 0.05) !important;
}

.calendar-container :deep(.fc-toolbar-title) {
  color: #fff;
  font-size: 1.5rem;
}

.calendar-container :deep(.fc-event) {
  cursor: pointer;
  border-radius: 4px;
}

.calendar-container :deep(.fc-event:hover) {
  opacity: 0.9;
  transform: scale(1.02);
  transition: all 0.2s;
}

.calendar-container :deep(.event-conflict) {
  border-color: #ff0000 !important;
  border-width: 2px !important;
  box-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}

.fade-in {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.event-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  color: #aaa;
}

.base-select {
  background: #111;
  border: 1px solid #333;
  color: #fff;
  padding: 0.75rem;
  border-radius: 8px;
  font-family: inherit;
  width: 100%;
}

.base-select:focus {
  border-color: var(--c-primary);
  outline: none;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half {
  flex: 1;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1rem;
}

.btn-primary {
  background: var(--c-primary);
  color: #000;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel {
  background: transparent;
  color: #fff;
  border: 1px solid #333;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-danger {
  background: transparent;
  color: #ff4444;
  border: 1px solid #ff4444;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
}

.btn-danger:hover {
  background: rgba(255, 68, 68, 0.1);
}

.space-between {
  justify-content: space-between;
}

.text-xs {
  font-size: 0.75rem;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
}

.flex {
  display: flex;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
