import React, { createContext, useCallback, useContext, useState } from 'react';
import { api } from '../services/api';

export interface InvoiceSetting {
  target: 'invoices' | 'quotes';
  format_type?: 'preset' | 'custom';
  selected_template?: string;
  starting_number?: string;
  reset_option?: string;
  padding?: number;
  duplicate_check?: string;
  manual_override?: boolean;
  skip_deleted?: boolean;
  custom_components?: unknown[];
}

interface InvoiceSettingsContextValue {
  invoiceSettings: InvoiceSetting | null;
  quoteSettings: InvoiceSetting | null;
  fetchSettings: () => Promise<void>;
  getNextInvoiceNumber: () => Promise<string>;
  getNextQuoteNumber: () => Promise<string>;
}

const InvoiceSettingsContext = createContext<InvoiceSettingsContextValue | null>(null);

export function InvoiceSettingsProvider({ children }: { children: React.ReactNode }) {
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSetting | null>(null);
  const [quoteSettings, setQuoteSettings] = useState<InvoiceSetting | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      const [invRes, quoteRes] = await Promise.all([
        api.get<InvoiceSetting | null>('/invoice-settings?target=invoices'),
        api.get<InvoiceSetting | null>('/invoice-settings?target=quotes'),
      ]);
      setInvoiceSettings(invRes.data ?? null);
      setQuoteSettings(quoteRes.data ?? null);
    } catch {
      setInvoiceSettings(null);
      setQuoteSettings(null);
    }
  }, []);

  const getNextInvoiceNumber = useCallback(async (): Promise<string> => {
    try {
      const { data } = await api.get<{ number: string }>('/invoice-settings/next-number?target=invoices');
      return data?.number ?? `INV-${Date.now().toString().slice(-6)}`;
    } catch {
      return `INV-${Date.now().toString().slice(-6)}`;
    }
  }, []);

  const getNextQuoteNumber = useCallback(async (): Promise<string> => {
    try {
      const { data } = await api.get<{ number: string }>('/invoice-settings/next-number?target=quotes');
      return data?.number ?? `QUO-${Date.now().toString().slice(-6)}`;
    } catch {
      return `QUO-${Date.now().toString().slice(-6)}`;
    }
  }, []);

  return (
    <InvoiceSettingsContext.Provider
      value={{
        invoiceSettings,
        quoteSettings,
        fetchSettings,
        getNextInvoiceNumber,
        getNextQuoteNumber,
      }}
    >
      {children}
    </InvoiceSettingsContext.Provider>
  );
}

export function useInvoiceSettings() {
  const ctx = useContext(InvoiceSettingsContext);
  return ctx;
}
