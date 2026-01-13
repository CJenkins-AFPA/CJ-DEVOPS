import client from './client'

export interface SearchResult {
    id: number
    type: 'project' | 'job' | 'event'
    title: string
    description?: string
    status?: string
}

export interface SearchResponse {
    results: SearchResult[]
    total: number
}

export const searchApi = {
    search: (query: string) =>
        client.get<SearchResponse>('/search', { params: { q: query } })
}
