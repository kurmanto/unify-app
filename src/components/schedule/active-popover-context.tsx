"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

interface ActivePopoverContextValue {
  activeId: string | null;
  open: (id: string) => void;
  close: () => void;
  toggle: (id: string) => void;
}

const ActivePopoverContext = createContext<ActivePopoverContextValue>({
  activeId: null,
  open: () => {},
  close: () => {},
  toggle: () => {},
});

export function ActivePopoverProvider({ children }: { children: ReactNode }) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const open = useCallback((id: string) => setActiveId(id), []);
  const close = useCallback(() => setActiveId(null), []);
  const toggle = useCallback(
    (id: string) => setActiveId((prev) => (prev === id ? null : id)),
    []
  );

  return (
    <ActivePopoverContext.Provider value={{ activeId, open, close, toggle }}>
      {children}
    </ActivePopoverContext.Provider>
  );
}

export function useActivePopover() {
  return useContext(ActivePopoverContext);
}
