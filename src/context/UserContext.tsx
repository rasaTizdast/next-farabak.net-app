"use client";

import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { createContext, use, useState, useEffect } from "react";

interface User {
  userId: string;
  username: string;
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isBranch: boolean;
  userFullName: string;
  loading: boolean; // Loading state
  updateUserContext: () => void; // Function to fetch and update context
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading
  const router = useRouter();

  // Function to manually fetch user data and update context
  const updateUserContext = async () => {
    try {
      setLoading(true); // Set loading to true while fetching data
      const response = await axios.get("/api/auth/profile");
      setUser(response.data); // Set the user data in context
    } catch (error) {
      // Only log error if it's not a 401 (unauthorized) or 404 (not found)
      if (
        error instanceof AxiosError &&
        error.response?.status !== 401 &&
        error.response?.status !== 404
      ) {
        console.error("Error fetching user data:", error);
      }
      // Silently handle authentication errors as they're expected when user is not logged in
      setUser(null);
    } finally {
      setLoading(false); // Stop loading once the fetch is complete
    }
  };

  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  const isLoggedIn = !!user;
  const isAdmin = user?.role.toLowerCase() === "admin";
  const isBranch = user?.role.toLowerCase() === "branch";
  const userFullName = `${user?.firstName || ""} ${user?.lastName || ""}`;

  // eslint-disable-next-line react-compiler/set-state-in-effect
  useEffect(() => {
    updateUserContext();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        isLoggedIn,
        isAdmin,
        isBranch,
        userFullName,
        loading,
        updateUserContext, // Provide the function to manually update the user context
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = use(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
