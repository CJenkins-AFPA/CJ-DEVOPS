<script setup lang="ts">
import TheSidebar from '../components/layout/TheSidebar.vue'
import TheHeader from '../components/layout/TheHeader.vue'
</script>

<template>
  <div class="app-layout">
    <div class="background-globes">
      <div class="globe globe-1"></div>
      <div class="globe globe-2"></div>
    </div>
    
    <TheSidebar />
    <div class="main-content">
      <TheHeader />
      <div class="page-content">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
  width: 100%;
}

.main-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0; /* Prevent flex overflow */
  transition: margin-left var(--trans-smooth);
}

/* Desktop: Push content when sidebar is visible */
@media (min-width: 768px) {
  .main-content {
    margin-left: var(--sidebar-width);
  }
}

.page-content {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .page-content {
    padding: 4rem;
    max-width: 1600px; /* Constrain width on huge screens */
    margin: 0 auto;
    width: 100%;
  }
}
</style>
