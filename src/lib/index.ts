/**
 * Library module barrel export.
 *
 * @remarks
 * Re-exports all utilities, physics configurations, and schemas
 * from the lib directory for cleaner imports.
 *
 * @example
 * ```tsx
 * import { cn, springs, buttonTransition } from "@/src/lib";
 * ```
 *
 * @public
 */

export * from "./assets";
export * from "./fonts";
export { getStrictContext } from "./get-strict-context";
export * from "./physics";
export * from "./utils";
