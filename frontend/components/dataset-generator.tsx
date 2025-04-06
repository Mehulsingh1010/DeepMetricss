"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sparkles, FileSpreadsheet, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface DatasetGeneratorProps {
  modelId: string | null
  onDatasetGenerated: (datasetId: string) => void
}

export function DatasetGenerator({ modelId, onDatasetGenerated }: DatasetGeneratorProps) {
  const [datasetType, setDatasetType] = useState<string>("edge-case")
  const [datasetSize, setDatasetSize] = useState<string>("100")
  const [description, setDescription] = useState<string>("")
  const [generating, setGenerating] = useState<boolean>(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!modelId) {
      toast({
        title: "No model selected",
        description: "Please upload a model first",
        variant: "destructive",
      })
      return
    }

    if (!description) {
      toast({
        title: "Description required",
        description: "Please provide a description for the dataset",
        variant: "destructive",
      })
      return
    }

    setGenerating(true)

    try {
      // Call API to generate dataset
      const response = await fetch("/api/generate/dataset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId,
          datasetType,
          datasetSize: Number.parseInt(datasetSize),
          description,
        }),
      })

      if (!response.ok) {
        throw new Error("Dataset generation failed")
      }

      const data = await response.json()

      // Notify parent component
      onDatasetGenerated(data.datasetId)

      toast({
        title: "Dataset generated",
        description: "Your custom dataset has been created successfully",
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating your dataset",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  if (!modelId) {
    return (
      <div className="text-center py-12">
        <FileSpreadsheet className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Model Selected</h3>
        <p className="text-gray-500 mb-4">Upload a model to generate custom datasets</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataset-type">Dataset Type</Label>
            <Select value={datasetType} onValueChange={setDatasetType}>
              <SelectTrigger id="dataset-type" className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select dataset type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="edge-case">Edge Cases</SelectItem>
                <SelectItem value="adversarial">Adversarial Examples</SelectItem>
                <SelectItem value="diverse">Diverse Distribution</SelectItem>
                <SelectItem value="similar">Similar to Training Data</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataset-size">Dataset Size</Label>
            <Select value={datasetSize} onValueChange={setDatasetSize}>
              <SelectTrigger id="dataset-size" className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="Select dataset size" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="10">10 samples</SelectItem>
                <SelectItem value="50">50 samples</SelectItem>
                <SelectItem value="100">100 samples</SelectItem>
                <SelectItem value="500">500 samples</SelectItem>
                <SelectItem value="1000">1000 samples</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (for Gemini)</Label>
            <Textarea
              id="description"
              placeholder="Describe the dataset you want to generate..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px] bg-gray-800 border-gray-700"
            />
          </div>

          <Button
            onClick={handleGenerate}
            disabled={generating || !description}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            {generating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Generate Dataset
              </>
            )}
          </Button>
        </div>

        <Card className="bg-gray-800/60 border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-lg font-medium text-gray-200 mb-4">Dataset Types</h4>
            <div className="space-y-4 text-sm">
              <div>
                <h5 className="font-medium text-gray-300 mb-1">Edge Cases</h5>
                <p className="text-gray-400">
                  Generate data that tests the boundaries of your model's capabilities, focusing on rare or extreme
                  scenarios.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-300 mb-1">Adversarial Examples</h5>
                <p className="text-gray-400">
                  Create examples specifically designed to challenge your model and potentially cause
                  misclassifications.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-300 mb-1">Diverse Distribution</h5>
                <p className="text-gray-400">
                  Generate a dataset with wide coverage across different possible inputs to test generalization.
                </p>
              </div>

              <div>
                <h5 className="font-medium text-gray-300 mb-1">Similar to Training</h5>
                <p className="text-gray-400">
                  Create data similar to what your model was likely trained on to validate performance on expected
                  inputs.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

