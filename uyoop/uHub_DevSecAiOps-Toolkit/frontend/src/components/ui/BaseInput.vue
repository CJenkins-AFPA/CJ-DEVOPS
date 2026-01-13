<script setup lang="ts">
defineProps<{
  modelValue: string | number
  label?: string
  type?: string
  placeholder?: string
  id: string
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <div class="input-group">
    <label v-if="label" :for="id" class="input-label">{{ label }}</label>
    <div class="input-wrapper">
      <input
        :id="id"
        :type="type || 'text'"
        :value="modelValue"
        :placeholder="placeholder"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        class="input-field"
      />
    </div>
  </div>
</template>

<style scoped>
.input-group {
  margin-bottom: 1.25rem;
}

.input-label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--c-text-muted);
}

.input-field {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: var(--radius-md);
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid var(--c-border);
  color: var(--c-text-main);
  font-size: 1rem;
  font-family: monospace; /* Matrix vibe */
  transition: all var(--trans-fast);
}

.input-field:focus {
  outline: none;
  border-color: var(--c-primary);
  box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
  background: rgba(0, 20, 0, 0.8);
}

/* Chrome/Edge Autofill Override - Force Dark Background */
.input-field:-webkit-autofill,
.input-field:-webkit-autofill:hover, 
.input-field:-webkit-autofill:focus, 
.input-field:-webkit-autofill:active {
    -webkit-box-shadow: 0 0 0 30px black inset !important;
    -webkit-text-fill-color: var(--c-primary) !important;
    caret-color: var(--c-primary);
    transition: background-color 5000s ease-in-out 0s;
}

.input-field::placeholder {
  color: rgba(148, 163, 184, 0.5);
}
</style>
