<script setup lang="ts">
</script>

<template>
  <div class="glass-panel card">
    <slot></slot>
  </div>
</template>

<style scoped>
.card {
  padding: 1.5rem;
  transition: transform var(--trans-smooth), box-shadow var(--trans-smooth);
}

.card:hover {
  box-shadow: 0 8px 12px -2px rgba(0, 0, 0, 0.2);
}
</style>
