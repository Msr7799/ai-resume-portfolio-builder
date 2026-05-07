"use client";

import { useEffect, useRef, useState } from "react";

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [ready, setReady] = useState(false);
  const didLoadRef = useRef(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(key);
    if (stored) {
      try {
        setValue(JSON.parse(stored) as T);
      } catch {
        setValue(initialValue);
      }
    }
    didLoadRef.current = true;
    setReady(true);
  }, [initialValue, key]);

  useEffect(() => {
    if (!didLoadRef.current) return;
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue, ready] as const;
}
