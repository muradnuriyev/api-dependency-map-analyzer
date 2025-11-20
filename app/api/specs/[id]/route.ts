import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InvalidSpecError } from "@/lib/errors";
import { calculateApiMetrics } from "@/lib/openapi/calculateMetrics";
import { buildDependencyGraph } from "@/lib/openapi/analyzeDependencies";
import { parseOpenApiSpec } from "@/lib/openapi/parseSpec";

interface Params {
  params: { id: string };
}

export async function GET(_request: Request, { params }: Params) {
  try {
    const spec = await prisma.apiSpec.findUnique({ where: { id: params.id } });
    if (!spec) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const model = parseOpenApiSpec(spec.raw);
    const graph = buildDependencyGraph(model);
    const metrics = calculateApiMetrics(model);

    return NextResponse.json({
      id: spec.id,
      name: spec.name,
      createdAt: spec.createdAt,
      model,
      graph,
      metrics,
    });
  } catch (error) {
    if (error instanceof InvalidSpecError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Failed to read spec", error);
    return NextResponse.json({ error: "Failed to read specification." }, { status: 500 });
  }
}
