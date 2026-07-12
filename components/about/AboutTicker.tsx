"use client";

import { useState } from "react";

const PHRASE = "For people building something that does not exist yet.";
/**
 * Visual repetitions per group. Two identical groups make the -50% scroll
 * seamless; every copy is decorative (the row is aria-hidden).
 */
const REPEATS = 4;

/**
 * Studio-motto ticker (TASK-016). The phrase reaches assistive tech exactly
 * once — the sr-only paragraph — while the moving row is aria-hidden, so the
 * repetition is purely visual rhythm and never duplicates screen-reader output.
 *
 * Movement pauses on hover and focus-within (CSS), and an explicit toggle lets
 * any pointer or keyboard user stop it (WCAG 2.2.2 Pause, Stop, Hide). Under
 * prefers-reduced-motion the animation is removed and the toggle hidden in CSS,
 * so there is no continuous movement to manage.
 */
export default function AboutTicker() {
  const [paused, setPaused] = useState(false);
  const copies = Array.from({ length: REPEATS });

  return (
    <div className="about-ticker" data-paused={paused || undefined}>
      <p className="sr-only">{PHRASE}</p>
      <div className="about-ticker__viewport" aria-hidden="true">
        <div className="about-ticker__track">
          <div className="about-ticker__group">
            {copies.map((_, i) => (
              <span key={i} className="about-ticker__item">
                {PHRASE}
              </span>
            ))}
          </div>
          <div className="about-ticker__group">
            {copies.map((_, i) => (
              <span key={i} className="about-ticker__item">
                {PHRASE}
              </span>
            ))}
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setPaused((current) => !current)}
        aria-pressed={paused}
        aria-label={paused ? "Play scrolling motto" : "Pause scrolling motto"}
        className="about-ticker__toggle"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="currentColor"
          aria-hidden="true"
        >
          {paused ? (
            <path d="M2.5 1.5l7 4.5-7 4.5z" />
          ) : (
            <path d="M2.5 1.5h2.5v9H2.5zM7 1.5h2.5v9H7z" />
          )}
        </svg>
        {paused ? "Play" : "Pause"}
      </button>
    </div>
  );
}
