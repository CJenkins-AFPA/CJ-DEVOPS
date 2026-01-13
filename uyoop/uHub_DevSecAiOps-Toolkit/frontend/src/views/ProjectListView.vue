<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '../components/ui/BaseCard.vue'
import BaseButton from '../components/ui/BaseButton.vue'
import BaseModal from '../components/ui/BaseModal.vue'
import BaseInput from '../components/ui/BaseInput.vue'
import { FolderGit2, Calendar, MoreVertical, Plus } from 'lucide-vue-next'
import { projectsApi, type Project } from '@/api/projects'

const router = useRouter()
const projects = ref<Project[]>([])
const loading = ref(true)

// Modal State
const showCreateModal = ref(false)
const newProjectName = ref('')
const creating = ref(false)

onMounted(async () => {
  try {
    const res = await projectsApi.getProjects()
    projects.value = res.data
  } catch (e) {
    console.error("Failed to fetch projects", e)
  } finally {
    loading.value = false
  }
})

const openProject = (id: number) => {
    router.push(`/projects/${id}/jobs`)
}

const openCreateModal = () => {
    newProjectName.value = ''
    showCreateModal.value = true
}

const createNewProject = async () => {
    if (!newProjectName.value) return
    
    creating.value = true
    try {
        const res = await projectsApi.createProject({
            name: newProjectName.value,
            description: "New Project created via UI",
            status: "active"
        })
        projects.value.push(res.data)
        showCreateModal.value = false
        // Optionally navigate immediately to Jobs
        openProject(res.data.id)
    } catch (e) {
        alert("Failed to create project")
        console.error(e)
    } finally {
        creating.value = false
    }
}
</script>

<template>
  <div class="projects-page fade-in">
    <header class="page-header">
      <div>
        <h1>Projects</h1>
        <p class="text-muted">Manage your repositories and pipelines</p>
      </div>
      <BaseButton variant="primary" @click="openCreateModal">
        <Plus class="w-4 h-4 mr-2" /> New Project
      </BaseButton>
    </header>

    <div v-if="loading" class="loading">Loading projects...</div>

    <div v-else-if="projects.length === 0" class="empty-state">
        <p>No projects found. Create one to get started.</p>
        <BaseButton variant="secondary" @click="openCreateModal" class="mt-4">
            Create Project
        </BaseButton>
    </div>

    <div v-else class="projects-grid">
      <BaseCard 
        v-for="project in projects" 
        :key="project.id" 
        class="project-card clickable"
        @click="openProject(project.id)"
      >
        <div class="card-header">
          <div class="icon-wrapper">
            <FolderGit2 class="w-6 h-6 text-primary" />
          </div>
          <button class="menu-btn" @click.stop><MoreVertical class="w-5 h-5" /></button>
        </div>
        
        <h3 class="project-title">{{ project.name }}</h3>
        <p class="project-desc">{{ project.description || 'No description provided' }}</p>
        
        <div class="card-footer">
          <span class="status-badge" :class="project.is_active ? 'active' : 'archived'">
            {{ project.is_active ? 'Active' : 'Archived' }}
          </span>
          <div class="meta">
            <Calendar class="w-4 h-4" />
            <span>{{ new Date(project.created_at).toLocaleDateString() }}</span>
          </div>
        </div>
      </BaseCard>
    </div>

    <!-- Create Project Modal -->
    <BaseModal 
        :show="showCreateModal" 
        title="Create New Project" 
        @close="showCreateModal = false"
    >
        <form @submit.prevent="createNewProject">
            <BaseInput 
                id="new-project-name"
                v-model="newProjectName" 
                label="Project Name" 
                placeholder="e.g. My Awesome App" 
                required 
                autofocus
            />
            
            <p class="text-xs text-muted mt-2">
                This will create a new project container for your jobs and repositories.
            </p>
        </form>

        <template #footer>
            <BaseButton variant="secondary" @click="showCreateModal = false">Cancel</BaseButton>
            <BaseButton variant="primary" @click="createNewProject" :disabled="creating">
                {{ creating ? 'Creating...' : 'Create Project' }}
            </BaseButton>
        </template>
    </BaseModal>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.projects-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.project-card {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.project-card.clickable {
    cursor: pointer;
    transition: all 0.2s ease;
}

.project-card.clickable:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 25px -5px rgba(124, 58, 237, 0.3); /* Purple glow matching primary */
    border-color: var(--c-primary);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(124, 58, 237, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--c-primary);
}

.project-title {
  font-size: 1.25rem;
  color: var(--c-text-main);
  margin-bottom: 0.5rem;
}

.project-desc {
  color: var(--c-text-muted);
  font-size: 0.9rem;
  flex: 1;
  margin-bottom: 1.5rem;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active { background: rgba(74, 222, 128, 0.1); color: #4ade80; }
.status-badge.archived { background: rgba(148, 163, 184, 0.1); color: #94a3b8; }

.meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--c-text-muted);
  font-size: 0.8rem;
}

.menu-btn {
  background: transparent;
  border: none;
  color: var(--c-text-muted);
  cursor: pointer;
}

.text-primary { color: var(--c-primary); }
.text-muted { color: var(--c-text-muted); }
</style>
