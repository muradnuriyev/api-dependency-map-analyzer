export type HttpMethod =
  | "get"
  | "post"
  | "put"
  | "patch"
  | "delete"
  | "options"
  | "head";

export interface ApiSchemaRef {
  name: string;
}

export interface ApiSchema {
  name: string;
  raw: unknown;
  complexityScore: number;
}

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

export interface ApiSpecDomainModel {
  title?: string;
  version?: string;
  endpoints: ApiEndpoint[];
  schemas: ApiSchema[];
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: "schema-usage" | "shared-schema" | "tag-group" | "status-code-chain";
}

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

export interface ApiMetrics {
  endpointCount: number;
  schemaCount: number;
  avgSchemasPerEndpoint: number;
  mostUsedSchemas: { schema: string; usageCount: number }[];
  tagDistribution: { tag: string; count: number }[];
}
