import api from "@/lib/api/client";

export interface SiteSettingResponse {
  status: string;
  support_number: string;
  support_email: string;
}

export const siteService = {
  getSiteSetting: async (): Promise<SiteSettingResponse> => {
    try {
      const response = await api.get<SiteSettingResponse>("/get-site-setting");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch site settings:", error);
      throw error;
    }
  },
};
