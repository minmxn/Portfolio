"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { site } from "@/content";

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) return;

    let lastScrollY = window.scrollY;
    let permanentlyVisible = false;

    const show = () => {
      header.style.opacity = "1";
      header.style.pointerEvents = "";
    };
    const hide = () => {
      header.style.opacity = "0";
      header.style.pointerEvents = "none";
    };

    const handleScroll = () => {
      if (permanentlyVisible) return;
      if (window.innerWidth < 1024) return;
      const currentY = window.scrollY;
      const scrollingUp = currentY < lastScrollY;
      if (currentY > 80 && !scrollingUp) {
        hide();
      } else {
        show();
      }
      lastScrollY = currentY;
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          permanentlyVisible = true;
          show();
        }
      },
      { threshold: 0.1 },
    );

    const projectsSection = document.querySelector("#projects");
    if (projectsSection) observer.observe(projectsSection);

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <header ref={headerRef} className="fixed top-0 z-50 w-full transition-opacity duration-[400ms]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-6">
        <Link
          href="/"
          className="font-display text-lg font-bold tracking-tight text-foreground/90 transition-colors hover:text-foreground"
        >
          {site.name}
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          {site.nav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="font-sans text-xs font-semibold tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-glow"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
