import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/configs/db"
import { models, datasets, analyses } from "@/configs/schema"
import { eq } from "drizzle-orm"

// Define the ModelWithRelations type
type ModelWithRelations = {
  id: string
  name: string
  url: string
  size: number
  contentType: string
  type?: string
  algorithm?: string
  description?: string
  features?: string[]
  targetVariable?: string
  metrics?: {
    score?: number
    accuracy?: number
    precision?: number
    recall?: number
    f1Score?: number
    efficiency?: string
    rocAuc?: number
  }
  analyses?: any[]
  createdAt: Date
}

import { analyzeModelWithGemini } from "@/lib/gemini"

export const maxDuration = 30 // Set max duration to 30 seconds

export async function POST(request: NextRequest) {
  try {
    const { modelId, datasetId } = await request.json()

    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }

    // Convert string ID to number if needed
    const normalizedModelId = typeof modelId === "string" ? Number.parseInt(modelId, 10) : modelId

    // Fetch model from database with comprehensive data
    const model = (await db.query.models.findFirst({
      where: eq(models.id, normalizedModelId),
      with: {
        analyses: {
          limit: 1,
          orderBy: (analyses, { desc }) => [desc(analyses.createdAt)],
        },
      },
    })) as unknown as ModelWithRelations | null

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Fetch dataset if provided
    let dataset = null
    if (datasetId) {
      const normalizedDatasetId = typeof datasetId === "string" ? Number.parseInt(datasetId, 10) : datasetId

      dataset = await db.query.datasets.findFirst({
        where: eq(datasets.id, normalizedDatasetId),
      })

      if (!dataset) {
        return NextResponse.json({ error: "Dataset not found" }, { status: 404 })
      }
    }

    // Add extra error handling around the Gemini analysis
    let analysisResults
    let analysisError = null

    try {
      // Prepare model data for analysis
      const modelData = {
        id: model.id,
        name: model.name,
        type: model.type || "unknown",
        algorithm: model.algorithm || "unknown",
        description: model.description || "",
        features: model.features || [],
        targetVariable: model.targetVariable || "",
        metrics: model.metrics || {},
        url: model.url,
        size: model.size,
      }

      // Prepare dataset data if available
      const datasetData = dataset
        ? {
            name: dataset.name,
            type: dataset.contentType,
            size: dataset.size,
            description: "description" in dataset ? dataset.description : "Dataset description not available",
            features: "features" in dataset ? dataset.features : [],
          }
        : null

      // Analyze model with Gemini
      analysisResults = await analyzeModelWithGemini(modelData, datasetData)

      // Basic validation of analysis results
      if (!analysisResults || typeof analysisResults !== "object") {
        throw new Error("Invalid analysis results received from Gemini")
      }
    } catch (geminiError) {
      analysisError = geminiError instanceof Error ? geminiError.message : "Unknown error"
      console.error("Gemini analysis failed:", geminiError)

      const modelType = model.type || "Unknown type"
      const modelName = model.name || "Unknown model"

      // Use existing metrics from the model if available
      const existingMetrics = model.metrics || {}

      analysisResults = {
        isEstimate: true,
        modelScore: existingMetrics.score ?? 50,
        accuracy: existingMetrics.accuracy ?? null,
        precision: existingMetrics.precision ?? null,
        recall: existingMetrics.recall ?? null,
        f1Score: existingMetrics.f1Score ?? null,
        rocAuc: existingMetrics.rocAuc ?? null,
        efficiency: existingMetrics.efficiency ?? "Unknown",
        overview: model.description
          ? `Analysis based on provided description of ${modelName} (${modelType}). Gemini AI analysis failed.`
          : `Given the limited information provided, a comprehensive analysis of ${modelName} is not possible. We know it's a ${modelType} model with a size of ${model.size} bytes, but without more details about its purpose, features, and training, we can only provide limited insights.`,
        strengths: model.description ? ["Based on user-provided model description."] : [],
        weaknesses: [
          "Gemini AI analysis failed.",
          "Limited information available about the model.",
          model.description ? "" : "No model description provided.",
        ].filter(Boolean),
        recommendations: [
          "Provide more detailed information about your model.",
          "Include known performance metrics if available.",
          "Upload a test dataset to evaluate the model.",
        ],
        error: analysisError,
      }
    }

    // Fill in missing values with defaults or existing metrics
    if (model.metrics) {
      analysisResults.accuracy = analysisResults.accuracy ?? model.metrics.accuracy ?? null
      analysisResults.precision = analysisResults.precision ?? model.metrics.precision ?? null
      analysisResults.recall = analysisResults.recall ?? model.metrics.recall ?? null
      analysisResults.f1Score = analysisResults.f1Score ?? model.metrics.f1Score ?? null
      analysisResults.rocAuc = analysisResults.rocAuc ?? model.metrics.rocAuc ?? null
      analysisResults.efficiency = analysisResults.efficiency ?? model.metrics.efficiency ?? "Unknown"
      analysisResults.modelScore = analysisResults.modelScore ?? model.metrics.score ?? null
    }

    // Store analysis results in database
    const [analysis] = await db
      .insert(analyses)
      .values({
        modelId: typeof model.id === "string" ? Number.parseInt(model.id, 10) : model.id,
        datasetId: dataset?.id || null,
        results: analysisResults,
        createdAt: new Date(),
      })
      .returning({
        id: analyses.id,
        modelId: analyses.modelId,
        datasetId: analyses.datasetId,
        results: analyses.results,
        createdAt: analyses.createdAt,
      })

    return NextResponse.json({
      analysisId: analysis.id,
      modelId: model.id,
      datasetId: dataset?.id || null,
      isEstimate: !!analysisError,
      ...analysisResults,
    })
  } catch (error) {
    console.error("Error analyzing model:", error)
    return NextResponse.json(
      {
        error: "Failed to analyze model",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}

