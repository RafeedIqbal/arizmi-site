import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/* Shared with the React hook in lib/useReducedMotion.ts. */
export { prefersReducedMotion } from "./reducedMotion";
