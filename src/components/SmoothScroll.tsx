import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const isTouchDevice = window.matchMedia("(hover: none), (pointer: coarse)").matches;

    const lenis = new Lenis({
      autoRaf: true,
      duration: isTouchDevice ? 0.95 : 1.05,
      lerp: isTouchDevice ? 0.08 : 0.1,
      smoothWheel: true,
      syncTouch: true,
      syncTouchLerp: 0.085,
      touchInertiaExponent: 1.2,
      wheelMultiplier: 0.85,
      touchMultiplier: 1.0,
      overscroll: false,
      anchors: true,
      allowNestedScroll: true,
    });
    window.__lenis = lenis;

    return () => {
      delete window.__lenis;
      lenis.destroy();
    };
  }, []);

  return null;
}
