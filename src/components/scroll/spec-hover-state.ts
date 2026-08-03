// Tiny pub-sub store for the currently hovered spec label.
// Lives outside React so the R3F component can write to it imperatively
// without triggering canvas re-renders.

type Listener = (spec: string | null) => void;
const listeners = new Set<Listener>();
let _current: string | null = null;

export function setHoveredSpec(spec: string | null): void {
  _current = spec;
  for (const fn of listeners) fn(spec);
}

export function subscribeHoveredSpec(fn: Listener): () => void {
  fn(_current);
  listeners.add(fn);
  return () => listeners.delete(fn);
}
