"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertTriangle, BarChart3, ArrowRight } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

type ModelAnalysisProps = {
  modelId: string | null
  datasetId: string | null
  results: any | null
  onAnalysisComplete: (results: any) => void
}

export function ModelAnalysis({ modelId, datasetId, results, onAnalysisComplete }: ModelAnalysisProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any | null>(results)
  const [modelDetails, setModelDetails] = useState<any | null>(null)
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [analysisStatus, setAnalysisStatus] = useState("")
  const { toast } = useToast()

  // Use a ref to track if the component is mounted
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  useEffect(() => {
    // Update local state when props change
    if (isMounted) {
      setAnalysisResults(results)
    }
  }, [results, isMounted])

  useEffect(() => {
    // Fetch model details if modelId is available
    if (modelId && isMounted) {
      fetchModelDetails(modelId)
    }
  }, [modelId, isMounted])

  const fetchModelDetails = async (id: string) => {
    try {
      const response = await fetch(`/api/models/${id}`)
      if (!response.ok) throw new Error("Failed to fetch model details")
      const data = await response.json()
      if (isMounted) {
        setModelDetails(data.model)
      }
    } catch (error) {
      console.error("Error fetching model details:", error)
      if (isMounted) {
        toast({
          title: "Error",
          description: "Failed to fetch model details",
          variant: "destructive",
        })
      }
    }
  }

  // Simulate progress updates during analysis
  useEffect(() => {
    if (!loading) {
      setAnalysisProgress(0)
      setAnalysisStatus("")
      return
    }

    const statusMessages = [
      "Initializing analysis...",
      "Loading model metadata...",
      "Analyzing model structure...",
      "Evaluating performance metrics...",
      "Generating insights...",
      "Finalizing analysis...",
    ]

    let progress = 0
    let statusIndex = 0

    const interval = setInterval(() => {
      if (!isMounted) {
        clearInterval(interval)
        return
      }

      // Update progress
      progress += Math.random() * 15
      if (progress > 95) progress = 95 // Cap at 95% until complete

      // Update status message periodically
      if (progress > statusIndex * 20) {
        statusIndex = Math.min(statusIndex + 1, statusMessages.length - 1)
      }

      setAnalysisProgress(progress)
      setAnalysisStatus(statusMessages[statusIndex])
    }, 800)

    return () => clearInterval(interval)
  }, [loading, isMounted])

  const handleAnalyze = useCallback(async () => {
    if (!modelId) {
      setError("Please select a model to analyze")
      return
    }

    setLoading(true)
    setError(null)
    setAnalysisProgress(0)
    setAnalysisStatus("Initializing analysis...")

    try {
      // Use AbortController to handle timeouts and cancellations
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

      const response = await fetch("/api/analyze/model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelId,
          datasetId,
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze model")
      }

      // Set progress to 100% when complete
      setAnalysisProgress(100)
      setAnalysisStatus("Analysis complete!")

      // Small delay to show the 100% progress
      setTimeout(() => {
        if (isMounted) {
          setAnalysisResults(data)
          onAnalysisComplete(data)

          toast({
            title: "Analysis Complete",
            description: "Model analysis has been successfully completed.",
          })
        }
      }, 500)
    } catch (error) {
      console.error("Error analyzing model:", error)

      if (error instanceof DOMException && error.name === "AbortError") {
        setError("Analysis timed out. The operation took too long to complete.")
        toast({
          title: "Analysis Timeout",
          description: "The analysis took too long to complete. Try again or use a smaller model.",
          variant: "destructive",
        })
      } else {
        setError(error instanceof Error ? error.message : "Unknown error occurred")
        toast({
          title: "Analysis Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive",
        })
      }
    } finally {
      if (isMounted) {
        setLoading(false)
      }
    }
  }, [modelId, datasetId, onAnalysisComplete, isMounted, toast])

  // Helper function to render metric with fallback
  const renderMetric = (value: any, label: string, fallback = "N/A") => {
    return (
      <div className="text-center">
        <div className="text-2xl font-bold">
          {value !== null && value !== undefined ? (typeof value === "number" ? value.toFixed(2) : value) : fallback}
        </div>
        <div className="text-xs text-gray-400">{label}</div>
      </div>
    )
  }

  // Helper function to determine if we have enough data for analysis
  const hasEnoughData = () => {
    if (!modelId) return false
    if (modelDetails?.description && modelDetails?.targetVariable) return true
    return false
  }

  // Memoize the analysis results display to prevent unnecessary re-renders
  const renderAnalysisResults = useCallback(() => {
    if (!analysisResults) return null

    return (
      <div className="space-y-6">
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="metrics">Metrics</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h3 className="text-sm font-medium mb-2">Model Overview</h3>
              <p className="text-sm text-gray-300">
                {analysisResults.overview ||
                  "No overview available. This could be due to limited information about the model."}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="text-sm font-medium mb-2">Strengths</h3>
                {analysisResults.strengths && analysisResults.strengths.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {analysisResults.strengths.map((strength: string, index: number) => (
                      <li key={index}>{strength}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No strengths identified</p>
                )}
              </div>

              <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <h3 className="text-sm font-medium mb-2">Weaknesses</h3>
                {analysisResults.weaknesses && analysisResults.weaknesses.length > 0 ? (
                  <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                    {analysisResults.weaknesses.map((weakness: string, index: number) => (
                      <li key={index}>{weakness}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-gray-400">No weaknesses identified</p>
                )}
              </div>
            </div>

            {analysisResults.isEstimate && (
              <Alert className="bg-amber-900/20 border-amber-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Estimated Analysis</AlertTitle>
                <AlertDescription>
                  This analysis is based on limited information. For more accurate results, please provide more details
                  about your model.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="metrics" className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {renderMetric(
                analysisResults.modelScore,
                "Overall Score",
                modelDetails?.metrics?.score ? modelDetails.metrics.score.toFixed(2) : "N/A",
              )}
              {renderMetric(
                analysisResults.accuracy,
                "Accuracy",
                modelDetails?.metrics?.accuracy ? modelDetails.metrics.accuracy.toFixed(2) : "N/A",
              )}
              {renderMetric(
                analysisResults.precision,
                "Precision",
                modelDetails?.metrics?.precision ? modelDetails.metrics.precision.toFixed(2) : "N/A",
              )}
              {renderMetric(
                analysisResults.recall,
                "Recall",
                modelDetails?.metrics?.recall ? modelDetails.metrics.recall.toFixed(2) : "N/A",
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {renderMetric(
                analysisResults.f1Score,
                "F1 Score",
                modelDetails?.metrics?.f1Score ? modelDetails.metrics.f1Score.toFixed(2) : "N/A",
              )}
              {renderMetric(
                analysisResults.rocAuc,
                "ROC AUC",
                modelDetails?.metrics?.rocAuc ? modelDetails.metrics.rocAuc.toFixed(2) : "N/A",
              )}
              {renderMetric(analysisResults.efficiency || modelDetails?.metrics?.efficiency, "Efficiency")}
            </div>

            {!analysisResults.accuracy && !analysisResults.precision && !analysisResults.recall && (
              <Alert className="bg-blue-900/20 border-blue-800">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Limited Metrics Available</AlertTitle>
                <AlertDescription>
                  We couldn't calculate detailed metrics for this model. This could be due to:
                  <ul className="list-disc list-inside mt-2 text-sm">
                    <li>No dataset provided for evaluation</li>
                    <li>Insufficient model metadata</li>
                    <li>Unsupported model type</li>
                  </ul>
                  Try uploading a dataset or providing known metrics in the model upload form.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            {analysisResults.recommendations && analysisResults.recommendations.length > 0 ? (
              <div className="space-y-3">
                {analysisResults.recommendations.map((rec: string, index: number) => (
                  <div
                    key={index}
                    className="p-3 bg-gray-800/50 rounded-lg border border-gray-700 flex items-start gap-3"
                  >
                    <div className="bg-blue-900/30 p-1.5 rounded-full mt-0.5">
                      <ArrowRight className="h-4 w-4 text-blue-400" />
                    </div>
                    <p className="text-sm text-gray-300">{rec}</p>
                  </div>
                ))}
              </div>
            ) : (
              <Alert className="bg-gray-800/50 border-gray-700">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>No Recommendations Available</AlertTitle>
                <AlertDescription>
                  We couldn't generate specific recommendations for this model. Try providing more information about
                  your model or uploading a dataset for evaluation.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        </Tabs>
      </div>
    )
  }, [analysisResults, modelDetails])

  return (
    <div className="space-y-6">
      {!modelId ? (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>No model selected</AlertTitle>
          <AlertDescription>Please select a model from the Upload tab to analyze.</AlertDescription>
        </Alert>
      ) : !hasEnoughData() ? (
        <Alert className="bg-amber-900/20 border-amber-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Missing model information</AlertTitle>
          <AlertDescription>
            Your model is missing important information needed for accurate analysis. Please update your model with a
            description and target variable.
          </AlertDescription>
        </Alert>
      ) : null}

      {modelId && modelDetails && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Selected Model</h3>
              <div className="text-xs text-gray-400">
                <div>
                  <span className="font-medium">Name:</span> {modelDetails.name}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {modelDetails.type || "Unknown"}
                </div>
                {modelDetails.algorithm && (
                  <div>
                    <span className="font-medium">Algorithm:</span> {modelDetails.algorithm}
                  </div>
                )}
                {modelDetails.targetVariable && (
                  <div>
                    <span className="font-medium">Target:</span> {modelDetails.targetVariable}
                  </div>
                )}
                {modelDetails.description && (
                  <div className="mt-2">
                    <span className="font-medium">Description:</span> {modelDetails.description}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {datasetId && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Selected Dataset</h3>
              <div className="text-xs text-gray-400">
                <div>Dataset ID: {datasetId}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Button onClick={handleAnalyze} disabled={loading || !modelId || !hasEnoughData()} className="w-full">
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <BarChart3 className="mr-2 h-4 w-4" />
            {analysisResults ? "Re-analyze Model" : "Analyze Model"}
          </>
        )}
      </Button>

      {loading && (
        <div className="space-y-2">
          <Progress value={analysisProgress} className="h-2 w-full" />
          <p className="text-xs text-center text-gray-400">{analysisStatus}</p>
        </div>
      )}

      {error && (
        <Alert variant="destructive" className="bg-red-900/20 border-red-800">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {analysisResults && renderAnalysisResults()}
    </div>
  )
}

