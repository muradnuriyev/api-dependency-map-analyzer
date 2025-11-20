/**
 * Canonical HTTP methods supported by OpenAPI operations.
 */
export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";

/**
 * Reference to a schema name (components.schemas key).
 */
export interface ApiSchemaRef {
  name: string;
}

/**
 * Schema metadata held in the domain model.
 */
export interface ApiSchema {
  name: string;
  raw: unknown;
  complexityScore: number;
}

/**
 * Simplified endpoint representation extracted from OpenAPI paths.
 */
export interface ApiEndpoint {
  id: string;
  method: HttpMethod;
  path: string;
  summary?: string;
  description?: string;
  tags: string[];
  requestSchemas: ApiSchemaRef[];
  responseSchemas: ApiSchemaRef[];
  statusCodes: string[];
}

/**
 * Parsed OpenAPI spec mapped into a strongly typed domain structure.
 */
export interface ApiSpecDomainModel {
  title?: string;
  version?: string;
  endpoints: ApiEndpoint[];
  schemas: ApiSchema[];
}

/**
 * Logical dependency between nodes in the graph.
 */
export interface DependencyEdge {
  from: string;
  to: string;
  type: "schema-usage" | "shared-schema" | "tag-group" | "status-code-chain";
}

/**
 * Graph structure used before mapping to ReactFlow nodes/edges.
 */
export interface DependencyGraph {
  nodes: {
    id: string;
    label: string;
    kind: "endpoint" | "schema" | "tag";
  }[];
  edges: {
    id: string;
    source: string;
    target: string;
    kind: DependencyEdge["type"];
  }[];
}

/**
 * Derived metrics to summarize the API surface.
 */
export interface ApiMetrics {
  endpointCount: number;
  schemaCount: number;
  avgSchemasPerEndpoint: number;
  mostUsedSchemas: { schema: string; usageCount: number }[];
  tagDistribution: { tag: string; count: number }[];
}
