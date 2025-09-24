import axios from "axios";

interface Props {
  currentPassword: string;
  newPassword: string;
}

// Handler for forgot password requests
export const changePasswordHandler = async (data: Props) => {
  try {
    const response = await axios.patch("/api/auth/change-password", data);
    return response.data;
  } catch (error: unknown) {
    // Check if the error is an instance of Error
    if (axios.isAxiosError(error)) {
      // Axios errors have a response property that can be checked
      return Promise.reject(error.response?.data?.message || "Password reset failed");
    } else if (error instanceof Error) {
      // If it's a general error, just throw its message
      return Promise.reject(error.message || "Password reset failed");
    } else {
      // Fallback in case the error is neither AxiosError nor an instance of Error
      return Promise.reject("Password reset failed due to an unknown error");
    }
  }
};
