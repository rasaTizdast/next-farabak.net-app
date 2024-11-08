import axios from "axios";

// Handler for forgot password requests
export const changePasswordHandler = async (data) => {
  try {
    const response = await axios.patch("/api/auth/change-password", data);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || "Password reset failed");
  }
};
