import { Edge, Node } from "reactflow";
import { DependencyGraph } from "./types";

export interface ReactFlowGraphData {
  nodes: Node[];
  edges: Edge[];
}

/**
  * Palette for edge styles based on relationship kind.
  */
const edgeColor: Record<DependencyGraph["edges"][number]["kind"], string> = {
  "schema-usage": "#2563eb",
  "shared-schema": "#0ea5e9",
  "tag-group": "#8b5cf6",
  "status-code-chain": "#f97316",
};

/**
 * Transform our domain graph into ReactFlow nodes/edges, including a simple
 * grid-ish layout and per-kind styling.
 */
export function buildReactFlowGraph(graph: DependencyGraph): ReactFlowGraphData {
  const positions = layoutGraph(graph);

  const nodes: Node[] = graph.nodes.map((node) => ({
    id: node.id,
    position: positions.get(node.id) ?? { x: 0, y: 0 },
    data: { label: node.label, kind: node.kind },
    style: nodeStyle(node.kind),
  }));

  const edges: Edge[] = graph.edges.map((edge) => ({
    id: edge.id,
    source: edge.source,
    target: edge.target,
    label: labelForEdge(edge.kind),
    animated: edge.kind === "shared-schema",
    style: { stroke: edgeColor[edge.kind], strokeWidth: 2 },
    type: "smoothstep",
  }));

  return { nodes, edges };
}

/**
 * Very light-weight layout: place schemas, endpoints, tags in rows.
 */
function layoutGraph(graph: DependencyGraph): Map<string, { x: number; y: number }> {
  const order: Array<DependencyGraph["nodes"][number]["kind"]> = [
    "schema",
    "endpoint",
    "tag",
  ];

  const map = new Map<string, { x: number; y: number }>();
  const spacingX = 240;
  const spacingY = 160;

  order.forEach((kind, rowIndex) => {
    const group = graph.nodes.filter((n) => n.kind === kind);
    group.forEach((node, idx) => {
      map.set(node.id, {
        x: idx * spacingX,
        y: rowIndex * spacingY,
      });
    });
  });

  return map;
}

/**
 * Base style per node kind.
 */
function nodeStyle(kind: DependencyGraph["nodes"][number]["kind"]) {
  const palette: Record<typeof kind, { bg: string; color: string; border: string }> = {
    endpoint: { bg: "#eef2ff", color: "#1f2937", border: "#4f46e5" },
    schema: { bg: "#ecfeff", color: "#0f172a", border: "#06b6d4" },
    tag: { bg: "#f5f3ff", color: "#111827", border: "#a855f7" },
  };

  const colors = palette[kind];
  return {
    backgroundColor: colors.bg,
    color: colors.color,
    border: `1px solid ${colors.border}`,
    borderRadius: 8,
    padding: 8,
    fontSize: 12,
    width: 200,
  };
}

/**
 * Human-friendly edge labels for the graph legend.
 */
function labelForEdge(kind: DependencyGraph["edges"][number]["kind"]): string {
  switch (kind) {
    case "schema-usage":
      return "uses schema";
    case "shared-schema":
      return "shares schema";
    case "tag-group":
      return "tagged";
    case "status-code-chain":
      return "status link";
    default:
      return kind;
  }
}
