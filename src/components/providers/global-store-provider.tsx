"use client";

import { createGlobalStore, type GlobalStore } from "@stores/global-store";
import { createContext, type ReactNode, useContext, useRef } from "react";
import { useStore } from "zustand";

export type GlobalStoreApi = ReturnType<typeof createGlobalStore>;

const GlobalStoreContext = createContext<GlobalStoreApi | null>(null);

export type GlobalStoreProviderProps = {
	children: ReactNode;
};

export function GlobalStoreProvider({ children }: GlobalStoreProviderProps) {
	const storeRef = useRef<GlobalStoreApi>(undefined);

	// Create the store if it doesn't exist.
	if (!storeRef.current) {
		storeRef.current = createGlobalStore();
	}

	return (
		<GlobalStoreContext.Provider value={storeRef.current}>
			{children}
		</GlobalStoreContext.Provider>
	);
}

export const useGlobalStore = <T,>(selector: (store: GlobalStore) => T): T => {
	const globalStoreContext = useContext(GlobalStoreContext);

	if (!globalStoreContext) {
		throw new Error("The 'useGlobalStore' hook must be used within a 'GlobalStoreProvider'.");
	}

	return useStore(globalStoreContext, selector);
};
