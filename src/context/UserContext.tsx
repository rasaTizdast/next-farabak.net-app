"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

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
  userFullName: string;
  loading: boolean; // New loading state
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading
  const router = useRouter();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/auth/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data", error);
      } finally {
        setLoading(false); // End loading once data is fetched or on error
      }
    };

    fetchUserData();
  }, []);

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
  const userFullName = `${user?.firstName || ""} ${user?.lastName || ""}`;

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        logout,
        isLoggedIn,
        isAdmin,
        userFullName,
        loading,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
