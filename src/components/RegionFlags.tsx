import type { ReactNode } from "react";

const box = "h-3.5 w-5 shrink-0 rounded-[1px] ring-1 ring-black/20";

/** Small inline flags for regions that have no emoji flag. */
export const REGION_FLAGS: Record<string, ReactNode> = {
  ca: (
    <svg viewBox="0 0 9 6" className={box} aria-hidden>
      <rect width="9" height="6" fill="#FCDD09" />
      <g fill="#DA121A">
        <rect y="0.665" width="9" height="0.665" />
        <rect y="1.995" width="9" height="0.665" />
        <rect y="3.325" width="9" height="0.665" />
        <rect y="4.655" width="9" height="0.665" />
      </g>
    </svg>
  ),
  val: (
    <svg viewBox="0 0 9 6" className={box} aria-hidden>
      <rect width="9" height="6" fill="#FCDD09" />
      <g fill="#DA121A">
        <rect y="0.665" width="9" height="0.665" />
        <rect y="1.995" width="9" height="0.665" />
        <rect y="3.325" width="9" height="0.665" />
        <rect y="4.655" width="9" height="0.665" />
      </g>
      <rect width="2.2" height="6" fill="#0B4EA2" />
      <rect x="2.2" width="0.18" height="6" fill="#FCDD09" />
    </svg>
  ),
  eu: (
    <svg viewBox="0 0 9 6" className={box} aria-hidden>
      <rect width="9" height="6" fill="#D52B1E" />
      <path d="M0 0 L9 6 M9 0 L0 6" stroke="#009B48" strokeWidth="1.1" />
      <path d="M4.5 0 V6 M0 3 H9" stroke="#fff" strokeWidth="1.1" />
    </svg>
  ),
  gl: (
    <svg viewBox="0 0 9 6" className={box} aria-hidden>
      <rect width="9" height="6" fill="#fff" />
      <path d="M0.4 0 L9 5.7" stroke="#0F47AF" strokeWidth="1" />
    </svg>
  ),
};
