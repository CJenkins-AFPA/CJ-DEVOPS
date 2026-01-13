<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobsApi, type Job } from '@/api/jobs'
import BaseCard from '@/components/ui/BaseCard.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import BaseModal from '@/components/ui/BaseModal.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import { ClipboardList, Clock } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const projectId = Number(route.params.id)
const jobs = ref<Job[]>([])
const loading = ref(true)

// Create Job State
const isCreateModalOpen = ref(false)
const isCreating = ref(false)
const newJob = ref({
    title: '',
    command: '',
    working_dir: '/app',
    description: '',
    job_type: 'dev',
    priority: 'normal'
})

const fetchJobs = async () => {
    loading.value = true
    try {
        const res = await jobsApi.getProjectJobs(projectId)
        jobs.value = res.data
    } catch (e) {
        console.error(e)
    } finally {
        loading.value = false
    }
}

onMounted(fetchJobs)

const openJob = (id: number) => {
    router.push(`/jobs/${id}`)
}

const handleCreateJob = async () => {
    if(!newJob.value.title || !newJob.value.command) return 
    
    isCreating.value = true
    try {
        const payload = {
            ...newJob.value,
            environment_id: null
        }
        await jobsApi.createProjectJob(projectId, payload)
        
        isCreateModalOpen.value = false
        newJob.value = {
            title: '',
            command: '',
            working_dir: '/app',
            description: '',
            job_type: 'dev',
            priority: 'normal'
        }
        await fetchJobs()
    } catch (e) {
        console.error("Failed to create job", e)
        alert("Failed to create job")
    } finally {
        isCreating.value = false
    }
}

const handleDeleteJob = async (jobId: number, jobTitle: string, event: Event) => {
    event.stopPropagation() // Prevent navigation to job detail
    
    if (!confirm(`Delete "${jobTitle}"?`)) return
    
    try {
        await jobsApi.deleteJob(jobId)
        await fetchJobs() // Refresh list
    } catch (e: any) {
        const message = e.response?.data?.detail || 'Failed to delete job'
        alert(message)
    }
}
</script>

<template>
  <div class="jobs-list-page fade-in">
     <header class="page-header">
       <div>
         <h1>Project Jobs</h1>
         <p class="text-muted">Automation tasks and pipelines</p>
       </div>
       <BaseButton variant="primary" @click="isCreateModalOpen = true">Create Job</BaseButton>
     </header>

     <BaseModal 
        :show="isCreateModalOpen"
        title="Create New Job"
        @close="isCreateModalOpen = false"
     >
        <div class="space-y-4">
            <BaseInput 
                id="job-title" 
                label="Job Title" 
                v-model="newJob.title" 
                placeholder="e.g. Deploy to Staging"
            />
             <BaseInput 
                id="job-command" 
                label="Command" 
                v-model="newJob.command" 
                placeholder="e.g. ansible-playbook site.yml"
            />
             <BaseInput 
                id="job-wdir" 
                label="Working Directory" 
                v-model="newJob.working_dir" 
                placeholder="/app"
            />
             <BaseInput 
                id="job-desc" 
                label="Description" 
                v-model="newJob.description" 
                placeholder="Optional description"
            />
        </div>

        <template #footer>
            <BaseButton variant="secondary" @click="isCreateModalOpen = false">Cancel</BaseButton>
            <BaseButton variant="primary" @click="handleCreateJob" :loading="isCreating">
                Create Job
            </BaseButton>
        </template>
     </BaseModal>

     <div v-if="loading" class="loading">Loading...</div>

     <div v-else class="jobs-grid">
        <BaseCard 
            v-for="job in jobs" 
            :key="job.id" 
            class="job-card"
            @click="openJob(job.id)"
        >
            <div class="card-header">
                <div class="icon-wrapper">
                    <ClipboardList class="w-6 h-6 text-primary" />
                </div>
                <!-- Fix typescript enum checking in template if simple string checks fail, but likely fine -->
                <span class="status-badge" :class="job.status">{{ job.status }}</span>
            </div>
            
            <h3 class="job-title">{{ job.title }}</h3>
            <p class="job-desc">{{ job.description }}</p>
            
            <div class="card-footer">
                <div class="meta-section">
                    <div class="meta">
                        <Clock class="w-4 h-4" />
                        <span>{{ job.job_type }}</span>
                    </div>
                    <div class="meta" v-if="job.command">
                        <span class="command-preview">$ {{ job.command }}</span>
                    </div>
                </div>
                <button 
                    class="delete-btn" 
                    @click="(e) => handleDeleteJob(job.id, job.title, e)"
                    title="Delete job"
                >
                    ×
                </button>
            </div>
        </BaseCard>
     </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.jobs-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.job-card {
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}
.job-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px -10px rgba(0,255,0,0.2);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.icon-wrapper {
  width: 40px;
  height: 40px;
  background: rgba(0, 255, 0, 0.1);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-primary);
}

.job-title {
  font-size: 1.2rem;
  color: var(--c-text-main);
  margin-bottom: 0.5rem;
}

.job-desc {
  color: var(--c-text-muted);
  font-size: 0.9rem;
  margin-bottom: 1rem;
  line-height: 1.4;
}

.card-footer {
    padding-top: 1rem;
    border-top: 1px solid rgba(255,255,255,0.05);
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 0.5rem;
}

.meta-section {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    flex: 1;
}

.meta {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--c-text-muted);
    font-size: 0.8rem;
}

.delete-btn {
    background: transparent;
    border: 1px solid rgba(255, 0, 0, 0.3);
    color: #ff4444;
    width: 32px;
    height: 32px;
    border-radius: 4px;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.delete-btn:hover {
    background: rgba(255, 0, 0, 0.1);
    border-color: #ff4444;
    transform: scale(1.1);
}

.command-preview {
    font-family: monospace;
    background: rgba(0,0,0,0.3);
    padding: 2px 6px;
    border-radius: 4px;
    color: #aaa;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.status-badge {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.7rem;
  text-transform: uppercase;
  font-weight: bold;
}
.status-badge.draft { background: #333; color: #aaa; }
.status-badge.running { background: rgba(255, 255, 0, 0.2); color: #ffff00; }
.status-badge.success { background: rgba(0, 255, 0, 0.2); color: #00ff00; }
.status-badge.failed { background: rgba(255, 0, 0, 0.2); color: #ff0000; }

.space-y-4 > * + * {
  margin-top: 1rem;
}
</style>
