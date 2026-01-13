import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import LoginView from '../views/LoginView.vue'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { layout: 'empty' }
        },
        {
            path: '/',
            name: 'dashboard',
            component: DashboardView,
            meta: { layout: 'AppLayout', requiresAuth: true }
        },
        {
            path: '/projects',
            name: 'projects',
            component: () => import('../views/ProjectListView.vue'),
            meta: { layout: 'AppLayout', requiresAuth: true }
        },
        {
            path: '/projects/:id/jobs',
            name: 'project-jobs',
            component: () => import('../views/JobListView.vue'), // Create this
            meta: { layout: 'AppLayout', requiresAuth: true }
        },
        {
            path: '/jobs/:id',
            name: 'job-detail',
            component: () => import('../views/JobDetailView.vue'), // Create this
            meta: { layout: 'AppLayout', requiresAuth: true }
        },
        {
            path: '/calendar',
            name: 'calendar',
            component: () => import('../views/CalendarView.vue'),
            meta: { layout: 'AppLayout', requiresAuth: true }
        },
        {
            path: '/jobs',
            redirect: '/projects'
        },
        {
            path: '/settings',
            redirect: '/'
        }
    ]
})

router.beforeEach((to, _from, next) => {
    const auth = useAuthStore()
    if (to.meta.requiresAuth && !auth.isAuthenticated()) {
        next('/login')
    } else {
        next()
    }
})

export default router
