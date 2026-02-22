import { useEffect } from "react";
import Lenis from "lenis";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const isTouchDevice = window.matchMedia("(pointer: coarse)").matches;

    const lenis = new Lenis({
      duration: isTouchDevice ? 0.9 : 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.0,
    });
    window.__lenis = lenis;

    let frameId = 0;

    const raf = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(raf);
    };

    frameId = window.requestAnimationFrame(raf);

    const handleVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(frameId);
        return;
      }
      frameId = window.requestAnimationFrame(raf);
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      delete window.__lenis;
      document.removeEventListener("visibilitychange", handleVisibility);
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
    };
  }, []);

  return null;
}
