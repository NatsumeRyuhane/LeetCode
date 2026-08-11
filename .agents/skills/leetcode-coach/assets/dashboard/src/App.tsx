/**
 * Shell: header readout, nav, route dispatch.
 *
 * The dashboard is a read-only instrument over the practice repo. It never
 * writes, so every state it can be in is a state of the record itself — empty,
 * partial, or full — and each is rendered honestly rather than hidden.
 */
import { useMemo } from 'react';

import { Empty, Panel, TooltipProvider } from './components/hud.tsx';
import { derive } from './lib/analytics.ts';
import { useTheme } from './lib/useTheme.ts';
import { useHashRoute, useSnapshot } from './lib/useSnapshot.ts';
import { Ability } from './views/Ability.tsx';
import { Overview } from './views/Overview.tsx';
import { SessionDetail, Sessions } from './views/Sessions.tsx';
import { Tags } from './views/Tags.tsx';
import { Timing } from './views/Timing.tsx';

const NAV = [
  { href: '/', label: 'Overview' },
  { href: '/ability', label: 'Ability' },
  { href: '/sessions', label: 'Sessions' },
  { href: '/tags', label: 'Tags' },
  { href: '/timing', label: 'Timing' },
];

export default function App() {
  const { data, error, loading, refreshing, reload } = useSnapshot();
  const [route, go] = useHashRoute();
  const [theme, toggleTheme] = useTheme();

  const derived = useMemo(() => (data ? derive(data) : undefined), [data]);

  const activeNav =
    NAV.slice()
      .reverse()
      .find((n) => (n.href === '/' ? route === '/' : route.startsWith(n.href)))?.href ?? '/';

  return (
    <TooltipProvider>
      <div className="relative min-h-screen">
        <div className="hud-lattice pointer-events-none fixed inset-0" aria-hidden />

        <div className="relative mx-auto max-w-[1440px] px-5 py-5">
          {/* ── header readout ─────────────────────────────────────── */}
          <header className="hud-ticks border border-line bg-panel">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line-muted px-4 py-3">
              <div className="flex items-baseline gap-3">
                <span className="hud-value text-[15px] font-semibold tracking-[0.14em] text-ink">
                  COACH
                </span>
                <span className="hud-label">// TRAINING RECORD</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hud-label" title={data?.repoRoot}>
                  {data?.repoRoot
                    ? `REPO ${data.repoRoot.split('/').slice(-2).join('/')}`
                    : 'REPO —'}
                </span>
                <span className="hud-label flex items-center gap-1.5">
                  <span
                    aria-hidden
                    className="inline-block h-1.5 w-1.5"
                    style={{ background: error ? 'var(--color-danger)' : 'var(--color-ok)' }}
                  />
                  {error ? 'LINK DOWN' : refreshing ? 'SYNC' : 'LIVE'}
                </span>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
                  className="hud-label border border-line-muted px-2 py-1 hover:border-line hover:text-ink"
                >
                  {theme === 'dark' ? '☀ Light' : '☾ Dark'}
                </button>
                <button
                  type="button"
                  onClick={reload}
                  className="hud-label border border-line-muted px-2 py-1 hover:border-line hover:text-ink"
                >
                  Refresh
                </button>
              </div>
            </div>

            <nav className="flex flex-wrap">
              {NAV.map((n) => {
                const active = activeNav === n.href;
                return (
                  <button
                    key={n.href}
                    type="button"
                    onClick={() => go(n.href)}
                    aria-current={active ? 'page' : undefined}
                    className={`hud-label border-r border-line-muted px-4 py-2.5 ${
                      active
                        ? 'bg-subtle text-ink'
                        : 'text-ink-muted hover:bg-subtle hover:text-ink'
                    }`}
                    style={active ? { boxShadow: 'none', borderBottom: '1px solid var(--color-cat-structure)' } : undefined}
                  >
                    {n.label}
                  </button>
                );
              })}
            </nav>
          </header>

          {/* ── banners ────────────────────────────────────────────── */}
          {data?.demo ? (
            <div
              className="mt-3 border px-3 py-2 text-[11px]"
              style={{ borderColor: 'var(--color-attention)', color: 'var(--color-attention)' }}
            >
              <span className="hud-label" style={{ color: 'inherit' }}>
                ▲ DEMO FIXTURE
              </span>{' '}
              — synthetic data, not your practice record. Run <code className="hud-num">npm run dev</code>{' '}
              to read the real repo.
            </div>
          ) : null}

          {error ? (
            <div
              className="mt-3 border px-3 py-2 text-[11px]"
              style={{ borderColor: 'var(--color-danger)', color: 'var(--color-danger)' }}
            >
              <span className="hud-label" style={{ color: 'inherit' }}>
                × DATA LINK
              </span>{' '}
              {error}
            </div>
          ) : null}

          {data?.warnings.length ? (
            <div className="mt-3 border border-line-muted px-3 py-2">
              <span className="hud-label" style={{ color: 'var(--color-attention)' }}>
                ▲ {data.warnings.length} NOTICE{data.warnings.length > 1 ? 'S' : ''}
              </span>
              <ul className="mt-1.5">
                {data.warnings.map((w) => (
                  <li key={w} className="text-[11px] text-ink-subtle">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* ── body ───────────────────────────────────────────────── */}
          <main
            className="mt-3"
            // Hold the previous render at reduced opacity on refetch — no skeleton flash.
            style={{ opacity: refreshing && data ? 0.7 : 1, transition: 'opacity 120ms linear' }}
          >
            {loading && !data ? (
              <Panel label="Boot">
                <Empty label="READING RECORD" hint="Loading db/*.jsonl, sessions/, NOTES.md, TAGS.md…" />
              </Panel>
            ) : !data || !derived ? (
              <Panel label="Boot">
                <Empty
                  label="NO RECORD"
                  hint="The dashboard could not read a practice repo. Set COACH_REPO_ROOT to the repo root and refresh."
                />
              </Panel>
            ) : route.startsWith('/sessions/') ? (
              <SessionDetail
                snapshot={data}
                derived={derived}
                sessionKey={decodeURIComponent(route.slice('/sessions/'.length))}
                onBack={() => go('/sessions')}
              />
            ) : route.startsWith('/sessions') ? (
              <Sessions derived={derived} onOpen={(key) => go(`/sessions/${encodeURIComponent(key)}`)} />
            ) : route.startsWith('/ability') ? (
              <Ability snapshot={data} derived={derived} />
            ) : route.startsWith('/tags') ? (
              <Tags snapshot={data} derived={derived} onOpen={(key) => go(`/sessions/${encodeURIComponent(key)}`)} />
            ) : route.startsWith('/timing') ? (
              <Timing derived={derived} onOpen={(key) => go(`/sessions/${encodeURIComponent(key)}`)} />
            ) : (
              <Overview
                snapshot={data}
                derived={derived}
                onOpen={(key) => go(`/sessions/${encodeURIComponent(key)}`)}
                onNav={go}
              />
            )}
          </main>

          <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line-muted pt-3">
            <span className="hud-label">
              READ-ONLY INSTRUMENT · WRITES NOTHING TO THE REPO
            </span>
            <span className="hud-label">
              {data ? `SNAPSHOT ${new Date(data.generatedAt).toLocaleTimeString()}` : '—'}
            </span>
          </footer>
        </div>
      </div>
    </TooltipProvider>
  );
}
