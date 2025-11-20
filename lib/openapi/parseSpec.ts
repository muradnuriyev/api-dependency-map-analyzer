import { z } from "zod";
import { InvalidSpecError } from "../errors";
import { ensureArray, extractRefName, parseRawToObject, uniqueBy } from "../utils";
import {
  ApiEndpoint,
  ApiSchema,
  ApiSchemaRef,
  ApiSpecDomainModel,
  HttpMethod,
} from "./types";

/**
 * Supported methods we traverse under each path item.
 */
const HTTP_METHODS: HttpMethod[] = [
  "get",
  "post",
  "put",
  "patch",
  "delete",
  "options",
  "head",
];

/**
 * Coarse shape validation to ensure we have paths/components before deeper parsing.
 */
const SpecShape = z.object({
  openapi: z.string().optional(),
  swagger: z.string().optional(),
  info: z
    .object({
      title: z.string().optional(),
      version: z.string().optional(),
    })
    .optional(),
  paths: z.record(z.string(), z.any()),
  components: z
    .object({
      schemas: z.record(z.string(), z.any()).optional(),
    })
    .optional(),
});

/**
 * Parse JSON/YAML into the domain model: endpoints + schemas + metadata.
 * Throws InvalidSpecError if no endpoints are found or structure is invalid.
 */
export function parseOpenApiSpec(raw: string | object): ApiSpecDomainModel {
  const parsed = parseRawToObject(raw);
  const validated = SpecShape.safeParse(parsed);

  if (!validated.success) {
    throw new InvalidSpecError(
      "Specification is not a valid OpenAPI/Swagger structure. Ensure it includes 'paths'.",
    );
  }

  const spec = validated.data;
  const endpoints = extractEndpoints(spec.paths);

  if (endpoints.length === 0) {
    throw new InvalidSpecError("No endpoints found in the specification.");
  }

  const schemas = extractSchemas(spec.components?.schemas ?? {});

  return {
    title: spec.info?.title,
    version: spec.info?.version,
    endpoints,
    schemas,
  };
}

/**
 * Walk all path + method combinations and collect endpoint metadata.
 */
function extractEndpoints(paths: Record<string, unknown>): ApiEndpoint[] {
  const endpoints: ApiEndpoint[] = [];

  for (const [pathKey, pathEntry] of Object.entries(paths)) {
    const pathObject = pathEntry as Record<string, unknown>;

    for (const method of HTTP_METHODS) {
      const operation = pathObject?.[method] as Record<string, unknown> | undefined;
      if (!operation) continue;

      const id = `${method.toUpperCase()} ${pathKey}`;
      const tags = uniqueBy(
        ensureArray(operation.tags as string[] | undefined).filter(Boolean),
        (tag) => tag,
      );

      const requestSchemas = collectSchemaRefsFromContent(operation.requestBody);
      const { responseSchemas, statusCodes } = collectResponseSchemas(operation.responses);

      endpoints.push({
        id,
        method,
        path: pathKey,
        summary: operation.summary as string | undefined,
        description: operation.description as string | undefined,
        tags,
        requestSchemas,
        responseSchemas,
        statusCodes,
      });
    }
  }

  return endpoints;
}

/**
 * Collect schema refs from a requestBody.content or content map.
 */
function collectSchemaRefsFromContent(content: unknown): ApiSchemaRef[] {
  const refs = new Set<string>();

  if (!content || typeof content !== "object") return [];

  // requestBody may have .content; responses already pass in content.
  const contentObj =
    "content" in (content as Record<string, unknown>)
      ? (content as Record<string, unknown>).content
      : content;

  if (!contentObj || typeof contentObj !== "object") return [];

  Object.values(contentObj as Record<string, unknown>).forEach((media) => {
    const schema = (media as Record<string, unknown> | undefined)?.schema;
    walkSchemaForRefs(schema, refs);
  });

  return Array.from(refs).map((name) => ({ name }));
}

/**
 * Collect schema refs from responses and track status codes encountered.
 */
function collectResponseSchemas(
  responses: unknown,
): { responseSchemas: ApiSchemaRef[]; statusCodes: string[] } {
  if (!responses || typeof responses !== "object") {
    return { responseSchemas: [], statusCodes: [] };
  }

  const responseSchemas = new Set<string>();
  const statusCodes: string[] = [];

  for (const [status, response] of Object.entries(responses as Record<string, unknown>)) {
    statusCodes.push(status);
    const content = (response as Record<string, unknown> | undefined)?.content;
    if (content) {
      collectSchemaRefsFromContent(content).forEach((ref) => responseSchemas.add(ref.name));
    }
  }

  return {
    responseSchemas: Array.from(responseSchemas).map((name) => ({ name })),
    statusCodes,
  };
}

/**
 * Recursively traverse a schema node to gather all referenced component names.
 */
function walkSchemaForRefs(schema: unknown, refs: Set<string>): void {
  if (!schema || typeof schema !== "object") return;
  const schemaObj = schema as Record<string, unknown>;

  const refName = extractRefName(schemaObj.$ref as string | undefined);
  if (refName) refs.add(refName);

  for (const key of ["allOf", "oneOf", "anyOf"] as const) {
    const variant = schemaObj[key];
    if (Array.isArray(variant)) {
      variant.forEach((item) => walkSchemaForRefs(item, refs));
    }
  }

  if (schemaObj.items) {
    walkSchemaForRefs(schemaObj.items, refs);
  }

  if (schemaObj.properties && typeof schemaObj.properties === "object") {
    Object.values(schemaObj.properties as Record<string, unknown>).forEach((prop) =>
      walkSchemaForRefs(prop, refs),
    );
  }

  if (
    schemaObj.additionalProperties &&
    typeof schemaObj.additionalProperties === "object" &&
    !Array.isArray(schemaObj.additionalProperties)
  ) {
    walkSchemaForRefs(schemaObj.additionalProperties, refs);
  }
}

/**
 * Convert raw components.schemas entries into ApiSchema items.
 */
function extractSchemas(rawSchemas: Record<string, unknown>): ApiSchema[] {
  return Object.entries(rawSchemas).map<ApiSchema>(([name, schema]) => ({
    name,
    raw: schema,
    complexityScore: estimateSchemaComplexity(schema),
  }));
}

/**
 * Naive complexity heuristic: counts properties, nested arrays, and composition.
 */
function estimateSchemaComplexity(schema: unknown, depth = 1): number {
  if (!schema || typeof schema !== "object") return 1;
  const schemaObj = schema as Record<string, unknown>;

  let score = 1 + depth * 0.5;

  if (schemaObj.properties && typeof schemaObj.properties === "object") {
    const props = Object.values(schemaObj.properties as Record<string, unknown>);
    score += props.length;
    score += props.reduce<number>(
      (sum, prop) => sum + estimateSchemaComplexity(prop, depth + 1),
      0,
    );
  }

  if (schemaObj.items) {
    score += 1 + estimateSchemaComplexity(schemaObj.items, depth + 1);
  }

  for (const key of ["allOf", "oneOf", "anyOf"] as const) {
    const variant = schemaObj[key];
    if (Array.isArray(variant)) {
      score += variant.reduce(
        (sum, item) => sum + estimateSchemaComplexity(item, depth + 1),
        0,
      );
    }
  }

  return Math.round(score);
}
