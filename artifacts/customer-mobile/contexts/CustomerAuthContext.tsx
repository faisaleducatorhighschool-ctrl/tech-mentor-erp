import AsyncStorage from "@react-native-async-storage/async-storage";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface CustomerUser {
  id: number;
  name: string;
  email: string | null;
  phone: string;
  address?: string | null;
  totalOrders?: number;
  totalSpent?: number;
}

interface CustomerAuthContextType {
  token: string | null;
  customer: CustomerUser | null;
  isLoading: boolean;
  signIn: (token: string, customer: CustomerUser) => Promise<void>;
  signOut: () => Promise<void>;
}

const TOKEN_KEY = "fbd_customer_token";
const USER_KEY = "fbd_customer_user";

const CustomerAuthContext = createContext<CustomerAuthContextType | null>(null);

export function CustomerAuthProvider({ children }: React.PropsWithChildren) {
  const [token, setToken] = useState<string | null>(null);
  const [customer, setCustomer] = useState<CustomerUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(TOKEN_KEY),
      AsyncStorage.getItem(USER_KEY),
    ]).then(([t, u]) => {
      if (t) setToken(t);
      if (u) { try { setCustomer(JSON.parse(u)); } catch {} }
      setIsLoading(false);
    });
  }, []);

  const signIn = useCallback(async (t: string, c: CustomerUser) => {
    await AsyncStorage.setItem(TOKEN_KEY, t);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(c));
    setToken(t);
    setCustomer(c);
  }, []);

  const signOut = useCallback(async () => {
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
    setToken(null);
    setCustomer(null);
  }, []);

  return (
    <CustomerAuthContext.Provider value={{ token, customer, isLoading, signIn, signOut }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const ctx = useContext(CustomerAuthContext);
  if (!ctx) throw new Error("useCustomerAuth must be inside CustomerAuthProvider");
  return ctx;
}

setAuthTokenGetter(() => AsyncStorage.getItem(TOKEN_KEY));
