"use client";

import React, { createContext, useContext, useState } from "react";
import SubscriptionModal from "@/components/home/SubscriptionModal";

interface SubscriptionContextType {
  isSubscriptionModalOpen: boolean;
  openSubscriptionModal: () => void;
  closeSubscriptionModal: () => void;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const openSubscriptionModal = () => setIsOpen(true);
  const closeSubscriptionModal = () => setIsOpen(false);

  return (
    <SubscriptionContext.Provider value={{ isSubscriptionModalOpen: isOpen, openSubscriptionModal, closeSubscriptionModal }}>
      {children}
      <SubscriptionModal isOpen={isOpen} onClose={closeSubscriptionModal} />
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error("useSubscription must be used within a SubscriptionProvider");
  }
  return context;
}
