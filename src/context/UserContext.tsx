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

async function fetchUserContext(
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    setLoading(true);
    const response = await axios.get("/api/auth/profile");
    setUser(response.data);
  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response?.status !== 401 &&
      error.response?.status !== 404
    ) {
      console.error("Error fetching user data:", error);
    }
    setUser(null);
  } finally {
    setLoading(false);
  }
}

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading
  const router = useRouter();

  const updateUserContext = async () => {
    await fetchUserContext(setUser, setLoading);
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
