import { createContext, useContext, useState, type ReactNode } from "react";

export type ViewMode = "real" | "simulation";

interface ViewModeContextType {
  mode: ViewMode;
  setMode: React.Dispatch<React.SetStateAction<ViewMode>>;
}

const ViewModeContext = createContext<ViewModeContextType | undefined>(undefined);

export function ViewModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ViewMode>("real");

  return (
    <ViewModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ViewModeContext.Provider>
  );
}

export function useViewMode() {
  const context = useContext(ViewModeContext);

  if (!context) {
    throw new Error("useViewMode must be used within a ViewModeProvider");
  }

  return context;
}