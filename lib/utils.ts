import YAML from "yaml";
import { InvalidSpecError } from "./errors";

export function parseRawToObject(raw: string | object): Record<string, unknown> {
  if (typeof raw === "object" && raw !== null) {
    return raw as Record<string, unknown>;
  }

  if (typeof raw !== "string") {
    throw new InvalidSpecError("Specification payload must be a string or object.");
  }

  const trimmed = raw.trim();
  if (!trimmed) {
    throw new InvalidSpecError("Specification content is empty.");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    /* continue to YAML */
  }

  try {
    return YAML.parse(trimmed) as Record<string, unknown>;
  } catch {
    throw new InvalidSpecError("Failed to parse content as JSON or YAML.");
  }
}

export function extractRefName(ref?: string | null): string | null {
  if (!ref || typeof ref !== "string") return null;
  const match = ref.match(/#\/components\/schemas\/([^\/\s]+)/);
  if (match?.[1]) return match[1];

  const fallback = ref.split("/").pop();
  return fallback ?? null;
}

export function uniqueBy<T>(items: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  const result: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

export function ensureArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) return [];
  return Array.isArray(value) ? value : [value];
}
