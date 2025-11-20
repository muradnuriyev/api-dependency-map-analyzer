"use client";

import { useMemo } from "react";
import ReactFlow, { Background, Controls, MiniMap, Node } from "reactflow";
import "reactflow/dist/style.css";

import { buildReactFlowGraph } from "@/lib/openapi/buildGraph";
import type { DependencyGraph } from "@/lib/openapi/types";

interface DependencyGraphProps {
  graph: DependencyGraph;
  selectedEndpointId?: string | null;
  onSelectEndpoint?: (id: string) => void;
}

export default function DependencyGraph({
  graph,
  selectedEndpointId,
  onSelectEndpoint,
}: DependencyGraphProps) {
  // Memoize transformation to ReactFlow nodes/edges.
  const { nodes, edges } = useMemo(() => buildReactFlowGraph(graph), [graph]);

  const highlightedNodeId = selectedEndpointId ? `endpoint:${selectedEndpointId}` : undefined;

  // Apply highlight styling to the currently selected endpoint node.
  const decoratedNodes: Node[] = useMemo(
    () =>
      nodes.map((node) => ({
        ...node,
        selected: node.id === highlightedNodeId,
        style: {
          ...(node.style ?? {}),
          borderWidth: node.id === highlightedNodeId ? 3 : 1,
          boxShadow: node.id === highlightedNodeId ? "0 10px 25px -8px rgba(79,70,229,0.25)" : "",
        },
      })),
    [nodes, highlightedNodeId],
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Dependency graph</h3>
          <p className="text-xs text-slate-600">
            Endpoints, schemas, and tags are linked by usage patterns.
          </p>
        </div>
      </div>

      <div className="mt-3 h-[420px] rounded-xl border border-slate-100 bg-slate-50">
        <ReactFlow
          nodes={decoratedNodes}
          edges={edges}
          fitView
          proOptions={{ hideAttribution: true }}
          onNodeClick={(_, node) => {
            if (node.id.startsWith("endpoint:")) {
              onSelectEndpoint?.(node.id.replace("endpoint:", ""));
            }
          }}
        >
          <Background gap={16} color="#e5e7eb" className="stroke-1" />
          <MiniMap />
          <Controls position="bottom-right" />
        </ReactFlow>
      </div>
    </div>
  );
}
