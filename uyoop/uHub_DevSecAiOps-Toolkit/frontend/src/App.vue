<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import CommandPalette from '@/components/common/CommandPalette.vue'

const route = useRoute()
const layout = computed(() => {
  return route.meta.layout === 'AppLayout' ? AppLayout : 'div'
})
</script>

<template>
  <component :is="layout">
    <RouterView />
  </component>
  <CommandPalette />
</template>

<style>
/* Global transition for routes if desired */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
