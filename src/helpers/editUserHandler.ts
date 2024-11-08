import axios from "axios";

interface UpdateUserResponse {
  message: string;
}

interface EditUserFormData {
  f_name?: string;
  l_name?: string;
  phone_number?: string;
  job?: string;
  email_address?: string;
  city?: string;
}

export const editUserHandler = async (
  data: EditUserFormData
): Promise<UpdateUserResponse> => {
  try {
    const response = await axios.patch("/api/auth/profile", data);
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data?.message || "Failed to update profile"
    );
  }
};
