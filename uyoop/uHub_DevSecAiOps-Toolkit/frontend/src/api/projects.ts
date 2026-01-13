import client from './client'

export interface Project {
    id: number
    name: string
    description: string
    is_active: boolean
    created_at: string
}

export const projectsApi = {
    getProjects: () =>
        client.get<Project[]>('/projects/'), // Backend: GET /api/v1/projects/

    getProject: (id: number) =>
        client.get<Project>(`/projects/${id}`),

    createProject: (data: any) =>
        client.post<Project>('/projects/', data)
}
