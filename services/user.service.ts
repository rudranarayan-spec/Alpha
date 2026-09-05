import api from "@/lib/api/client";

export interface UpdateUserProfilePayload {
  billing_name: string;
  phone: string;
  billing_address: string;
}

export interface UserProfileResponse {
  status: string;
  message: string;
  data: {
    id: number;
    billing_name: string;
    email: string;
    phone: string;
    email_verified_at: string | null;
    role_id: string;
    billing_address: string;
    due_amount: string;
    gst_number: string | null;
    status: string;
    created_at: string;
    updated_at: string;
  };
}

export const updateUserProfile = async (
  payload: UpdateUserProfilePayload,
): Promise<UserProfileResponse> => {
  const response = await api.put<UserProfileResponse>("/user-update", payload);
  return response.data;
};
