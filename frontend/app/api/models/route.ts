import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/configs/db"

export async function GET(request: NextRequest) {
  try {
    // Fetch all models from database
    const modelData = await db.query.models.findMany({
      orderBy: (models, { desc }) => [desc(models.createdAt)],
    })

    return NextResponse.json({
      models: modelData.map((model) => ({
        id: model.id,
        name: model.name,
        size: model.size,
        createdAt: model.createdAt,
      })),
    })
  } catch (error) {
    console.error("Error fetching models:", error)
    return NextResponse.json({ error: "Failed to fetch models" }, { status: 500 })
  }
}

