// Tuning knobs for the particle sphere

export const SHELL_COUNT = 4000;
export const LEAK_COUNT = 800;
export const TOTAL_COUNT = SHELL_COUNT + LEAK_COUNT;

export const SPHERE_RADIUS = 1.15;

// Leak origin in local sphere space (normalized direction)
export const LEAK_ORIGIN = [0.4, -0.6, 0.7] as const;

// Colors
export const SHELL_COLOR = "#f0f0f0";
export const LEAK_COLOR_START = "#59b0ff"; // accent blue
export const LEAK_COLOR_END = "#1a3a5c"; // dark blue fade-out

// Animation
export const AUTO_ROTATE_SPEED = 0.08; // radians per second
export const BREATHING_AMPLITUDE = 0.03;
export const LEAK_SPEED = 0.2; // slower for smoky feel
export const LEAK_TRAVEL_DISTANCE = 2.2;
export const LEAK_TURBULENCE = 0.25; // more turbulence for smoke
export const LEAK_CONE_ANGLE = 0.35; // radians — half-angle of the emission cone

// Interaction
export const CURSOR_BRIGHTNESS_BOOST = 0.6;
export const CURSOR_MAGNETIC_STRENGTH = 0.4; // pull strength toward cursor
export const DRAG_SENSITIVITY = 0.006;
export const MOMENTUM_DECAY = 0.92;

// Sizes
export const SHELL_POINT_SIZE = 2.5;
export const LEAK_POINT_SIZE = 5.0; // larger for smoke puffs

// Camera
export const CAMERA_POSITION = [0, 0, 4.5] as const;
export const CAMERA_FOV = 50;
