const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json() as Promise<T>
}

export function fetchDashboardSummary() {
  return request('/dashboard/summary')
}

export function fetchRiskAssessments() {
  return request('/risk')
}

export function fetchBrands() {
  return request('/brands')
}

export function fetchMerchants() {
  return request('/merchants')
}

export function reviewContract(payload: unknown) {
  return request('/contracts/review', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
