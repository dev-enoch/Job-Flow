import { useEffect } from "react";

declare global {
  interface Window {
    frameworkReady?: () => void;
  }
}

export function useFrameworkReady() {
  useEffect(() => {
    // `window` only exists on web; on native (Hermes) referencing it bare
    // throws a ReferenceError, so guard it.
    if (typeof window !== "undefined") {
      window.frameworkReady?.();
    }
  });
}
