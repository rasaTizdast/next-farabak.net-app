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
    // } catch (error) {
    //   throw new Error(
    //     error.response?.data?.message || "Failed to update profile"
    //   );
    // }
  } catch (error: unknown) {
    // Check if the error is an instance of Error
    if (axios.isAxiosError(error)) {
      // Axios errors have a response property that can be checked
      return Promise.reject(
        error.response?.data?.message || "Update profile failed"
      );
    } else if (error instanceof Error) {
      // If it's a general error, just throw its message
      return Promise.reject(error.message || "Update profile failed");
    } else {
      // Fallback in case the error is neither AxiosError nor an instance of Error
      return Promise.reject("Update profile failed due to an unknown error");
    }
  }
};
