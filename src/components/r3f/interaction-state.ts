// Module-level active crack state — plain mutable module, no React, same
// pattern as scroll-state.ts. Chapters poll getActiveCrack() in useFrame.

let _activeCrack: string | null = null;

export function getActiveCrack(): string | null {
  return _activeCrack;
}

export function setActiveCrack(id: string | null): void {
  _activeCrack = id;
}
