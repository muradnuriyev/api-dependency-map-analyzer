import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { InvalidSpecError } from "@/lib/errors";
import { parseOpenApiSpec } from "@/lib/openapi/parseSpec";
import { z } from "zod";

const BodySchema = z.object({
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Specification content is required"),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const body = BodySchema.parse(payload);

    // Validate by parsing before saving to the database.
    parseOpenApiSpec(body.content);

    const spec = await prisma.apiSpec.create({
      data: {
        name: body.name.trim(),
        raw: body.content,
      },
      select: { id: true },
    });

    return NextResponse.json({ id: spec.id });
  } catch (error) {
    if (error instanceof InvalidSpecError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0]?.message }, { status: 400 });
    }

    console.error("Failed to save spec", error);
    return NextResponse.json({ error: "Failed to save specification." }, { status: 500 });
  }
}
