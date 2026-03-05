import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "zenpulse:isSubscribed";

type SubscriptionContextValue = {
  isSubscribed: boolean;
  hydrated: boolean;
  subscribe: () => Promise<void>;
  reset: () => Promise<void>;
};

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export function SubscriptionProvider(props: { children: React.ReactNode }) {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        const value = raw === "1" || raw === "true";
        if (alive) setIsSubscribed(value);
      } catch {
        // если storage недоступен/ошибка — остаёмся на дефолте false
        if (alive) setIsSubscribed(false);
      } finally {
        if (alive) setHydrated(true);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const subscribe = useCallback(async () => {
    setIsSubscribed(true);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // игнор: состояние в памяти уже true, для прототипа ок
    }
  }, []);

  const reset = useCallback(async () => {
    setIsSubscribed(false);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch {
      // игнор
    }
  }, []);

  const value = useMemo<SubscriptionContextValue>(
    () => ({ isSubscribed, hydrated, subscribe, reset }),
    [isSubscribed, hydrated, subscribe, reset]
  );

  return (
    <SubscriptionContext.Provider value={value}>
      {props.children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription(): SubscriptionContextValue {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) {
    throw new Error("useSubscription must be used within SubscriptionProvider");
  }
  return ctx;
}