import { ApiSpecDomainModel, DependencyGraph } from "./types";

/**
 * Build a logical dependency graph linking schemas, endpoints, and tags.
 * The result is used to construct ReactFlow nodes/edges later.
 */
export function buildDependencyGraph(model: ApiSpecDomainModel): DependencyGraph {
  const nodes: DependencyGraph["nodes"] = [];
  const edges: DependencyGraph["edges"] = [];
  const edgeKeys = new Set<string>();

  const endpointIds = new Set<string>();
  const schemaUsage = new Map<string, Set<string>>();

  // Add schema nodes up front.
  model.schemas.forEach((schema) => {
    nodes.push({
      id: `schema:${schema.name}`,
      label: schema.name,
      kind: "schema",
    });
  });

  // Add endpoint nodes and connect schema/tag edges.
  model.endpoints.forEach((endpoint) => {
    endpointIds.add(endpoint.id);
    nodes.push({
      id: `endpoint:${endpoint.id}`,
      label: endpoint.id,
      kind: "endpoint",
    });

    const referencedSchemas = [
      ...endpoint.requestSchemas.map((s) => s.name),
      ...endpoint.responseSchemas.map((s) => s.name),
    ];

    referencedSchemas.forEach((schemaName) => {
      if (!schemaUsage.has(schemaName)) {
        schemaUsage.set(schemaName, new Set());
      }
      schemaUsage.get(schemaName)?.add(endpoint.id);
      addEdge(
        edges,
        edgeKeys,
        `schema:${schemaName}`,
        `endpoint:${endpoint.id}`,
        "schema-usage",
      );
    });

    endpoint.tags.forEach((tag) => {
      addEdge(edges, edgeKeys, `tag:${tag}`, `endpoint:${endpoint.id}`, "tag-group");
    });
  });

  // Add tag nodes (deduped later).
  model.endpoints
    .flatMap((endpoint) => endpoint.tags)
    .forEach((tag) => {
      nodes.push({
        id: `tag:${tag}`,
        label: tag,
        kind: "tag",
      });
    });

  // Create shared-schema links between endpoints using the same schema.
  schemaUsage.forEach((endpointSet, schemaName) => {
    if (endpointSet.size < 2) return;
    const endpoints = Array.from(endpointSet);
    for (let i = 0; i < endpoints.length; i++) {
      for (let j = i + 1; j < endpoints.length; j++) {
        addEdge(
          edges,
          edgeKeys,
          `endpoint:${endpoints[i]}`,
          `endpoint:${endpoints[j]}`,
          "shared-schema",
          `shared:${schemaName}:${endpoints[i]}:${endpoints[j]}`,
        );
      }
    }
  });

  // Remove duplicate nodes produced by tag flattening.
  const uniqueNodes = dedupeNodes(nodes);

  return { nodes: uniqueNodes, edges };
}

/**
 * Insert an edge if it hasn't been added yet.
 */
function addEdge(
  edges: DependencyGraph["edges"],
  edgeKeys: Set<string>,
  source: string,
  target: string,
  kind: DependencyGraph["edges"][number]["kind"],
  forcedId?: string,
) {
  const key = forcedId ?? `${source}->${target}:${kind}`;
  if (edgeKeys.has(key)) return;
  edgeKeys.add(key);
  edges.push({
    id: key,
    source,
    target,
    kind,
  });
}

/**
 * Remove duplicate nodes while preserving order.
 */
function dedupeNodes(nodes: DependencyGraph["nodes"]): DependencyGraph["nodes"] {
  const seen = new Set<string>();
  const result: DependencyGraph["nodes"] = [];
  nodes.forEach((node) => {
    if (seen.has(node.id)) return;
    seen.add(node.id);
    result.push(node);
  });
  return result;
}
