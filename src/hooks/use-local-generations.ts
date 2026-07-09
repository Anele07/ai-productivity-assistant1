import { useSyncExternalStore } from "react";
import { readAll, type Generation } from "@/lib/local-store";

function subscribe(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("taskpilot:generations", cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener("taskpilot:generations", cb);
    window.removeEventListener("storage", cb);
  };
}

export function useGenerations(): Generation[] {
  return useSyncExternalStore(subscribe, readAll, () => []);
}
