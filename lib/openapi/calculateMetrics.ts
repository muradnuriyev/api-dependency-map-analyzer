import { ApiMetrics, ApiSpecDomainModel } from "./types";

export function calculateApiMetrics(model: ApiSpecDomainModel): ApiMetrics {
  const endpointCount = model.endpoints.length;
  const schemaCount = model.schemas.length;

  const schemaUsage = new Map<string, number>();
  const tagDistribution = new Map<string, number>();

  model.endpoints.forEach((endpoint) => {
    const schemaNames = new Set([
      ...endpoint.requestSchemas.map((s) => s.name),
      ...endpoint.responseSchemas.map((s) => s.name),
    ]);

    schemaNames.forEach((name) => {
      schemaUsage.set(name, (schemaUsage.get(name) ?? 0) + 1);
    });

    endpoint.tags.forEach((tag) => {
      tagDistribution.set(tag, (tagDistribution.get(tag) ?? 0) + 1);
    });
  });

  const totalSchemasUsed = model.endpoints.reduce((sum, endpoint) => {
    const uniqueSchemas = new Set([
      ...endpoint.requestSchemas.map((s) => s.name),
      ...endpoint.responseSchemas.map((s) => s.name),
    ]);
    return sum + uniqueSchemas.size;
  }, 0);

  const mostUsedSchemas = Array.from(schemaUsage.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([schema, usageCount]) => ({ schema, usageCount }));

  return {
    endpointCount,
    schemaCount,
    avgSchemasPerEndpoint:
      endpointCount === 0 ? 0 : Number((totalSchemasUsed / endpointCount).toFixed(2)),
    mostUsedSchemas,
    tagDistribution: Array.from(tagDistribution.entries()).map(([tag, count]) => ({
      tag,
      count,
    })),
  };
}
