import { useEffect, useRef, useState, type RefObject } from 'react';

/**
 * Measure a container's width so SVG can be drawn in real pixels.
 *
 * The alternative — a fixed viewBox with `preserveAspectRatio="none"` — scales
 * x and y unequally, which turns circular marks into ellipses and makes stroke
 * widths lie. Charts here draw at measured size instead.
 */
export function useMeasure<T extends HTMLElement>(): [RefObject<T | null>, number] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setWidth(el.getBoundingClientRect().width);
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width ?? 0;
      setWidth((prev) => (Math.abs(prev - w) > 0.5 ? w : prev));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return [ref, width];
}
