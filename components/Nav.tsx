"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

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
    if (heroScrolled) {
      gsap.to(textRef.current, {
        opacity: 0,
        width: 0,
        marginRight: 0,
        duration: 0.3,
        ease: "power2.inOut",
      });
    } else {
      gsap.to(textRef.current, {
        opacity: 1,
        width: "auto",
        marginRight: 12,
        duration: 0.3,
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

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 z-[100] whitespace-nowrap max-w-[calc(100vw-2rem)]">
      <div className="flex items-center gap-1 bg-black/40 backdrop-blur-xl border border-white/[0.08] rounded-full py-2.5 pl-5 pr-3 sm:pl-6">
        <a
          ref={textRef}
          href="#hero"
          onClick={(e) => scrollTo(e, "#hero")}
          className="text-[var(--text)] font-bold text-sm mr-3 no-underline overflow-hidden hidden sm:inline-block"
          style={{ display: undefined }}
        >
          Arizmi
        </a>

        {/* Desktop links */}
        <div className="hidden sm:flex items-center gap-1">
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
                  ${
                    isActive
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

        {/* Desktop CTA */}
        <a
          href="#contact"
          onClick={(e) => scrollTo(e, "#contact")}
          className={`
            text-sm no-underline rounded-full px-5 py-1.5 ml-1.5
            transition-all duration-200 border hidden sm:inline-block
            ${
              active === "contact"
                ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                : "text-[var(--accent)] border-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)]"
            }
          `}
        >
          Get Started
        </a>

        {/* Mobile: show compact nav links inline */}
        <div className="flex sm:hidden items-center gap-0.5">
          {links.map(({ label, href }) => {
            const id = href.replace("#", "");
            const isActive = active === id;
            return (
              <a
                key={label}
                href={href}
                onClick={(e) => scrollTo(e, href)}
                className={`
                  text-xs no-underline rounded-full px-2 py-1
                  transition-all duration-200
                  ${
                    isActive
                      ? "text-[var(--text)] bg-white/[0.08]"
                      : "text-white/40"
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
              text-xs no-underline rounded-full px-3 py-1 ml-0.5
              transition-all duration-200 border
              ${
                active === "contact"
                  ? "bg-[var(--accent)] text-[var(--bg)] border-[var(--accent)]"
                  : "text-[var(--accent)] border-[var(--accent)]"
              }
            `}
          >
            Start
          </a>
        </div>
      </div>
    </nav>
  );
}
