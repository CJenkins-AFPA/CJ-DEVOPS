<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { jobsApi, type Job } from '@/api/jobs'

import BaseButton from '@/components/ui/BaseButton.vue'
import LogViewer from '@/components/jobs/LogViewer.vue'
import { Play, ArrowLeft, Terminal } from 'lucide-vue-next'

const route = useRoute()
const jobId = Number(route.params.id)
const job = ref<Job | null>(null)
const logViewer = ref<any>(null)
const running = ref(false)

onMounted(async () => {
    try {
        const res = await jobsApi.getJob(jobId)
        job.value = res.data
    } catch (e) {
        console.error("Failed to load job", e)
    }
})

const runJob = async () => {
    if (!job.value) return
    running.value = true
    try {
        await jobsApi.runJob(jobId)
        // Refresh logs
        if (logViewer.value) {
            logViewer.value.refresh()
        }
    } catch (e) {
        alert("Failed to trigger job")
    } finally {
        running.value = false
    }
}

const deleteJob = async () => {
    if (!job.value) return
    if (!confirm(`Are you sure you want to delete "${job.value.title}"?`)) return
    
    try {
        await jobsApi.deleteJob(jobId)
        alert('Job deleted successfully')
        // Navigate back to jobs list
        window.history.back()
    } catch (e: any) {
        const message = e.response?.data?.detail || 'Failed to delete job'
        alert(message)
    }
}
</script>

<template>
  <div class="job-detail-page fade-in">
    <div class="header-actions">
        <RouterLink to="/projects/1/jobs" class="back-link"> <!-- HACK: Hardcoded project ID return for MVP -->
            <ArrowLeft class="w-4 h-4" /> Back to Jobs
        </RouterLink>
    </div>

    <div v-if="job" class="job-content">
        <header class="job-header">
            <div>
                <h1 class="job-title">{{ job.title }} <span class="badge" :class="job.job_type">{{ job.job_type }}</span></h1>
                <p class="job-desc">{{ job.description }}</p>
            </div>
            <BaseButton 
                variant="primary" 
                class="run-btn" 
                @click="runJob" 
                :disabled="running"
            >
                <Play class="w-4 h-4 mr-2" />
                {{ running ? 'Triggering...' : 'Run Now' }}
            </BaseButton>
            <BaseButton 
                variant="secondary" 
                @click="deleteJob"
            >
                Delete
            </BaseButton>
        </header>

        <div class="command-box">
            <div class="box-label"><Terminal class="w-4 h-4" /> Command</div>
            <code>{{ job.command || 'No command configured' }}</code>
        </div>
        
        <LogViewer ref="logViewer" :jobId="jobId" />
    </div>
    <div v-else class="loading">Loading Job...</div>
  </div>
</template>

<style scoped>
.header-actions {
    margin-bottom: 1rem;
}
.back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--c-text-muted);
    text-decoration: none;
    font-size: 0.9rem;
}
.back-link:hover { color: var(--c-primary); }

.job-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.job-title {
    font-size: 2rem;
    display: flex;
    align-items: center;
    gap: 1rem;
}

.badge {
    font-size: 0.8rem;
    padding: 2px 8px;
    border-radius: 4px;
    background: #333;
    color: #aaa;
    text-transform: uppercase;
}
.badge.dev { border: 1px solid #4ade80; color: #4ade80; }
.badge.ops { border: 1px solid #facc15; color: #facc15; }

.job-desc {
    color: var(--c-text-muted);
    font-size: 1.1rem;
    margin-top: 0.5rem;
}

.command-box {
    background: #111;
    border: 1px solid #333;
    border-radius: 8px;
    padding: 1rem;
    margin-bottom: 2rem;
}

.box-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-size: 0.8rem;
    text-transform: uppercase;
    margin-bottom: 0.5rem;
}

code {
    font-family: 'Fira Code', monospace;
    color: var(--c-primary);
    font-size: 1rem;
}

.run-btn {
    min-width: 140px;
}
</style>
