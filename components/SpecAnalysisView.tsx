"use client";

import { useMemo, useState } from "react";
import AnalysisSummary from "./AnalysisSummary";
import DependencyGraphView from "./DependencyGraph";
import EndpointDetails from "./EndpointDetails";
import EndpointList from "./EndpointList";
import MetricsPanel from "./MetricsPanel";
import { ApiMetrics, ApiSpecDomainModel, DependencyGraph } from "@/lib/openapi/types";

interface SpecAnalysisViewProps {
  model: ApiSpecDomainModel;
  graph: DependencyGraph;
  metrics: ApiMetrics;
}

export default function SpecAnalysisView({ model, graph, metrics }: SpecAnalysisViewProps) {
  const [selectedEndpointId, setSelectedEndpointId] = useState<string | null>(
    model.endpoints[0]?.id ?? null,
  );

  const selectedEndpoint = useMemo(
    () => model.endpoints.find((endpoint) => endpoint.id === selectedEndpointId) ?? null,
    [model.endpoints, selectedEndpointId],
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
      <EndpointList
        endpoints={model.endpoints}
        selectedId={selectedEndpointId}
        onSelect={setSelectedEndpointId}
      />

      <div className="space-y-4">
        <DependencyGraphView
          graph={graph}
          selectedEndpointId={selectedEndpointId}
          onSelectEndpoint={setSelectedEndpointId}
        />

        <div className="grid gap-4 lg:grid-cols-2">
          <EndpointDetails endpoint={selectedEndpoint} schemas={model.schemas} />
          <MetricsPanel metrics={metrics} />
        </div>

        <AnalysisSummary model={model} metrics={metrics} />
      </div>
    </div>
  );
}
