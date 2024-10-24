"use client"; // This makes the context a client component

import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

interface User {
  userId: string;
  username: string;
  role: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  logout: () => void;
  isLoggedIn: boolean; // To check if the user is logged in
  isAdmin: boolean; // To check if the user is an admin
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Fetch user data from the profile endpoint
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get("/api/auth/profile");
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };

    fetchUserData();
  }, []);

  // Logout logic using the logout endpoint
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
      setUser(null); // Clear user data in the context
      router.push("/"); // Redirect user to landing page
    } catch (error) {
      console.error("Error during logout", error);
    }
  };

  // Check if the user is logged in
  const isLoggedIn = !!user;

  // Check if the user is an admin
  const isAdmin = user?.role === "admin"; // Returns true if user role is 'admin'

  return (
    <UserContext.Provider
      value={{ user, setUser, logout, isLoggedIn, isAdmin }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
