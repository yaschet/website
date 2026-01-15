import { createJSONStorage, persist } from "zustand/middleware";
import { createStore } from "zustand/vanilla";
import type { StateCreator } from "zustand";
import type { StoreApi } from "zustand/vanilla";

export type GlobalState = {
  isSoundEnabled: boolean;
  hasSeenIntro: boolean;
};

export type GlobalActions = {
  toggleSound: () => void;
  setHasSeenIntro: () => void;
};

export type GlobalStore = GlobalState & GlobalActions;

export const defaultGlobalState: GlobalState = {
  isSoundEnabled: true,
  hasSeenIntro: false,
};

/**
 * Global Store for UI Preferences
 * Manages app-wide interaction settings like sound effects and one-time intro animations.
 */
export const createGlobalStore = (
  globalState: GlobalState = defaultGlobalState
): StoreApi<GlobalStore> => {
  const storeOptions: StateCreator<GlobalStore> = (set) => ({
    ...globalState,
    toggleSound: () =>
      set((state) => ({ isSoundEnabled: !state.isSoundEnabled })),
    setHasSeenIntro: () => set({ hasSeenIntro: true }),
  });

  return createStore<GlobalStore>()(
    persist(storeOptions, {
      name: `app-preferences`,
      storage: createJSONStorage(() => localStorage),
    })
  );
};
