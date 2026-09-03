/**
 * Mutable simulation clock shared between the canvas loop (writer)
 * and the readout component (reader). Avoids re-rendering React 60×/s.
 */
export const simClock = {
  days: 0,
};

export const BASE_DAYS_PER_SECOND = 25;
