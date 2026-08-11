import { useCallback, useEffect, useState } from 'react';

import type { ThemeName } from './primer.ts';

const KEY = 'coach:theme';

/**
 * Light/dark, stamped as `data-theme` on `<html>`.
 *
 * Deliberately *not* wired to `prefers-color-scheme`: the default is light and
 * only an explicit toggle changes it, so the dashboard looks the same on every
 * machine the record is opened on. `index.html` applies the stored choice
 * before first paint; this hook keeps React in step with it.
 */
export function useTheme(): [ThemeName, () => void] {
  const [theme, setTheme] = useState<ThemeName>(
    () => (document.documentElement.dataset.theme as ThemeName) || 'light',
  );

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      /* private mode / storage disabled — the toggle still works for this session */
    }
  }, [theme]);

  return [theme, useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])];
}
