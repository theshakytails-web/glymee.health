"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface ConsultationContextType {
  isOpen: boolean;
  open: () => void;
  close: () => void;
}

const ConsultationContext = createContext<ConsultationContextType | undefined>(undefined);

export function useConsultation() {
  const context = useContext(ConsultationContext);
  if (!context) {
    throw new Error("useConsultation must be used within a ConsultationProvider");
  }
  return context;
}

export function ConsultationProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <ConsultationContext.Provider value={{ isOpen, open, close }}>
      {children}
    </ConsultationContext.Provider>
  );
}
