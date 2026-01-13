import { defineStore } from 'pinia'
import { ref } from 'vue'
import axios from 'axios'

export const useAuthStore = defineStore('auth', () => {
    const token = ref<string | null>(localStorage.getItem('access_token'))
    const user = ref<any>(null)

    const isAuthenticated = () => !!token.value

    const login = async (username: string, password: string) => {
        try {
            // In a real app, use env var for API URL
            const formData = new FormData()
            formData.append('username', username)
            formData.append('password', password)

            const response = await axios.post('/api/v1/login/access-token', formData)

            token.value = response.data.access_token
            localStorage.setItem('access_token', token.value!)

            // Fetch user profile if needed
            user.value = { username }

            return true
        } catch (error) {
            console.error('Login failed', error)
            throw error
        }
    }

    const logout = () => {
        token.value = null
        user.value = null
        localStorage.removeItem('access_token')
        // We can't use router here effectively depending on setup, 
        // better to return and let view handle redirect or use router instance if injected
    }

    return {
        token,
        user,
        isAuthenticated,
        login,
        logout
    }
})
