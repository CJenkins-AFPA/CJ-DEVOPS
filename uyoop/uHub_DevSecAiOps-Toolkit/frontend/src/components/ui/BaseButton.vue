<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  variant?: 'primary' | 'secondary' | 'accent' | 'danger'
  loading?: boolean
  disabled?: boolean
}>()

const emit = defineEmits(['click'])

const classes = computed(() => {
  return [
    'btn',
    `btn-${props.variant || 'primary'}`,
    { 'btn-loading': props.loading }
  ]
})
</script>

<template>
  <button 
    :class="classes" 
    :disabled="disabled || loading"
    @click="emit('click', $event)"
  >
    <span v-if="loading" class="spinner"></span>
    <span v-else>
      <slot></slot>
    </span>
  </button>
</template>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.75rem 1.5rem;
  border-radius: var(--radius-md);
  font-weight: 600;
  font-size: 1rem;
  transition: all var(--trans-fast);
  cursor: pointer;
  border: none;
  overflow: hidden;
  position: relative;
  letter-spacing: 0.02em;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: linear-gradient(135deg, var(--c-primary), #004d00);
  color: #000000; /* Black text for visibility on Green */
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
  text-shadow: none;
  font-weight: 700;
}

.btn-primary:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 0 20px rgba(0, 255, 0, 0.6);
  filter: brightness(1.2);
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--c-text-main);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-secondary:not(:disabled):hover {
  background: rgba(255, 255, 255, 0.15);
}

.btn-accent {
  background: var(--c-accent);
  color: white;
  box-shadow: 0 4px 6px -1px rgba(6, 182, 212, 0.3);
}

.btn-accent:not(:disabled):hover {
  filter: brightness(1.1);
  transform: translateY(-2px);
}

.spinner {
  width: 1.25em;
  height: 1.25em;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
</style>
