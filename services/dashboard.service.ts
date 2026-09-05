// services/dashboard.service.ts

import api from "@/lib/api/client";
import { DashboardApiResponse, DashboardData } from "@/types/dashboard.types";

export const dashboardService = {
  getDashboardData: async (): Promise<DashboardData> => {
    const response = await api.get<DashboardApiResponse>("/get-dashboard-data");
    return response.data?.data || response.data;
  },
};
