import { apiJson } from '@/shared/api/api'
import type { DashboardResponse } from '../model/types'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  detail: () => [...dashboardKeys.all, 'detail'] as const,
}

/** GET /api/v1/dashboard (명세: envelope.data = DashboardResponse) */
export function fetchDashboard(): Promise<DashboardResponse> {
  return apiJson<DashboardResponse>('/api/v1/dashboard')
}
