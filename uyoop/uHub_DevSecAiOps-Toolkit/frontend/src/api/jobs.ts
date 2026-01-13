import client from './client'

export interface Job {
    id: number
    project_id: number
    title: string
    description?: string
    command?: string
    status: string
    job_type: string
    priority: string
    updated_at: string
}

export interface Run {
    id: number
    job_id: number
    status: string
    started_at: string
    finished_at?: string
    exit_code?: number
    log_content?: string
}

export const jobsApi = {
    getProjectJobs: (projectId: number) =>
        client.get<Job[]>(`/projects/${projectId}/jobs`),

    getJob: (jobId: number) =>
        client.get<Job>(`/jobs/${jobId}`), // We need to ensure this endpoint exists on backend. 
    // Wait, backend only had /projects/{id}/jobs (LIST) and /jobs/{job_id}/runs (RUNS). 
    // Did we implement GET /jobs/{id}?
    // The previous plan said: "Implement GET /jobs/{id}".
    // Let's verify backend jobs.py.

    createProjectJob: (projectId: number, data: any) =>
        client.post<Job>(`/projects/${projectId}/jobs`, data),

    runJob: (jobId: number) =>
        client.post<Run>(`/jobs/${jobId}/run`),

    getJobRuns: (jobId: number) =>
        client.get<Run[]>(`/jobs/${jobId}/runs`),

    getRun: (runId: number) =>
        client.get<Run>(`/runs/${runId}`),

    deleteJob: (jobId: number) =>
        client.delete(`/jobs/${jobId}`),

    updateJob: (jobId: number, data: Partial<Job>) =>
        client.put<Job>(`/jobs/${jobId}`, data)
}
