/**
 * Utility functions for the aviation traffic generator.
 * This module provides core helper functions used throughout the application.
 */

/**
 * Generates a random integer between min and max (inclusive).
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 * @returns Random integer in the specified range
 * @example
 * ```typescript
 * const altitude = rnd(1000, 5000); // Random altitude between 1000-5000 feet
 * ```
 */
export const rnd = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Picks a random element from an array.
 * @param arr - Array to pick from
 * @returns Random element from the array
 * @example
 * ```typescript
 * const aircraft = pick(["B737", "A320", "E190"]);
 * ```
 */
export const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
