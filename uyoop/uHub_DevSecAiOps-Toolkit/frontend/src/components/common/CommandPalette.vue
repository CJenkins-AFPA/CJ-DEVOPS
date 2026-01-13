<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { searchApi, type SearchResult } from '@/api/search'
import { Search, X } from 'lucide-vue-next'

import { useUIStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'

const uiStore = useUIStore()
const { isSearchOpen } = storeToRefs(uiStore)
const isOpen = ref(false)
// Actually, let's keep local isOpen but sync it with store
// Or better: use store directly.
// Let's use the watcher approach to keep current logic intact but respond to store triggers.
 
const query = ref('')
const results = ref<SearchResult[]>([])
const loading = ref(false)
const selectedIndex = ref(0)
const searchInput = ref<HTMLInputElement | null>(null)

const router = useRouter()

// Sync store -> local state
watch(isSearchOpen, (val) => {
    if (val) open()
    else close()
})

// Debounce function
const debounce = (fn: Function, ms = 300) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return function (this: any, ...args: any[]) {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), ms)
  }
}

const performSearch = async () => {
  if (query.value.length < 2) {
    results.value = []
    loading.value = false
    return
  }
  
  loading.value = true
  try {
    const res = await searchApi.search(query.value)
    results.value = res.data.results
    selectedIndex.value = 0
  } catch (error) {
    console.error("Search failed", error)
    results.value = []
  } finally {
    loading.value = false
  }
}

const debouncedSearch = debounce(performSearch, 300)

watch(query, () => {
    debouncedSearch()
})

const close = () => {
    isOpen.value = false
    uiStore.isSearchOpen = false
    query.value = ''
    results.value = []
}

const open = () => {
    isOpen.value = true
    nextTick(() => {
        searchInput.value?.focus()
    })
}

const onKeydown = (e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        isOpen.value ? close() : open()
    }
    
    if (!isOpen.value) return

    if (e.key === 'Escape') {
        close()
    } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        selectedIndex.value = (selectedIndex.value + 1) % results.value.length
    } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        selectedIndex.value = (selectedIndex.value - 1 + results.value.length) % results.value.length
    } else if (e.key === 'Enter') {
        e.preventDefault()
        const selected = results.value[selectedIndex.value]
        if (results.value.length > 0 && selected) {
            selectResult(selected)
        }
    }
}

const selectResult = (result: SearchResult) => {
    close()
    if (result.type === 'project') {
        router.push(`/projects/${result.id}`)
    } else if (result.type === 'job') {
        router.push(`/jobs/${result.id}`)
    } else if (result.type === 'event') {
        router.push(`/calendar`)
    }
}

// Expose open method for external button execution
defineExpose({ open })

onMounted(() => {
    window.addEventListener('keydown', onKeydown)
})

onUnmounted(() => {
    window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isOpen" class="palette-overlway" @click.self="close">
                <div class="palette-modal slide-in-down">
                    
                    <!-- Search Input -->
                    <div class="palette-header">
                        <Search class="w-5 h-5 text-gray-400 group-focus-within:text-primary transition-colors" />
                        <input 
                            ref="searchInput"
                            v-model="query"
                            type="text" 
                            placeholder="Search projects, jobs, events..." 
                            class="palette-input"
                        />
                        <button @click="close" class="text-gray-500 hover:text-white">
                            <X class="w-5 h-5" />
                        </button>
                    </div>

                    <!-- Results -->
                    <div v-if="results.length > 0 || loading" class="palette-body">
                        <div v-if="loading" class="p-4 text-center text-gray-500 text-sm">Searching...</div>
                        
                        <ul v-else class="palette-list">
                            <li 
                                v-for="(result, index) in results" 
                                :key="result.id + result.type"
                                :class="['palette-item', { 'active': index === selectedIndex }]"
                                @click="selectResult(result)"
                                @mouseover="selectedIndex = index"
                            >
                                <div class="item-icon">
                                    <span v-if="result.type === 'project'">📂</span>
                                    <span v-else-if="result.type === 'job'">⚡</span>
                                    <span v-else-if="result.type === 'event'">📅</span>
                                </div>
                                <div class="item-content">
                                    <div class="item-title">
                                        {{ result.title }}
                                        <span v-if="result.status" 
                                              :class="['status-badge', result.status]">
                                            {{ result.status }}
                                        </span>
                                    </div>
                                    <div class="item-desc">{{ result.description }}</div>
                                </div>
                                <div class="item-type">{{ result.type }}</div>
                            </li>
                        </ul>
                    </div>
                    
                    <div v-else-if="query.length >= 2" class="p-8 text-center text-gray-500">
                        No results found for "{{ query }}"
                    </div>
                    
                    <!-- Footer -->
                    <div class="palette-footer">
                        <span><kbd>↵</kbd> to select</span>
                        <span><kbd>↑↓</kbd> to navigate</span>
                        <span><kbd>esc</kbd> to close</span>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.palette-overlway {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    z-index: 9999;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding-top: 10vh;
}

.palette-modal {
    width: 600px;
    max-width: 90vw;
    background: #1a1a1a;
    border: 1px solid #333;
    border-radius: 12px;
    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    overflow: hidden;
    display: flex;
    flex-direction: column;
}

.palette-header {
    display: flex;
    align-items: center;
    padding: 1rem;
    border-bottom: 1px solid #2a2a2a;
    gap: 0.75rem;
}

.palette-input {
    flex: 1;
    background: transparent;
    border: none;
    color: white;
    font-size: 1.1rem;
    outline: none;
}

.palette-body {
    max-height: 400px;
    overflow-y: auto;
}

.palette-list {
    list-style: none;
    padding: 0.5rem;
    margin: 0;
}

.palette-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s;
    border: 1px solid transparent;
}

.palette-item.active {
    background: #252525;
    border-color: #333;
}

.item-content {
    flex: 1;
    min-width: 0;
}

.item-title {
    color: #fff;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.item-desc {
    color: #888;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.item-type {
    font-size: 0.75rem;
    color: #555;
    text-transform: uppercase;
    font-weight: 600;
    padding: 2px 6px;
    background: #111;
    border-radius: 4px;
}

.status-badge {
    font-size: 0.7rem;
    padding: 2px 6px;
    border-radius: 4px;
    text-transform: uppercase;
}
.status-badge.success { background: rgba(0, 255, 0, 0.1); color: #0f0; }
.status-badge.failed { background: rgba(255, 0, 0, 0.1); color: #f00; }
.status-badge.running { background: rgba(0, 0, 255, 0.1); color: #00f; }

.palette-footer {
    padding: 0.5rem 1rem;
    background: #111;
    border-top: 1px solid #2a2a2a;
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #666;
}

kbd {
    background: #2a2a2a;
    padding: 2px 4px;
    border-radius: 4px;
    font-family: monospace;
    color: #aaa;
}
</style>
