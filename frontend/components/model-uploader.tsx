"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, Loader2, CheckCircle, XCircle, Info } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slider } from "@/components/ui/slider"

type Model = {
  id: string
  name: string
  size: number
  url: string
  type?: string
  description?: string
  createdAt: string
  metrics?: {
    accuracy?: number
    precision?: number
    recall?: number
    f1Score?: number
    rocAuc?: number
  }
}

type ModelUploaderProps = {
  onUploadComplete: (modelId: string) => void
  multipleSelect?: boolean
  onModelSelect?: (modelId: string, selected: boolean) => void
}

export function ModelUploader({ onUploadComplete, multipleSelect = false, onModelSelect }: ModelUploaderProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedModels, setSelectedModels] = useState<Set<string>>(new Set())

  // Additional model metadata
  const [modelType, setModelType] = useState<string>("classification")
  const [description, setDescription] = useState<string>("")
  const [algorithm, setAlgorithm] = useState<string>("other")
  const [features, setFeatures] = useState<string>("")
  const [targetVariable, setTargetVariable] = useState<string>("")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Known metrics (if available)
  const [accuracy, setAccuracy] = useState<number | null>(null)
  const [precision, setPrecision] = useState<number | null>(null)
  const [recall, setRecall] = useState<number | null>(null)
  const [f1Score, setF1Score] = useState<number | null>(null)

  // Load models on component mount
  useEffect(() => {
    fetchModels()

    // Load selected models from localStorage
    const savedModels = localStorage.getItem("selectedModels")
    if (savedModels) {
      try {
        const parsedModels = JSON.parse(savedModels)
        if (Array.isArray(parsedModels)) {
          setSelectedModels(new Set(parsedModels))

          // Notify parent component about pre-selected models
          if (onModelSelect && multipleSelect) {
            parsedModels.forEach((id) => {
              onModelSelect(id, true)
            })
          }
        }
      } catch (e) {
        console.error("Error parsing saved models:", e)
      }
    }
  }, [onModelSelect, multipleSelect])

  // Save selected models to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("selectedModels", JSON.stringify([...selectedModels]))
  }, [selectedModels])

  const fetchModels = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/models")
      const data = await response.json()
      setModels(data.models || [])
    } catch (error) {
      console.error("Error fetching models:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setUploadError(null)
      setUploadSuccess(false)
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setUploadError("Please select a file to upload")
      return
    }

    if (!description) {
      setUploadError("Please provide a description of your model")
      return
    }

    if (!targetVariable) {
      setUploadError("Please specify what your model is predicting (target variable)")
      return
    }

    setUploading(true)
    setUploadError(null)
    setUploadSuccess(false)

    try {
      const formData = new FormData()
      formData.append("model", file)
      formData.append("modelType", modelType)
      formData.append("description", description)
      formData.append("algorithm", algorithm)
      formData.append("features", features)
      formData.append("targetVariable", targetVariable)

      // Add metrics if provided
      if (accuracy !== null) formData.append("accuracy", accuracy.toString())
      if (precision !== null) formData.append("precision", precision.toString())
      if (recall !== null) formData.append("recall", recall.toString())
      if (f1Score !== null) formData.append("f1Score", f1Score.toString())

      const response = await fetch("/api/upload/model", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload model")
      }

      setUploadSuccess(true)
      onUploadComplete(data.modelId)

      // Auto-select the newly uploaded model
      handleModelSelect(data.modelId, true)

      // Refresh the model list
      fetchModels()

      // Reset form
      setFile(null)
      setDescription("")
      setFeatures("")
      setTargetVariable("")
      setAccuracy(null)
      setPrecision(null)
      setRecall(null)
      setF1Score(null)
      setShowAdvanced(false)
    } catch (error) {
      console.error("Error uploading model:", error)
      setUploadError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setUploading(false)
    }
  }

  const handleModelSelect = (modelId: string, checked: boolean) => {
    const newSelectedModels = new Set(selectedModels)

    if (checked) {
      if (!multipleSelect) {
        // If single select mode, clear previous selections
        newSelectedModels.clear()
      }
      newSelectedModels.add(modelId)
    } else {
      newSelectedModels.delete(modelId)
    }

    setSelectedModels(newSelectedModels)

    // Notify parent component
    if (onModelSelect) {
      onModelSelect(modelId, checked)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB"
    else return (bytes / 1048576).toFixed(1) + " MB"
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="model-type">Model Type</Label>
            <Select value={modelType} onValueChange={setModelType}>
              <SelectTrigger id="model-type">
                <SelectValue placeholder="Select model type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="classification">Classification</SelectItem>
                <SelectItem value="regression">Regression</SelectItem>
                <SelectItem value="clustering">Clustering</SelectItem>
                <SelectItem value="nlp">Natural Language Processing</SelectItem>
                <SelectItem value="computer-vision">Computer Vision</SelectItem>
                <SelectItem value="time-series">Time Series</SelectItem>
                <SelectItem value="reinforcement-learning">Reinforcement Learning</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="algorithm">Algorithm</Label>
            <Select value={algorithm} onValueChange={setAlgorithm}>
              <SelectTrigger id="algorithm">
                <SelectValue placeholder="Select algorithm" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="logistic-regression">Logistic Regression</SelectItem>
                <SelectItem value="decision-tree">Decision Tree</SelectItem>
                <SelectItem value="random-forest">Random Forest</SelectItem>
                <SelectItem value="svm">Support Vector Machine</SelectItem>
                <SelectItem value="naive-bayes">Naive Bayes</SelectItem>
                <SelectItem value="knn">K-Nearest Neighbors</SelectItem>
                <SelectItem value="neural-network">Neural Network</SelectItem>
                <SelectItem value="gradient-boosting">Gradient Boosting</SelectItem>
                <SelectItem value="linear-regression">Linear Regression</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="description" className="text-sm font-medium">
                Description <span className="text-red-500">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80 text-xs">
                      Provide a detailed description of your model, including its purpose, how it was trained, and any
                      important characteristics. This helps our AI provide better analysis.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Textarea
              id="description"
              placeholder="Describe your model's purpose, training process, and any important characteristics"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
              required
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="target-variable" className="text-sm font-medium">
                Target Variable <span className="text-red-500">*</span>
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80 text-xs">
                      What is your model predicting? (e.g., "heart disease presence", "customer churn", "house prices")
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="target-variable"
              placeholder="What is your model predicting? (e.g., heart disease, customer churn)"
              value={targetVariable}
              onChange={(e) => setTargetVariable(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="features" className="text-sm font-medium">
                Input Features
              </Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="w-80 text-xs">
                      List the main features/variables your model uses for prediction, separated by commas (e.g., "age,
                      gender, blood pressure, cholesterol")
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Input
              id="features"
              placeholder="List main features used by your model, separated by commas"
              value={features}
              onChange={(e) => setFeatures(e.target.value)}
            />
          </div>

          <Button variant="outline" type="button" onClick={() => setShowAdvanced(!showAdvanced)} className="mt-2">
            {showAdvanced ? "Hide" : "Show"} Advanced Options
          </Button>

          {showAdvanced && (
            <div className="space-y-4 p-4 border border-gray-700 rounded-md bg-gray-800/50">
              <h4 className="text-sm font-medium mb-2">Known Performance Metrics</h4>
              <p className="text-xs text-gray-400 mb-4">
                If you already know your model's performance metrics, provide them below. This will help our AI provide
                more accurate analysis.
              </p>

              <div className="grid gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="accuracy">
                      Accuracy: {accuracy !== null ? accuracy.toFixed(2) : "Not provided"}
                    </Label>
                    {accuracy !== null && (
                      <Button variant="ghost" size="sm" onClick={() => setAccuracy(null)} className="h-6 text-xs">
                        Clear
                      </Button>
                    )}
                  </div>
                  <Slider
                    id="accuracy"
                    min={0}
                    max={1}
                    step={0.01}
                    value={accuracy !== null ? [accuracy] : [0.5]}
                    onValueChange={(value) => setAccuracy(value[0])}
                    disabled={accuracy === null}
                    className={accuracy === null ? "opacity-50" : ""}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setAccuracy(accuracy === null ? 0.5 : null)}
                    className="w-full h-7 text-xs mt-1"
                  >
                    {accuracy === null ? "Set Accuracy" : "Remove Accuracy"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="precision">
                      Precision: {precision !== null ? precision.toFixed(2) : "Not provided"}
                    </Label>
                    {precision !== null && (
                      <Button variant="ghost" size="sm" onClick={() => setPrecision(null)} className="h-6 text-xs">
                        Clear
                      </Button>
                    )}
                  </div>
                  <Slider
                    id="precision"
                    min={0}
                    max={1}
                    step={0.01}
                    value={precision !== null ? [precision] : [0.5]}
                    onValueChange={(value) => setPrecision(value[0])}
                    disabled={precision === null}
                    className={precision === null ? "opacity-50" : ""}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPrecision(precision === null ? 0.5 : null)}
                    className="w-full h-7 text-xs mt-1"
                  >
                    {precision === null ? "Set Precision" : "Remove Precision"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="recall">Recall: {recall !== null ? recall.toFixed(2) : "Not provided"}</Label>
                    {recall !== null && (
                      <Button variant="ghost" size="sm" onClick={() => setRecall(null)} className="h-6 text-xs">
                        Clear
                      </Button>
                    )}
                  </div>
                  <Slider
                    id="recall"
                    min={0}
                    max={1}
                    step={0.01}
                    value={recall !== null ? [recall] : [0.5]}
                    onValueChange={(value) => setRecall(value[0])}
                    disabled={recall === null}
                    className={recall === null ? "opacity-50" : ""}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecall(recall === null ? 0.5 : null)}
                    className="w-full h-7 text-xs mt-1"
                  >
                    {recall === null ? "Set Recall" : "Remove Recall"}
                  </Button>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="f1Score">F1 Score: {f1Score !== null ? f1Score.toFixed(2) : "Not provided"}</Label>
                    {f1Score !== null && (
                      <Button variant="ghost" size="sm" onClick={() => setF1Score(null)} className="h-6 text-xs">
                        Clear
                      </Button>
                    )}
                  </div>
                  <Slider
                    id="f1Score"
                    min={0}
                    max={1}
                    step={0.01}
                    value={f1Score !== null ? [f1Score] : [0.5]}
                    onValueChange={(value) => setF1Score(value[0])}
                    disabled={f1Score === null}
                    className={f1Score === null ? "opacity-50" : ""}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setF1Score(f1Score === null ? 0.5 : null)}
                    className="w-full h-7 text-xs mt-1"
                  >
                    {f1Score === null ? "Set F1 Score" : "Remove F1 Score"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center">
          <input
            type="file"
            id="model-upload"
            className="hidden"
            onChange={handleFileChange}
            accept=".pkl,.h5,.onnx,.pt,.pb,.tflite"
          />
          <label htmlFor="model-upload" className="flex flex-col items-center justify-center cursor-pointer">
            <Upload className="h-10 w-10 text-gray-400 mb-2" />
            <p className="text-sm text-gray-400 mb-1">{file ? file.name : "Click to upload or drag and drop"}</p>
            <p className="text-xs text-gray-500">
              {file ? `${formatFileSize(file.size)}` : "PKL, H5, ONNX, PT, PB, TFLite (max 500MB)"}
            </p>
          </label>
        </div>

        <Button onClick={handleUpload} disabled={!file || uploading} className="w-full">
          {uploading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Uploading...
            </>
          ) : (
            "Upload Model"
          )}
        </Button>

        {uploadError && (
          <div className="flex items-center text-red-500 text-sm">
            <XCircle className="h-4 w-4 mr-1" />
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="flex items-center text-green-500 text-sm">
            <CheckCircle className="h-4 w-4 mr-1" />
            Model uploaded successfully!
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-sm font-medium">Available Models</h3>

        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : models.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No models available</p>
        ) : (
          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
            {models.map((model) => (
              <Card key={model.id} className="bg-gray-800/50 border-gray-700">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      id={`model-${model.id}`}
                      checked={selectedModels.has(model.id)}
                      onCheckedChange={(checked) => {
                        handleModelSelect(model.id, checked === true)
                      }}
                    />
                    <div className="grid gap-0.5 flex-1">
                      <Label htmlFor={`model-${model.id}`} className="cursor-pointer">
                        {model.name}
                      </Label>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400">
                        <span>{formatFileSize(model.size)}</span>
                        {model.type && <span className="bg-gray-700 px-1.5 py-0.5 rounded text-xs">{model.type}</span>}
                        {model.metrics?.accuracy && (
                          <span className="bg-green-900/50 px-1.5 py-0.5 rounded text-xs">
                            Acc: {model.metrics.accuracy.toFixed(2)}
                          </span>
                        )}
                      </div>
                      {model.description && (
                        <p className="text-xs text-gray-400 mt-1 line-clamp-1">{model.description}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
