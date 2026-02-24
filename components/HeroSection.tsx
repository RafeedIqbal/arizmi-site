"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, prefersReducedMotion } from "@/lib/motion";

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      // Phase 1: Logo shrinks down from 4x to 1x
      gsap.fromTo(
        logoRef.current,
        { scale: 4 },
        {
          scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: root,
            start: "top top",
            end: "40% top",
            scrub: 0.5,
          },
        }
      );

      // Hero image fades out with parallax
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

      // Bottom bar fades out with parallax
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
        height: "clamp(150vh, 180vh, 200vh)",
        position: "relative",
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
            borderRadius: "8px",
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
            bottom: "clamp(5rem, 8vw, 7rem)",
            left: "var(--section-px)",
            right: "var(--section-px)",
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
            bottom: "clamp(1.5rem, 3vw, 3rem)",
            left: "var(--section-px)",
            right: "var(--section-px)",
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
