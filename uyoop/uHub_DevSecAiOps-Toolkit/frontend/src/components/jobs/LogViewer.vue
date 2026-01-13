<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { jobsApi } from '@/api/jobs'

const props = defineProps<{
  jobId: number
}>()

const logs = ref<string[]>([])
const status = ref<string>('unknown')
const polling = ref<any>(null)
const currentRunId = ref<number | null>(null)

// Poll for runs and logs
const pollLogs = async () => {
  if (!currentRunId.value) {
    // Check for latest run
    try {
        const runs = await jobsApi.getJobRuns(props.jobId)
        if (runs.data && runs.data.length > 0) {
            const latest = runs.data[0]
            if (latest) {
                currentRunId.value = latest.id
                status.value = latest.status
            }
        }
    } catch (e) {
        console.error("Error fetching runs", e)
    }
  }

  if (currentRunId.value) {
      try {
          const run = await jobsApi.getRun(currentRunId.value)
          status.value = run.data.status
          if (run.data.log_content) {
              logs.value = run.data.log_content.split('\n')
          }
      } catch (e) {
          console.error("Error fetching logs", e)
      }
  }
}

onMounted(() => {
  pollLogs()
  polling.value = setInterval(pollLogs, 2000)
})

onUnmounted(() => {
  if (polling.value) clearInterval(polling.value)
})

// Expose ability to refresh explicitly (e.g. after Run triggered)
const refresh = () => {
    currentRunId.value = null // Reset to find latest
    pollLogs()
}

defineExpose({ refresh })

</script>

<template>
  <div class="log-viewer terminal-look">
    <div class="terminal-header">
       <span class="status-indicator" :class="status">●</span>
       <span class="terminal-title">Live Execution Logs (Run #{{ currentRunId || 'Waiting...' }})</span>
    </div>
    <div class="logs-container">
        <div v-if="logs.length === 0" class="empty-logs">
            Waiting for execution...
        </div>
        <div v-else v-for="(line, index) in logs" :key="index" class="log-line">
            {{ line }}
        </div>
        <div v-if="status === 'running'" class="log-line typing-cursor">_</div>
    </div>
  </div>
</template>

<style scoped>
.terminal-look {
    background: #000;
    border: 1px solid #333;
    border-radius: 4px;
    font-family: 'Fira Code', monospace;
    overflow: hidden;
    margin-top: 1rem;
}

.terminal-header {
    background: #1a1a1a;
    padding: 0.5rem 1rem;
    border-bottom: 1px solid #333;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.status-indicator {
    font-size: 0.8rem;
}
.status-indicator.running { color: #ffff00; text-shadow: 0 0 5px #ffff00; }
.status-indicator.success { color: #00ff00; text-shadow: 0 0 5px #00ff00; }
.status-indicator.failed { color: #ff0000; text-shadow: 0 0 5px #ff0000; }
.status-indicator.queued { color: #00ffff; }

.terminal-title {
    color: #888;
    font-size: 0.8rem;
    text-transform: uppercase;
}

.logs-container {
    padding: 1rem;
    min-height: 200px;
    max-height: 500px;
    overflow-y: auto;
    color: #ccc;
    font-size: 0.9rem;
    line-height: 1.4;
}

.log-line {
    white-space: pre-wrap;
}

.typing-cursor {
    animation: blink 1s step-end infinite;
}

@keyframes blink {
    50% { opacity: 0; }
}
</style>
