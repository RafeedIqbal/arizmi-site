"use client";

import { useRef, useLayoutEffect } from "react";
import Image from "next/image";
import { gsap, prefersReducedMotion } from "@/lib/motion";

export default function HeroSection() {
  const rootRef = useRef<HTMLElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const logoTextRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.set(logoRef.current, { scale: 4, transformOrigin: "top left" });
      gsap.set(logoTextRef.current, { opacity: 0, y: 8 });

      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: () => `+=${Math.round(window.innerHeight * 0.4)}`,
          invalidateOnRefresh: true,
          scrub: 0.5,
        },
      });
      heroTl.to(
        logoRef.current,
        { scale: 1, ease: "none", duration: 1 },
        0
      );
      heroTl.to(
        logoTextRef.current,
        { opacity: 1, y: 0, ease: "none", duration: 0.35 },
        0.6
      );
      heroTl.to(
        imageRef.current,
        { yPercent: -6, ease: "none", duration: 1 },
        0
      );
      heroTl.to(
        bottomRef.current,
        { yPercent: -14, ease: "none", duration: 1 },
        0
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div
        ref={logoRef}
        data-testid="hero-logo"
        style={{
          position: "fixed",
          top: "max(16px, env(safe-area-inset-top, 16px))",
          left: "var(--section-px)",
          zIndex: 105,
          pointerEvents: "none",
        }}
        className="w-10 sm:w-[88px]"
      >
        <Image
          src="/logo.svg"
          alt="Arizmi logo"
          width={500}
          height={500}
          style={{
            width: "100%",
            height: "auto",
          }}
        />
        <div
          ref={logoTextRef}
          data-testid="hero-wordmark"
          className="hidden sm:block"
          style={{
            width: "100%",
            marginTop: "4px",
          }}
        >
          <Image
            src="/logo_text.svg"
            alt=""
            aria-hidden="true"
            width={23471}
            height={3962}
            style={{
              width: "100%",
              height: "auto",
            }}
          />
        </div>
      </div>

      <section
        id="hero"
        ref={rootRef}
        style={{
          height: "160vh",
          position: "relative",
          zIndex: 0,
        }}
      >
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <div
          ref={imageRef}
          data-testid="hero-image"
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
          <Image
            src="/hero_image.png"
            alt="Arizmi Labs hero artwork"
            fill
            priority
            sizes="(max-width: 640px) calc(100vw - 2.5rem), calc(100vw - 4rem)"
            style={{
              objectFit: "cover",
            }}
          />
        </div>

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
    </>
  );
}
