"use client";

// Owns the single scroll clock for the whole experience: Lenis drives smooth
// scrolling, GSAP's ticker drives Lenis, and one master ScrollTrigger reads the
// story track's progress and writes it into the shared scroll-state module.
// Nothing else should call requestAnimationFrame for scroll — one clock only.

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { setProgress } from "./scroll-state";

let _lenis: Lenis | null = null;

export function scrollToChapter(index: number): void {
  const target = index * window.innerHeight;
  if (_lenis) {
    _lenis.scrollTo(target, { duration: 1.2 });
  } else {
    window.scrollTo({ top: target });
  }
}

export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    _lenis = new Lenis({
      smoothWheel: true,
      duration: 1.1,
      // Slightly eased, long-tail wheel feel typical of high-end WebGL sites.
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });

    const lenis = _lenis;

    // Keep ScrollTrigger in sync with Lenis' virtual scroll position.
    lenis.on("scroll", ScrollTrigger.update);

    // Drive Lenis from GSAP's ticker (gsap works in seconds, Lenis in ms).
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Master trigger: normalized progress across the whole story track.
    const trigger = ScrollTrigger.create({
      trigger: "#story-track",
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => setProgress(self.progress),
    });

    // Smooth-scroll same-page anchor links (header nav) through Lenis so they
    // don't fight the virtual scroll position.
    const onAnchorClick = (event: MouseEvent) => {
      const link = (event.target as HTMLElement)?.closest?.(
        'a[href^="#"]',
      ) as HTMLAnchorElement | null;
      if (!link) return;
      const id = link.getAttribute("href");
      if (!id || id === "#") return;
      const el = document.querySelector(id);
      if (!el) return;
      event.preventDefault();
      lenis.scrollTo(el as HTMLElement, { offset: 0 });
    };
    document.addEventListener("click", onAnchorClick);

    // Fonts/layout can shift positions after mount; recompute once settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);
    const settle = window.setTimeout(refresh, 300);

    return () => {
      document.removeEventListener("click", onAnchorClick);
      window.removeEventListener("load", refresh);
      window.clearTimeout(settle);
      trigger.kill();
      gsap.ticker.remove(raf);
      lenis.destroy();
      _lenis = null;
    };
  }, []);

  return <>{children}</>;
}
