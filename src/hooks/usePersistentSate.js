// hooks/usePersistentState.js
import { useEffect, useState } from 'react';

export const usePersistentState = (key, initial, normalize = (v) => v) => {
  const [state, setState] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem(key));
      return raw ? normalize(raw) : initial;
    } catch {
      return initial;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState];
};