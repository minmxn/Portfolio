"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { site } from "@/content";

export function SiteHeader() {
  const headerRef = useRef<HTMLElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

    const handleScrolledFlag = () => {
      setScrolled(window.scrollY > 24);
    };
    handleScrolledFlag();
    window.addEventListener("scroll", handleScrolledFlag, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScrolledFlag);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className={`fixed top-0 z-50 w-full transition-[opacity,background-color,backdrop-filter] duration-[400ms] ${
        scrolled || menuOpen
          ? "bg-background/80 backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
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
        <button
          type="button"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="font-sans text-xs tracking-[0.15em] text-muted-foreground uppercase transition-colors hover:text-glow md:hidden"
        >
          {menuOpen ? "Close" : "Menu"}
        </button>
      </div>
      {menuOpen && (
        <div
          className="fixed inset-0 top-16 z-40 bg-background/95 backdrop-blur-md md:hidden"
          onClick={() => setMenuOpen(false)}
        >
          <nav className="flex flex-col items-center gap-8 pt-20">
            {site.nav.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="font-display text-2xl font-bold tracking-tight text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
