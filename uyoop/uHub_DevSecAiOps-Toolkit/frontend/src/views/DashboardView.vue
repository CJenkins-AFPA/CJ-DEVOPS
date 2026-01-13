<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BaseCard from '../components/ui/BaseCard.vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js'
import { FolderGit2, Activity, ShieldCheck, AlertTriangle } from 'lucide-vue-next'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const router = useRouter()

const chartData = ref({
  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
  datasets: [
    {
      label: 'Job Executions',
      backgroundColor: '#00ff00', // Green
      data: [40, 20, 12, 39, 10, 40, 39],
      borderRadius: 4
    },
    {
      label: 'Security Scans',
      backgroundColor: '#333333', // Dark Grey
      data: [20, 10, 20, 15, 25, 10, 15],
      borderRadius: 4
    }
  ]
})

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { labels: { color: '#a3a3a3' } },
    tooltip: { 
        backgroundColor: '#000', 
        titleColor: '#00ff00',
        bodyColor: '#fff',
        borderColor: '#00ff00',
        borderWidth: 1
    }
  },
  scales: {
    y: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    x: { ticks: { color: '#a3a3a3' }, grid: { color: 'rgba(255,255,255,0.05)' } }
  }
}

const stats = [
  { label: 'Active Projects', value: '12', icon: FolderGit2, color: 'text-primary', link: '/projects' },
  { label: 'Running Jobs', value: '5', icon: Activity, color: 'text-white', link: '/projects' }, // Todo: link to global jobs view if exists
  { label: 'Security Score', value: '98%', icon: ShieldCheck, color: 'text-primary', link: '#' },
  { label: 'Vulnerabilities', value: '0', icon: AlertTriangle, color: 'text-gray', link: '#' },
]

const navigate = (link: string) => {
    if(link !== '#') router.push(link)
}
</script>

<template>
  <div class="dashboard fade-in">
    <header class="mb-8">
      <h1>Dashboard</h1>
      <p class="text-muted">Overview of your DevSecOps environment</p>
    </header>

    <!-- Stats Grid -->
    <div class="stats-grid">
      <BaseCard 
        v-for="stat in stats" 
        :key="stat.label" 
        class="stat-card" 
        :class="{ 'clickable': stat.link !== '#' }"
        @click="navigate(stat.link)"
      >
        <div class="stat-icon">
          <component :is="stat.icon" :class="stat.color" />
        </div>
        <div class="stat-info">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-label">{{ stat.label }}</span>
        </div>
      </BaseCard>
    </div>

    <!-- Charts Section -->
    <div class="charts-section mt-8">
      <BaseCard class="chart-container">
        <h3>Weekly Activity</h3>
        <div class="chart-wrapper">
          <Bar :data="chartData" :options="chartOptions" />
        </div>
      </BaseCard>
    </div>
  </div>
</template>

<style scoped>
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  transition: transform 0.2s, background-color 0.2s;
}

.stat-card.clickable {
    cursor: pointer;
}

.stat-card.clickable:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.03); /* Subtle highlight */
}

.stat-icon {
  padding: 1rem;
  border-radius: 1rem;
  background: rgba(255,255,255,0.05);
}

.stat-icon svg {
  width: 2rem;
  height: 2rem;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  line-height: 1;
  color: var(--c-text-main);
}

.stat-label {
  color: var(--c-text-muted);
  font-size: 0.875rem;
}

.chart-wrapper {
  height: 300px;
  margin-top: 1rem;
}

/* Utility classes for colors (tailwind-like but scoped) */
.text-primary { color: var(--c-primary); }
.text-white { color: white; }
.text-gray { color: #888; }
.text-muted { color: var(--c-text-muted); }
.mt-8 { margin-top: 3rem; }
.mb-8 { margin-bottom: 3rem; }
</style>
