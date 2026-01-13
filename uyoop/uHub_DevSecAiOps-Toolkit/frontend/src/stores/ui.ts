import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
    const isSidebarOpen = ref(false)
    // const { width } = useWindowSize()

    // Auto-close sidebar on mobile initial load or resize
    // Keep open on desktop
    const toggleSidebar = () => {
        isSidebarOpen.value = !isSidebarOpen.value
    }

    const closeSidebar = () => {
        isSidebarOpen.value = false
    }

    const isSearchOpen = ref(false)
    const openSearch = () => {
        isSearchOpen.value = true
    }

    return {
        isSidebarOpen,
        toggleSidebar,
        closeSidebar,
        isSearchOpen,
        openSearch
    }
})
