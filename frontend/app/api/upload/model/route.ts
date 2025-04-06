import { type NextRequest, NextResponse } from "next/server"
import { put } from "@vercel/blob"
import { db } from "@/configs/db"
import { models } from "@/configs/schema"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const file = formData.get("model") as File
    const modelType = (formData.get("modelType") as string) || "unknown"
    const description = (formData.get("description") as string) || ""
    const algorithm = (formData.get("algorithm") as string) || "unknown"
    const features = (formData.get("features") as string) || ""
    const targetVariable = (formData.get("targetVariable") as string) || ""

    const accuracy = formData.get("accuracy") ? Number.parseFloat(formData.get("accuracy") as string) : null
    const precision = formData.get("precision") ? Number.parseFloat(formData.get("precision") as string) : null
    const recall = formData.get("recall") ? Number.parseFloat(formData.get("recall") as string) : null
    const f1Score = formData.get("f1Score") ? Number.parseFloat(formData.get("f1Score") as string) : null

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    if (!description) {
      return NextResponse.json({ error: "Model description is required" }, { status: 400 })
    }

    if (!targetVariable) {
      return NextResponse.json({ error: "Target variable is required" }, { status: 400 })
    }

    const validExtensions = [".pkl", ".h5", ".onnx", ".pt", ".pb", ".tflite"]
    const hasValidExtension = validExtensions.some((ext) => file.name.endsWith(ext))

    if (!hasValidExtension) {
      return NextResponse.json(
        {
          error: `Invalid file type. Supported formats: ${validExtensions.join(", ")}`,
        },
        { status: 400 },
      )
    }

    const blob = await put(file.name, file, {
      access: "public",
    })

    const [model] = await db
      .insert(models)
      .values({
        name: file.name,
        url: blob.url,
        size: file.size,
        contentType: file.type,
        modelType: modelType,
        description: description,
        algorithm: algorithm,
        features: features.split(",").map((f) => f.trim()).join(","),
        targetVariable: targetVariable,
        accuracy,
        precision,
        recall,
        f1Score,
        createdAt: new Date(),
      })
      .returning()

    return NextResponse.json({
      modelId: model.id,
      name: model.name,
      url: model.url,
      size: model.size,
      modelType: model.modelType,
      description: model.description,
      algorithm: model.algorithm,
      features: model.features,
      targetVariable: model.targetVariable,
      accuracy: model.accuracy,
      precision: model.precision,
      recall: model.recall,
      f1Score: model.f1Score,
    })
  } catch (error) {
    console.error("Error uploading model:", error)
    return NextResponse.json(
      {
        error: "Failed to upload model",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
