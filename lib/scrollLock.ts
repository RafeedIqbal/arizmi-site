/**
 * Ref-counted body scroll lock, so nested overlay UI (menu → dialog, dialog
 * → drawer) cannot leak a stuck `overflow: hidden` when the pieces unmount
 * in any order. The body is restored only when every lock is released.
 */
let lockCount = 0;
let previousBodyOverflow = "";

/**
 * Locks body scrolling and returns a release function. The release is
 * idempotent, so it is safe as a React effect cleanup.
 */
export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  if (lockCount === 0) {
    previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount += 1;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount -= 1;
    if (lockCount === 0) {
      document.body.style.overflow = previousBodyOverflow;
    }
  };
}
