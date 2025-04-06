import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/configs/db"
import { models, analyses } from "@/configs/schema"
import { inArray } from "drizzle-orm"
import { compareModelsWithGemini } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const { modelIds, datasetId } = await request.json()

    if (!modelIds || !Array.isArray(modelIds) || modelIds.length < 2) {
      return NextResponse.json({ error: "At least two model IDs are required" }, { status: 400 })
    }

    // Fetch models from database
    const modelData = await db.query.models.findMany({
      where: inArray(models.id, modelIds),
    })

    if (modelData.length !== modelIds.length) {
      return NextResponse.json({ error: "One or more models not found" }, { status: 404 })
    }

    // Get existing analyses for these models
    const analysesData = await db.query.analyses.findMany({
      where: inArray(analyses.modelId, modelIds),
    })

    // Compare models with Gemini
    const comparisonResults = await compareModelsWithGemini(modelData, datasetId, analysesData)

    return NextResponse.json({
      models: comparisonResults,
    })
  } catch (error) {
    console.error("Error comparing models:", error)
    return NextResponse.json({ error: "Failed to compare models" }, { status: 500 })
  }
}

