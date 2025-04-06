import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/configs/db"
import { models } from "@/configs/schema"
import { eq } from "drizzle-orm"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const modelId = params.id

    const result = await db.query.models.findFirst({
      where: eq(models.id, Number(modelId)),
    })

    if (!result) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    return NextResponse.json({
      model: {
        id: result.id,
        name: result.name,
        url: result.url,
        size: result.size,
        modelType: result.modelType,
        description: result.description,
        algorithm: result.algorithm,
        features: result.features,
        targetVariable: result.targetVariable,
        accuracy: result.accuracy,
        precision: result.precision,
        recall: result.recall,
        f1Score: result.f1Score,
        createdAt: result.createdAt,
      },
    })
  } catch (error) {
    console.error("Error fetching model by ID:", error)
    return NextResponse.json({ error: "Failed to fetch model" }, { status: 500 })
  }
}
