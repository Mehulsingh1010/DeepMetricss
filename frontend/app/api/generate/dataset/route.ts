import { type NextRequest, NextResponse } from "next/server"
import { db } from "@/configs/db"
import { models, datasets } from "@/configs/schema"
import { eq } from "drizzle-orm"
import { generateDatasetWithGemini } from "@/lib/gemini"
import { put } from "@vercel/blob"

export async function POST(request: NextRequest) {
  try {
    const { modelId, datasetType, datasetSize, description } = await request.json()

    if (!modelId) {
      return NextResponse.json({ error: "Model ID is required" }, { status: 400 })
    }

    if (!description) {
      return NextResponse.json({ error: "Description is required" }, { status: 400 })
    }

    // Fetch model from database
    const model = await db.query.models.findFirst({
      where: eq(models.id, modelId),
    })

    if (!model) {
      return NextResponse.json({ error: "Model not found" }, { status: 404 })
    }

    // Generate dataset with Gemini
    const generatedData = await generateDatasetWithGemini(model, datasetType, datasetSize, description)

    // Convert generated data to CSV
    const csvContent = convertToCSV(generatedData)

    // Create a file from the CSV content
    const file = new File([csvContent], `generated-${datasetType}-${Date.now()}.csv`, { type: "text/csv" })

    // Upload file to Vercel Blob
    const blob = await put(file.name, file, {
      access: "public",
    })

    // Store dataset metadata in database
    const [dataset] = await db
      .insert(datasets)
      .values({
        name: file.name,
        url: blob.url,
        size: file.size,
        contentType: file.type,
        isGenerated: true,
        modelId: model.id,
        createdAt: new Date(),
      })
      .returning()

    return NextResponse.json({
      datasetId: dataset.id,
      name: dataset.name,
      url: dataset.url,
      size: dataset.size,
    })
  } catch (error) {
    console.error("Error generating dataset:", error)
    return NextResponse.json({ error: "Failed to generate dataset" }, { status: 500 })
  }
}

// Helper function to convert JSON data to CSV
function convertToCSV(data: any[]): string {
  if (!data || !data.length) {
    return ""
  }

  const headers = Object.keys(data[0])
  const csvRows = []

  // Add headers
  csvRows.push(headers.join(","))

  // Add rows
  for (const row of data) {
    const values = headers.map((header) => {
      const value = row[header]
      // Handle values with commas or quotes
      if (value === null || value === undefined) {
        return ""
      }
      const escaped = String(value).replace(/"/g, '""')
      return `"${escaped}"`
    })
    csvRows.push(values.join(","))
  }

  return csvRows.join("\n")
}

