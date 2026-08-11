/**
 * Markdown rendering for repo prose — `problem.md`, `log.md`, `NOTES.md`.
 *
 * react-markdown + remark-gfm does the parsing (GFM tables matter: `NOTES.md`
 * is a table). It renders to React elements rather than `innerHTML`, so repo
 * content is never injected as markup, and the `components` map below keeps
 * every element inside the HUD's line-art vocabulary.
 *
 * The one thing the parser can't know about is the coach's `#namespace:value`
 * tag convention, so text nodes get a post-pass that turns bare tags into chips.
 */
import type { ComponentProps, JSX, ReactNode } from 'react';
import { Children, isValidElement } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { namespaceColor } from './palette.ts';

const TAG_RE = /(#[a-z][a-z0-9-]*(?::[a-z0-9-]+)?)/gi;

/** Render a `#namespace:value` tag as a chip carrying its namespace hue. */
export function TagChip({ tag }: { tag: string }): JSX.Element {
  const colon = tag.indexOf(':');
  const ns = colon === -1 ? tag.slice(1) : tag.slice(1, colon);
  const color = namespaceColor(ns);
  return (
    <span
      className="hud-num inline-flex items-center border px-1 py-px align-baseline text-[10px] leading-none"
      style={{ borderColor: color, color }}
    >
      {tag}
    </span>
  );
}

/** Split raw strings on the tag pattern and swap in chips; recurse into elements. */
function decorateTags(children: ReactNode): ReactNode {
  return Children.map(children, (child, ci) => {
    if (typeof child === 'string') {
      if (!TAG_RE.test(child)) return child;
      TAG_RE.lastIndex = 0;
      return child
        .split(TAG_RE)
        .filter((part) => part !== '')
        .map((part, i) =>
          /^#[a-z]/i.test(part) ? <TagChip key={`${ci}-${i}`} tag={part} /> : part,
        );
    }
    if (isValidElement<{ children?: ReactNode }>(child) && child.props.children) {
      // Chips are already decorated — don't re-enter them.
      if (child.type === TagChip) return child;
    }
    return child;
  });
}

type El<T extends keyof JSX.IntrinsicElements> = ComponentProps<T>;

const components: Components = {
  h1: ({ children, ...p }: El<'h1'>) => (
    <h1 {...p} className="hud-label mt-6 mb-3 !text-[11px] text-ink first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children, ...p }: El<'h2'>) => (
    <h2 {...p} className="hud-label mt-6 mb-2 text-ink first:mt-0">
      {children}
    </h2>
  ),
  h3: ({ children, ...p }: El<'h3'>) => (
    <h3 {...p} className="hud-label mt-5 mb-2 first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children, ...p }: El<'h4'>) => (
    <h4 {...p} className="hud-label mt-4 mb-1 first:mt-0">
      {children}
    </h4>
  ),
  p: ({ children, ...p }: El<'p'>) => (
    <p {...p} className="my-2 text-ink-muted">
      {decorateTags(children)}
    </p>
  ),
  strong: ({ children, ...p }: El<'strong'>) => (
    <strong {...p} className="font-semibold text-ink">
      {children}
    </strong>
  ),
  em: ({ children, ...p }: El<'em'>) => (
    <em {...p} className="text-ink-muted not-italic opacity-80">
      {children}
    </em>
  ),
  a: ({ children, ...p }: El<'a'>) => (
    <a
      {...p}
      target="_blank"
      rel="noreferrer"
      className="text-seq-5 underline decoration-line underline-offset-2 hover:decoration-seq-5"
    >
      {children}
    </a>
  ),
  hr: () => <hr className="my-5 border-t border-line-muted" />,
  ul: ({ children, ...p }: El<'ul'>) => (
    <ul {...p} className="my-2">
      {children}
    </ul>
  ),
  ol: ({ children, ...p }: El<'ol'>) => (
    <ol {...p} className="my-2 list-decimal pl-5 marker:text-ink-subtle">
      {children}
    </ol>
  ),
  // Unordered items get a 1px tick rule via CSS (see theme.css); ordered keep
  // their native markers.
  li: ({ children, ...p }: El<'li'>) => (
    <li {...p} className="py-0.5 text-ink-muted">
      {decorateTags(children)}
    </li>
  ),
  blockquote: ({ children, ...p }: El<'blockquote'>) => (
    <blockquote {...p} className="my-3 border-l border-line pl-3 text-ink-muted">
      {decorateTags(children)}
    </blockquote>
  ),
  code: ({ children, className, ...p }: El<'code'>) => {
    const fenced = /language-/.test(className ?? '');
    if (fenced) {
      return (
        <code {...p} className="hud-num text-[11px] leading-relaxed text-ink-muted">
          {children}
        </code>
      );
    }
    return (
      <code {...p} className="hud-num border border-line-muted bg-subtle px-1 text-[11px] text-ink">
        {children}
      </code>
    );
  },
  pre: ({ children, ...p }: El<'pre'>) => (
    <pre
      {...p}
      className="my-3 overflow-x-auto border border-line-muted bg-canvas p-3 text-[11px]"
    >
      {children}
    </pre>
  ),
  table: ({ children, ...p }: El<'table'>) => (
    <div className="my-3 overflow-x-auto border border-line-muted">
      <table {...p} className="w-full border-collapse text-[12px]">
        {children}
      </table>
    </div>
  ),
  thead: ({ children, ...p }: El<'thead'>) => (
    <thead {...p} className="bg-subtle">
      {children}
    </thead>
  ),
  th: ({ children, ...p }: El<'th'>) => (
    <th {...p} className="hud-label border-b border-line-muted px-2 py-1.5 text-left font-normal">
      {children}
    </th>
  ),
  tr: ({ children, ...p }: El<'tr'>) => (
    <tr {...p} className="border-b border-line-muted last:border-0">
      {children}
    </tr>
  ),
  td: ({ children, ...p }: El<'td'>) => (
    <td {...p} className="px-2 py-1.5 align-top text-ink-muted">
      {decorateTags(children)}
    </td>
  ),
};

/**
 * Pull one `## Heading` section out of a document, without its heading line.
 * Used to surface `NOTES.md`'s "Focus next" and each dated block of `log.md`.
 */
export function extractSection(md: string, heading: RegExp): string | undefined {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const start = lines.findIndex((l) => /^#{2,3}\s/.test(l) && heading.test(l));
  if (start === -1) return undefined;
  const depth = (/^#+/.exec(lines[start]) ?? ['##'])[0].length;
  const rest = lines.slice(start + 1);
  const end = rest.findIndex((l) => {
    const m = /^(#+)\s/.exec(l);
    return !!m && m[1].length <= depth;
  });
  const body = (end === -1 ? rest : rest.slice(0, end)).join('\n').trim();
  return body || undefined;
}

/** Split `log.md` into its dated `## YYYY-MM-DD — session N` sections, newest first. */
export function splitLogSections(md: string): { title: string; body: string }[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const out: { title: string; body: string }[] = [];
  let current: { title: string; body: string[] } | null = null;
  for (const line of lines) {
    const m = /^##\s+(.*)$/.exec(line);
    if (m) {
      if (current) out.push({ title: current.title, body: current.body.join('\n').trim() });
      current = { title: m[1].trim(), body: [] };
    } else if (current) {
      current.body.push(line);
    }
  }
  if (current) out.push({ title: current.title, body: current.body.join('\n').trim() });
  return out.reverse();
}

export function Markdown({ source, className = '' }: { source: string; className?: string }) {
  return (
    <div className={`markdown ${className}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {source}
      </ReactMarkdown>
    </div>
  );
}
