'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';

// TODO: Define state types
// TODO: Define action types
// TODO: Implement reducer

interface AppState {
  // TODO: Add application state shape
}

const initialState: AppState = {};

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<any>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer((state: AppState, action: any) => {
    // TODO: Implement reducer logic
    return state;
  }, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
}
