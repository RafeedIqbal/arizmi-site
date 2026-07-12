/**
 * Homepage "How ideas become systems" steps (TASK-006), transcribed exactly
 * from docs/specs/homepage.md section 2. Server-safe data consumed by
 * components/home/ProcessSection.tsx. The `index` string ("01"–"04") is part
 * of the approved label and is rendered verbatim, not derived, so the numbering
 * can never drift from the source copy.
 */
export interface ProcessStep {
  readonly index: string;
  readonly title: string;
  readonly description: string;
}

export const PROCESS_TITLE = "How ideas become systems";

export const PROCESS_STEPS: readonly ProcessStep[] = [
  {
    index: "01",
    title: "Shape the idea",
    description:
      "Turn the rough thought, workflow or opportunity into something clear enough to build.",
  },
  {
    index: "02",
    title: "Create your BluePrint",
    description:
      "Map the users, features, journeys, risks and first version.",
  },
  {
    index: "03",
    title: "Build the system",
    description:
      "Design and develop the product, platform, app or AI-enabled tool.",
  },
  {
    index: "04",
    title: "Improve after launch",
    description:
      "Support, iterate and evolve the product once real users are involved.",
  },
] as const;
