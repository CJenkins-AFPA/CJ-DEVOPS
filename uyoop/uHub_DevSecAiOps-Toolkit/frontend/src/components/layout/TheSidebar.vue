<script setup lang="ts">
import { useUIStore } from '@/stores/ui'
import { useAuthStore } from '@/stores/auth'
import { storeToRefs } from 'pinia'
import { LayoutDashboard, FolderKanban, Activity, Calendar, Settings, LogOut } from 'lucide-vue-next'
import { RouterLink, useRouter } from 'vue-router'

const uiStore = useUIStore()
const authStore = useAuthStore()
const router = useRouter()
const { isSidebarOpen } = storeToRefs(uiStore)

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Calendar', icon: Calendar, path: '/calendar' },
  { name: 'Projects', icon: FolderKanban, path: '/projects' },
  { name: 'Jobs', icon: Activity, path: '/jobs' },
  { name: 'Settings', icon: Settings, path: '/settings' },
]

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <aside 
    class="sidebar metallic-border-right"
    :class="{ 'sidebar-open': isSidebarOpen }"
  >
    <div class="sidebar-header">
      <div class="brand">
        <img src="/logo-new.png" alt="uHub" class="sidebar-logo" />
        <div class="brand-info">
           <span class="brand-text font-comfortaa">uHub</span>
           <span class="brand-sub font-comfortaa">by uyoop</span>
        </div>
      </div>
    </div>

    <nav class="sidebar-nav">
      <RouterLink 
        v-for="item in menuItems" 
        :key="item.path" 
        :to="item.path"
        class="nav-item"
        active-class="active"
        @click="uiStore.closeSidebar()" 
      >
        <component :is="item.icon" class="nav-icon" />
        <span class="nav-text">{{ item.name }}</span>
      </RouterLink>
    </nav>


    <div class="sidebar-footer">
      <button class="nav-item logout-btn" @click="handleLogout">
        <LogOut class="nav-icon" />
        <span class="nav-text">Logout</span>
      </button>
    </div>
  </aside>

  <!-- Mobile Overlay -->
  <div 
    v-if="isSidebarOpen" 
    class="sidebar-overlay md:hidden"
    @click="uiStore.closeSidebar()"
  ></div>
</template>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width);
  z-index: 50;
  display: flex;
  flex-direction: column;
  border-radius: 0 var(--radius-lg) var(--radius-lg) 0;
  border-left: none;
  background: #0a0a0a;
  /* border-right handled by metallic-border-right */
  transform: translateX(-100%);
  transition: transform var(--trans-smooth);
}

.sidebar-open {
  transform: translateX(0);
}

/* Desktop: Always Visible */
@media (min-width: 768px) {
  .sidebar {
    transform: translateX(0);
    width: var(--sidebar-width);
    /* In desktop layout, main content will preserve space */
  }
}

.sidebar-header {
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  border-bottom: 1px solid rgba(255,255,255,0.05);
}

.sidebar-logo {
  height: 48px; /* Increased from 32px */
  width: auto;
  filter: drop-shadow(0 0 5px rgba(0, 255, 0, 0.3));
}

.brand {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-info {
  display: flex;
  flex-direction: column;
  line-height: 1.1;
}

.brand-text {
  font-size: 1.5rem;
  font-weight: 700;
  color: white; /* "uHub blanc" */
  text-shadow: 0 0 10px rgba(0, 255, 0, 0.4);
}

.brand-sub {
  font-size: 0.65rem; /* Slightly smaller to fit "DevSecAiOps ToolKit" */
  color: var(--c-primary);
  opacity: 0.9;
  letter-spacing: 0.5px;
  white-space: nowrap;
}


.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 700;
  font-size: 1.25rem;
  color: var(--c-text-main);
}

.logo-icon {
  width: 32px;
  height: 32px;
  background: var(--c-primary);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 10px rgba(124, 58, 237, 0.5);
}

.sidebar-nav {
  flex: 1;
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  color: var(--c-text-muted);
  text-decoration: none;
  transition: all var(--trans-fast);
  font-weight: 500;
  border: 1px solid transparent;
}

.nav-item:hover {
  background: rgba(255,255,255,0.05);
  color: var(--c-text-main);
}

.nav-item.active {
  background: rgba(0, 255, 0, 0.1);
  color: var(--c-primary);
  border-color: rgba(0, 255, 0, 0.2);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.1);
}

.nav-icon {
  width: 20px;
  height: 20px;
}

.sidebar-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(255,255,255,0.05);
}

.logout-btn {
  width: 100%;
  background: transparent;
  border: none;
  cursor: pointer;
}

.logout-btn:hover {
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
}

.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  z-index: 40;
}
</style>
