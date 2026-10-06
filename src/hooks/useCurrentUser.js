import { useSyncExternalStore } from "react";
import { getCurrentUser, subscribeToCurrentUser } from "../data/catalog";

export function useCurrentUser() {
  return useSyncExternalStore(subscribeToCurrentUser, getCurrentUser, () => null);
}