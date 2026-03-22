import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserFinancialData } from "@/types/finance";

interface UserDataContextType {
  userData: UserFinancialData | null;
  setUserData: (data: UserFinancialData) => void;
  isOnboarded: boolean;
  resetData: () => void;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

const STORAGE_KEY = "moneywise_user_data";

export function UserDataProvider({ children }: { children: ReactNode }) {
  const [userData, setUserDataState] = useState<UserFinancialData | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setUserData = (data: UserFinancialData) => {
    setUserDataState(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  };

  const resetData = () => {
    setUserDataState(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <UserDataContext.Provider value={{ userData, setUserData, isOnboarded: !!userData, resetData }}>
      {children}
    </UserDataContext.Provider>
  );
}

export function useUserData() {
  const context = useContext(UserDataContext);
  if (!context) throw new Error("useUserData must be used within UserDataProvider");
  return context;
}
