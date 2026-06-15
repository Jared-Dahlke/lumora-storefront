import { useEffect } from 'react';

/** Calls `onEscape` when the Escape key is pressed and `active` is true. */
export function useEscapeKey(active: boolean, onEscape: () => void): void {
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onEscape();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, onEscape]);
}

/** Locks body scroll while `locked` is true (ref-counted across overlays). */
let lockCount = 0;
export function useBodyScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked) return;
    lockCount += 1;
    document.body.style.overflow = 'hidden';
    return () => {
      lockCount -= 1;
      if (lockCount <= 0) {
        lockCount = 0;
        document.body.style.overflow = '';
      }
    };
  }, [locked]);
}
