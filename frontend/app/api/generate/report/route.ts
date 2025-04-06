import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/configs/db"
import { models, analyses } from "@/configs/schema"
import { inArray } from "drizzle-orm"
import { generateReportWithGemini } from "@/lib/gemini"
import { generateChartImages } from "@/lib/charts"

export async function POST(request: NextRequest) {
  try {
    const { modelIds, options } = await request.json()

    if (!modelIds || !Array.isArray(modelIds) || modelIds.length === 0) {
      return NextResponse.json({ error: "At least one model ID is required" }, { status: 400 })
    }

    // Fetch models from database
    const modelData = await db.query.models.findMany({
      where: inArray(models.id, modelIds),
    })

    if (modelData.length === 0) {
      return NextResponse.json({ error: "No models found" }, { status: 404 })
    }

    // Get existing analyses for these models
    const analysesData = await db.query.analyses.findMany({
      where: inArray(analyses.modelId, modelIds),
    })

    // Generate report data with Gemini
    const reportData = await generateReportWithGemini(modelData, analysesData, options)

    // Generate chart images if needed
    let chartImages: { title: string; imageUrl: string }[] = []
    if (options.includeCharts) {
      chartImages = await generateChartImages(reportData.models)
    }

    // Combine all data for the report
    const fullReportData = {
      ...reportData,
      charts: chartImages,
    }

    return NextResponse.json(fullReportData)
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

