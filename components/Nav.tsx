"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

const links = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Why Us", href: "#why" },
];

const sectionIds = ["hero", "services", "work", "process", "why", "contact"];

export default function Nav() {
  const [active, setActive] = useState("");
  const [heroScrolled, setHeroScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const textRef = useRef<HTMLAnchorElement>(null);

  const scrollTo = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, href: string) => {
      e.preventDefault();
      const id = href.replace("#", "");
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
      }
      setMobileOpen(false);
    },
    []
  );

  // ScrollTrigger to detect when hero section is scrolled past
  useEffect(() => {
    const st = ScrollTrigger.create({
      trigger: "#hero",
      start: "top top",
      end: "bottom top",
      onLeave: () => setHeroScrolled(true),
      onEnterBack: () => setHeroScrolled(false),
    });

    return () => st.kill();
  }, []);

  // Animate the "Arizmi" text based on heroScrolled state
  useEffect(() => {
    if (!textRef.current) return;
    const duration = prefersReducedMotion() ? 0 : 0.3;
    if (heroScrolled) {
      gsap.to(textRef.current, {
        opacity: 0,
        width: 0,
        marginRight: 0,
        duration,
        ease: "power2.inOut",
      });
    } else {
      gsap.to(textRef.current, {
        opacity: 1,
        width: "auto",
        marginRight: 12,
        duration,
        ease: "power2.inOut",
      });
    }
  }, [heroScrolled]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length > 0) {
          const top = visible.reduce((a, b) =>
            a.boundingClientRect.top < b.boundingClientRect.top ? a : b
          );
          setActive(top.target.id);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 640px)");
    const handler = () => {
      if (mq.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Close mobile menu when clicking outside or pressing Escape
  useEffect(() => {
    if (!mobileOpen) return;
    const handleClick = (e: MouseEvent) => {
      const nav = (e.target as HTMLElement).closest("nav");
      if (!nav) setMobileOpen(false);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [mobileOpen]);

  return (
    <>
      {/* Desktop nav — centered pill */}
      <nav className="fixed top-[max(1rem,env(safe-area-inset-top,1rem))] left-1/2 -translate-x-1/2 z-[100] whitespace-nowrap hidden sm:block">
        <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-full py-2.5 pl-6 pr-3">
          <a
            ref={textRef}
            href="#hero"
            onClick={(e) => scrollTo(e, "#hero")}
            className="text-[var(--text)] font-bold text-sm mr-3 no-underline overflow-hidden"
          >
            Arizmi
          </a>

          <div className="flex items-center gap-1">
            {links.map(({ label, href }) => {
              const id = href.replace("#", "");
              const isActive = active === id;
              return (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => scrollTo(e, href)}
                  className={`
                    text-sm no-underline rounded-full px-3 py-1.5
                    transition-all duration-200
                    ${isActive
                      ? "text-[var(--text)] bg-white/[0.08]"
                      : "text-white/40 hover:text-white/70"
                    }
                  `}
                >
                  {label}
                </a>
              );
            })}
          </div>

          <a
            href="#contact"
            onClick={(e) => scrollTo(e, "#contact")}
            className={`
              text-sm no-underline rounded-full px-5 py-1.5 ml-1.5
              transition-all duration-200 border
              ${active === "contact"
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)]"
              }
            `}
          >
            Get Started
          </a>
        </div>
      </nav>

      {/* Mobile nav — compact burger, right-aligned */}
      <nav className="fixed top-[max(1rem,env(safe-area-inset-top,1rem))] right-[max(1.5rem,env(safe-area-inset-right,1.5rem))] z-[100] sm:hidden flex flex-col items-end">
        <button
          onClick={() => setMobileOpen((prev) => !prev)}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-black/40 backdrop-blur-xl border border-white/[0.08]"
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav-menu"
        >
          <div className="flex flex-col items-center justify-center gap-[5px] w-[18px]">
            <span
              className={`block h-[1.5px] w-full bg-[var(--text)] rounded-full transition-transform duration-300 origin-center ${mobileOpen ? "rotate-45 translate-y-[3.25px]" : ""
                }`}
            />
            <span
              className={`block h-[1.5px] w-full bg-[var(--text)] rounded-full transition-transform duration-300 origin-center ${mobileOpen ? "-rotate-45 -translate-y-[3.25px]" : ""
                }`}
            />
          </div>
        </button>

        {/* Mobile dropdown */}
        <div
          id="mobile-nav-menu"
          role="menu"
          className={`
            absolute top-full right-0 mt-2 origin-top-right min-w-[180px]
            transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
            ${mobileOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}
          `}
        >
          <div className="bg-black/60 backdrop-blur-xl border border-white/[0.08] rounded-2xl p-3 flex flex-col gap-0.5">
            {links.map(({ label, href }) => {
              const id = href.replace("#", "");
              const isActive = active === id;
              return (
                <a
                  key={label}
                  href={href}
                  onClick={(e) => scrollTo(e, href)}
                  className={`
                    text-sm no-underline rounded-xl px-4 py-2.5 whitespace-nowrap
                    transition-all duration-200
                    ${isActive
                      ? "text-[var(--text)] bg-white/[0.08]"
                      : "text-white/50 hover:text-white/70 hover:bg-white/[0.04]"
                    }
                  `}
                >
                  {label}
                </a>
              );
            })}
            <a
              href="#contact"
              onClick={(e) => scrollTo(e, "#contact")}
              className={`
                text-sm no-underline rounded-xl px-4 py-2.5 mt-1 whitespace-nowrap
                transition-all duration-200 border text-center
                ${active === "contact"
                  ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                  : "text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)]"
                }
              `}
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}
