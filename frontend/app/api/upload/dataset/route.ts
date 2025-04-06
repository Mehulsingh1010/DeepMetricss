import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { db } from "@/configs/db"
import { datasets } from "@/configs/schema"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("dataset") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Check if file is a CSV file
    if (!file.name.endsWith(".csv")) {
      return NextResponse.json({ error: "Invalid file type. Only .csv files are allowed" }, { status: 400 })
    }

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
    console.error("Error uploading dataset:", error)
    return NextResponse.json({ error: "Failed to upload dataset" }, { status: 500 })
  }
}

