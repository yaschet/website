"use client";

import { createGlobalStore, type GlobalStore } from "@stores/global-store";
import { type ReactNode, useRef } from "react";
import { useStore } from "zustand";
import { getStrictContext } from "@/lib/get-strict-context";

export type GlobalStoreApi = ReturnType<typeof createGlobalStore>;

const [StrictGlobalStoreProvider, useGlobalStoreContext] =
	getStrictContext<GlobalStoreApi>("GlobalStoreContext");

export type GlobalStoreProviderProps = {
	children: ReactNode;
};

/**
 * Client-side state management context.
 *
 * @remarks
 * Provides a specialized Zustand store to the component tree, ensuring
 * safe hydration and preventing cross-request state pollution in SSR/RSC.
 *
 * @public
 */
export function GlobalStoreProvider({ children }: GlobalStoreProviderProps) {
	const storeRef = useRef<GlobalStoreApi>(undefined);

	// Create the store if it doesn't exist.
	if (!storeRef.current) {
		storeRef.current = createGlobalStore();
	}

	return (
		<StrictGlobalStoreProvider value={storeRef.current}>{children}</StrictGlobalStoreProvider>
	);
}

export const useGlobalStore = <T,>(selector: (store: GlobalStore) => T): T => {
	const globalStoreContext = useGlobalStoreContext();
	return useStore(globalStoreContext, selector);
};
