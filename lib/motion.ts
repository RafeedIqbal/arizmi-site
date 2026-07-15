import gsap from "gsap";
import { Draggable } from "gsap/dist/Draggable";
import { InertiaPlugin } from "gsap/InertiaPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(Draggable, InertiaPlugin, ScrollTrigger);

export { Draggable, gsap, InertiaPlugin, ScrollTrigger };

/* Shared with the React hook in lib/useReducedMotion.ts. */
export { prefersReducedMotion } from "./reducedMotion";
