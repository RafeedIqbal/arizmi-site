// Tuning knobs for the particle sphere

export const SHELL_COUNT = 800;
export const LEAK_COUNT = 800;
export const TOTAL_COUNT = SHELL_COUNT + LEAK_COUNT;

export const SPHERE_RADIUS = 1.04;

// Emission origin in local sphere space (normalized direction)
export const LEAK_ORIGIN = [0.14, 0.88, 0.22] as const;
export const LEAK_ORIGIN_SPREAD = 0.032;

// Colors
export const SHELL_COLOR = "#f0f0f0";
export const LEAK_COLOR_START = "#59b0ff"; // accent blue
export const LEAK_COLOR_END = "#102031"; // dark blue fade-out

// Animation
export const AUTO_ROTATE_SPEED = 0.028; // radians per second
export const BREATHING_AMPLITUDE = 0.006;
export const LEAK_SPEED = 0.21;
export const LEAK_TURBULENCE = 0.045;
export const PLUME_ARC_HEIGHT = 0.55; // arc curvature above sphere surface
export const PLUME_PATH_SPREAD = 0.35; // per-particle lateral path variation
export const PLUME_ARRIVAL_SHRINK = 0.7; // lifecycle point where size shrink begins

// Interaction
export const CURSOR_BRIGHTNESS_BOOST = 0.24;
export const CURSOR_MAGNETIC_STRENGTH = 0.16; // pull strength toward cursor
export const DRAG_SENSITIVITY = 0.0048;
export const MOMENTUM_DECAY = 0.88;

// Sizes
export const SHELL_POINT_SIZE = 5.0;
export const LEAK_POINT_SIZE = 6.8;

// Camera
export const CAMERA_POSITION = [0, 0, 4.75] as const;
export const CAMERA_FOV = 48;
