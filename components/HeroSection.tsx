"use client";

import { useRef, useLayoutEffect } from "react";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoTextRef = useRef<HTMLImageElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Pre-pin timeline (0 → 50vh scroll): logo shrink + text fade + parallax
      const prePinTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "50% top",
          scrub: 0.5,
        },
      });
      prePinTl.fromTo(
        logoRef.current,
        { scale: 4 },
        { scale: 1, ease: "none", duration: 0.8 },
        0
      );
      prePinTl.fromTo(
        logoTextRef.current,
        { opacity: 0, y: 8 },
        { opacity: 1, y: 0, ease: "none", duration: 0.2 },
        0.6
      );
      // Parallax: image drifts up slowly — feels further away
      prePinTl.to(
        imageRef.current,
        { yPercent: -6, ease: "none", duration: 1 },
        0
      );
      // Parallax: bottom bar drifts up faster — feels closer
      prePinTl.to(
        bottomRef.current,
        { yPercent: -14, ease: "none", duration: 1 },
        0
      );

      // Pin timeline (pin at 50%, 50vh duration): smooth fade out with drift
      const pinTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "50% top",
          end: "+=50vh",
          pin: true,
          pinSpacing: false,
          anticipatePin: 1,
          scrub: 0.5,
        },
      });
      pinTl.to(
        imageRef.current,
        { opacity: 0, scale: 0.97, yPercent: -12, ease: "power1.inOut", duration: 0.7 },
        0
      );
      pinTl.to(
        bottomRef.current,
        { opacity: 0, y: -30, ease: "power1.inOut", duration: 0.6 },
        0.05
      );

      // Toggle hero-scrolled class for Nav
      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom top",
        onLeave: () =>
          document.documentElement.classList.add("hero-scrolled"),
        onEnterBack: () =>
          document.documentElement.classList.remove("hero-scrolled"),
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="hero"
      ref={rootRef}
      style={{
        height: "100vh",
        position: "relative",
        zIndex: 0,
      }}
    >
      {/* Logo — fixed top-left, starts 4x size and scales down */}
      <div
        ref={logoRef}
        style={{
          position: "fixed",
          top: "max(16px, env(safe-area-inset-top, 16px))",
          left: "var(--section-px)",
          zIndex: 105,
          pointerEvents: "none",
          transformOrigin: "top left",
        }}
        className="w-10 sm:w-[88px]"
      >
        <img
          src="/logo.svg"
          alt="Arizmi"
          width={500}
          height={500}
          style={{
            width: "100%",
            height: "auto",
          }}
        />
        <img
          ref={logoTextRef}
          src="/logo_text.svg"
          alt="Arizmi"
          className="hidden sm:block"
          style={{
            opacity: 0,
            width: "100%",
            height: "auto",
            marginTop: "4px",
          }}
        />
      </div>

      {/* Sticky content — stays in view, then scrolls away under next section */}
      <div
        style={{
          position: "relative",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {/* Hero image — full viewport height with horizontal padding */}
        <div
          ref={imageRef}
          style={{
            position: "absolute",
            top: "1.5rem",
            bottom: "clamp(5rem, 8vw, 7rem)",
            left: "var(--section-px)",
            right: "var(--section-px)",
            borderRadius: "16px",
            overflow: "hidden",
          }}
        >
          <img
            src="/hero_image.png"
            alt="Hero"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Bottom bar — H1 left, CTA right */}
        <div
          ref={bottomRef}
          style={{
            position: "absolute",
            bottom: "clamp(3.5rem, 8vw, 8rem)",
            left: "calc(var(--section-px) + clamp(1rem, 4vw, 4rem))",
            right: "calc(var(--section-px) + clamp(1rem, 4vw, 4rem))",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "1.5rem",
            flexWrap: "wrap",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(1.25rem, 3vw, 2.5rem)",
              fontWeight: 900,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: "500px",
              margin: 0,
            }}
          >
            Start-Up apps and websites,
            <br />
            built by fellow Start-Up founders
          </h1>

          <a
            href="#contact"
            className="btn-primary"
            style={{
              background: "var(--accent)",
              color: "#000",
              padding: "0.75rem 2rem",
              borderRadius: "9999px",
              fontWeight: 600,
              fontSize: "clamp(0.875rem, 1vw, 1rem)",
              textDecoration: "none",
              display: "inline-block",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            Get Started
          </a>
        </div>
      </div>
    </section>
  );
}
