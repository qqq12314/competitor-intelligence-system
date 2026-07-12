import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api',
  timeout: 10000,
})

export async function fetchDashboardSummary() {
  const { data } = await api.get('/dashboard/summary')
  return data
}

export async function fetchRiskAssessments() {
  const { data } = await api.get('/risk')
  return data
}

