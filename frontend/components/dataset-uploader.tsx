"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { FileSpreadsheet, CheckCircle, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DatasetUploaderProps {
  onUploadComplete: (datasetId: string) => void
}

export function DatasetUploader({ onUploadComplete }: DatasetUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const { toast } = useToast()

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check if file is a CSV file
      if (!selectedFile.name.endsWith(".csv")) {
        toast({
          title: "Invalid file type",
          description: "Please upload a .csv file",
          variant: "destructive",
        })
        return
      }

      setFile(selectedFile)
      setUploadStatus("idle")
    }
  }

  const handleUpload = async () => {
    if (!file) return

    setUploading(true)
    setProgress(0)

    // Simulate progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 5
      })
    }, 200)

    try {
      // Create form data
      const formData = new FormData()
      formData.append("dataset", file)

      // Upload to API
      const response = await fetch("/api/upload/dataset", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const data = await response.json()

      // Complete progress
      clearInterval(interval)
      setProgress(100)
      setUploadStatus("success")

      // Notify parent component
      onUploadComplete(data.datasetId)

      toast({
        title: "Upload successful",
        description: "Your dataset has been uploaded and is ready for analysis",
      })
    } catch (error) {
      clearInterval(interval)
      setUploadStatus("error")

      toast({
        title: "Upload failed",
        description: "There was an error uploading your dataset",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:bg-gray-800/30 transition-colors">
        <Input
          type="file"
          onChange={handleFileChange}
          className="hidden"
          id="dataset-upload"
          accept=".csv"
          disabled={uploading}
        />
        <label htmlFor="dataset-upload" className="flex flex-col items-center justify-center cursor-pointer">
          <FileSpreadsheet className="h-10 w-10 text-gray-400 mb-2" />
          <p className="text-gray-300 mb-1">Drag and drop your CSV file here</p>
          <p className="text-gray-500 text-sm">or click to browse</p>
        </label>
      </div>

      {file && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-300 truncate max-w-[200px]">{file.name}</div>
            <div className="text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
          </div>

          {uploading && <Progress value={progress} className="h-2 bg-gray-700" />}

          {uploadStatus === "success" && (
            <div className="flex items-center text-green-500 text-sm">
              <CheckCircle className="h-4 w-4 mr-1" />
              Upload complete
            </div>
          )}

          {uploadStatus === "error" && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              Upload failed
            </div>
          )}

          <Button
            onClick={handleUpload}
            disabled={uploading || uploadStatus === "success"}
            className="w-full bg-blue-600 hover:bg-blue-700"
          >
            {uploading ? "Uploading..." : "Upload Dataset"}
          </Button>
        </div>
      )}
    </div>
  )
}

