/**
 * Snapshot loading + live refresh.
 *
 * The `coach-data` plugin pushes `coach:update` over Vite's HMR socket whenever
 * anything under `db/` or `sessions/` changes, so a debrief commit lands on
 * screen without a reload. A slow poll backs it up for the built/preview case,
 * where there is no HMR channel.
 */
import { useCallback, useEffect, useRef, useState } from 'react';

import type { Snapshot } from './types.ts';

const POLL_MS = 30_000;

export interface SnapshotState {
  data?: Snapshot;
  error?: string;
  /** True only on the very first load — later refetches hold the previous render. */
  loading: boolean;
  refreshing: boolean;
  reload: () => void;
}

export function useSnapshot(): SnapshotState {
  const [data, setData] = useState<Snapshot>();
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const inFlight = useRef(false);

  const load = useCallback(async () => {
    if (inFlight.current) return;
    inFlight.current = true;
    setRefreshing(true);
    try {
      const res = await fetch('/api/snapshot', { cache: 'no-store' });
      if (!res.ok) throw new Error(`snapshot request failed — HTTP ${res.status}`);
      const json = (await res.json()) as Snapshot & { error?: string };
      if (json.error) throw new Error(json.error);
      setData(json);
      setError(undefined);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      inFlight.current = false;
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
    const timer = setInterval(() => void load(), POLL_MS);
    // A stable reference — `off` only unsubscribes the exact function it was given.
    const onPush = () => void load();
    const hot = import.meta.hot;
    hot?.on('coach:update', onPush);
    return () => {
      clearInterval(timer);
      hot?.off('coach:update', onPush);
    };
  }, [load]);

  return { data, error, loading, refreshing, reload: () => void load() };
}

/** Minimal hash router — the dashboard has five destinations, not an app's worth. */
export function useHashRoute(): [string, (next: string) => void] {
  const [hash, setHash] = useState(() => window.location.hash.slice(1) || '/');
  useEffect(() => {
    const onChange = () => setHash(window.location.hash.slice(1) || '/');
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);
  return [hash, (next: string) => { window.location.hash = next; }];
}
