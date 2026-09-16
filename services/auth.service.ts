import api from "@/lib/api/client";

interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export const changePasswordService = async (payload: ChangePasswordPayload) => {
  try {
    const response = await api.post("/change-password", payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};

interface ForgotPasswordPayload {
  email: string;
}

export const forgotPasswordService = async (payload: ForgotPasswordPayload) => {
  try {
    const response = await api.post("/forgot-password", payload);
    return response.data;
  } catch (error: any) {
    throw error.response?.data || error;
  }
};
