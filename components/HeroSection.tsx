"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const logo = logoRef.current;
    const root = rootRef.current;
    if (!logo || !root) return;

    const ctx = gsap.context(() => {
      // Capture logo's initial centered position
      const logoRect = logo.getBoundingClientRect();
      const startTop = logoRect.top;
      const startLeft = logoRect.left;
      const startWidth = logoRect.width;

      // Target: 40px logo in top-left of viewport
      const targetWidth = 40;
      const targetTop = 14;
      const targetLeft = 24;
      const scaleTo = targetWidth / startWidth;

      // Pin logo to its current visual position so GSAP can animate freely
      gsap.set(logo, {
        position: "fixed",
        top: startTop,
        left: startLeft,
        xPercent: 0,
        yPercent: 0,
        x: 0,
        y: 0,
        transformOrigin: "top left",
      });

      // Phase 1 — Logo shrinks to top-left (first half of scroll)
      gsap.to(logo, {
        top: targetTop,
        left: targetLeft,
        scale: scaleTo,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "center top",
          scrub: 0.5,
        },
      });

      // Phase 2 — Hero image fades out with parallax
      gsap.to(imageRef.current, {
        opacity: 0,
        y: -100,
        scale: 0.96,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "40% top",
          end: "95% top",
          scrub: 0.5,
        },
      });

      // Phase 2 — Bottom bar fades out with parallax
      gsap.to(bottomRef.current, {
        opacity: 0,
        y: -60,
        ease: "none",
        scrollTrigger: {
          trigger: root,
          start: "40% top",
          end: "90% top",
          scrub: 0.5,
        },
      });

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
        height: "200vh",
        position: "relative",
      }}
    >
      {/* Logo — fixed, persists after hero scroll */}
      <div
        ref={logoRef}
        style={{
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "clamp(200px, 40vw, 500px)",
          zIndex: 105,
          pointerEvents: "none",
        }}
      >
        <Image
          src="/logo.jpeg"
          alt="Arizmi"
          width={500}
          height={500}
          priority
          style={{
            width: "100%",
            height: "auto",
            mixBlendMode: "lighten",
            borderRadius: "12px",
          }}
        />
      </div>

      {/* Sticky content — stays in view, then scrolls away under next section */}
      <div
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        {/* Hero image — full viewport height with horizontal padding */}
        <div
          ref={imageRef}
          style={{
            position: "absolute",
            top: "1.5rem",
            bottom: "7rem",
            left: "clamp(1.5rem, 5vw, 4rem)",
            right: "clamp(1.5rem, 5vw, 4rem)",
            border: "2px dashed rgba(255, 255, 255, 0.12)",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--text-muted)",
            fontSize: "0.875rem",
            letterSpacing: "0.06em",
          }}
        >
          Hero Image (TBD)
        </div>

        {/* Bottom bar — H1 left, CTA right */}
        <div
          ref={bottomRef}
          style={{
            position: "absolute",
            bottom: "3rem",
            left: "2rem",
            right: "2rem",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "space-between",
            gap: "2rem",
            flexWrap: "wrap",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "clamp(1.5rem, 3vw, 2.5rem)",
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
            style={{
              background: "var(--accent)",
              color: "#000",
              padding: "0.875rem 2.5rem",
              borderRadius: "9999px",
              fontWeight: 600,
              fontSize: "1rem",
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
