import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/configs/db"
import { models, analyses } from "@/configs/schema"
import { inArray } from "drizzle-orm"
import { chatWithGemini } from "@/lib/gemini"

export async function POST(request: NextRequest) {
  try {
    const { message, modelIds, analysisResults, history } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

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

    // Get existing analyses for these models if not provided
    let analysesData = analysisResults
    if (!analysesData) {
      analysesData = await db.query.analyses.findMany({
        where: inArray(analyses.modelId, modelIds),
      })
    }

    // Chat with Gemini
    const response = await chatWithGemini(message, modelData, analysesData, history)

    return NextResponse.json({
      response,
    })
  } catch (error) {
    console.error("Error chatting with Gemini:", error)
    return NextResponse.json({ error: "Failed to get response from Gemini" }, { status: 500 })
  }
}

