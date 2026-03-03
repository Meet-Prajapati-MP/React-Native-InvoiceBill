import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BALANCE_KEY = 'WALLET_BALANCE';
const INITIAL_BALANCE = 12650;

interface BalanceContextValue {
  balance: number;
  deductBalance: (amount: number) => void;
  addBalance: (amount: number) => void;
}

const BalanceContext = createContext<BalanceContextValue | null>(null);

export function BalanceProvider({ children }: { children: React.ReactNode }) {
  const [balance, setBalance] = useState(INITIAL_BALANCE);

  useEffect(() => {
    AsyncStorage.getItem(BALANCE_KEY).then((val) => {
      const parsed = val ? parseFloat(val) : INITIAL_BALANCE;
      setBalance(isNaN(parsed) ? INITIAL_BALANCE : parsed);
    });
  }, []);

  const persist = useCallback((newBalance: number) => {
    AsyncStorage.setItem(BALANCE_KEY, String(newBalance));
  }, []);

  const deductBalance = useCallback(
    (amount: number) => {
      setBalance((prev) => {
        const next = Math.max(0, prev - amount);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const addBalance = useCallback(
    (amount: number) => {
      setBalance((prev) => {
        const next = prev + amount;
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const value: BalanceContextValue = {
    balance,
    deductBalance,
    addBalance,
  };

  return (
    <BalanceContext.Provider value={value}>
      {children}
    </BalanceContext.Provider>
  );
}

export function useBalance() {
  const ctx = useContext(BalanceContext);
  if (!ctx) throw new Error('useBalance must be used within BalanceProvider');
  return ctx;
}
