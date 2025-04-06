"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, Download, FileText } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PDFDownloadLink } from "@react-pdf/renderer"
import { AnalysisReport } from "@/components/pdf/analysis-report"

interface ReportGeneratorProps {
  modelIds: string[]
  analysisResults: any | null
}

interface ReportOptions {
  includeMetrics: boolean
  includeCharts: boolean
  includeComparison: boolean
  includePredictions: boolean
  includeRecommendations: boolean
}

export function ReportGenerator({ modelIds, analysisResults }: ReportGeneratorProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<any | null>(null)
  const [options, setOptions] = useState<ReportOptions>({
    includeMetrics: true,
    includeCharts: true,
    includeComparison: modelIds.length > 1,
    includePredictions: true,
    includeRecommendations: true,
  })
  const { toast } = useToast()

  const generateReport = async () => {
    if (modelIds.length === 0) {
      toast({
        title: "No models selected",
        description: "Please select at least one model for the report",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call API to generate report data
      const response = await fetch("/api/generate/report", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelIds,
          options,
        }),
      })

      if (!response.ok) {
        throw new Error("Report generation failed")
      }

      const data = await response.json()
      setReportData(data)

      toast({
        title: "Report generated",
        description: "Your report is ready to download",
      })
    } catch (error) {
      setError("Failed to generate report. Please try again.")

      toast({
        title: "Report generation failed",
        description: "There was an error generating your report",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (modelIds.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Models Selected</h3>
        <p className="text-gray-500 mb-4">Select models to generate a report</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-8 w-24" />
        </div>

        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">Report Generation Error</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={generateReport} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800/60 border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-lg font-medium text-gray-200 mb-4">Report Options</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="metrics"
                  checked={options.includeMetrics}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeMetrics: checked === true }))}
                />
                <Label htmlFor="metrics" className="text-gray-300">
                  Include Performance Metrics
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={options.includeCharts}
                  onCheckedChange={(checked) => setOptions((prev) => ({ ...prev, includeCharts: checked === true }))}
                />
                <Label htmlFor="charts" className="text-gray-300">
                  Include Visualizations
                </Label>
              </div>

              {modelIds.length > 1 && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="comparison"
                    checked={options.includeComparison}
                    onCheckedChange={(checked) =>
                      setOptions((prev) => ({ ...prev, includeComparison: checked === true }))
                    }
                  />
                  <Label htmlFor="comparison" className="text-gray-300">
                    Include Model Comparison
                  </Label>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="predictions"
                  checked={options.includePredictions}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includePredictions: checked === true }))
                  }
                />
                <Label htmlFor="predictions" className="text-gray-300">
                  Include Sample Predictions
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={options.includeRecommendations}
                  onCheckedChange={(checked) =>
                    setOptions((prev) => ({ ...prev, includeRecommendations: checked === true }))
                  }
                />
                <Label htmlFor="recommendations" className="text-gray-300">
                  Include AI Recommendations
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/60 border-gray-700">
          <CardContent className="p-6">
            <h4 className="text-lg font-medium text-gray-200 mb-4">Report Preview</h4>
            <div className="space-y-4">
              <p className="text-gray-400 text-sm">
                Your report will include analysis for {modelIds.length} model{modelIds.length > 1 ? "s" : ""}.
              </p>

              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
                <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
                <div className="h-4 w-5/6 bg-gray-700 rounded"></div>
                <div className="h-4 w-2/3 bg-gray-700 rounded"></div>
              </div>

              {options.includeCharts && (
                <div className="h-20 w-full bg-gray-700 rounded flex items-center justify-center">
                  <FileText className="h-8 w-8 text-gray-500" />
                </div>
              )}

              <div className="space-y-2">
                <div className="h-4 w-4/5 bg-gray-700 rounded"></div>
                <div className="h-4 w-3/5 bg-gray-700 rounded"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        {reportData ? (
          <PDFDownloadLink
            document={<AnalysisReport data={reportData} options={options} />}
            fileName={`model-analysis-report-${new Date().toISOString().split("T")[0]}.pdf`}
            className="inline-block"
          >
            {({ loading, error }) => (
              <Button
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6"
                disabled={loading}
              >
                <Download className="mr-2 h-4 w-4" />
                {loading ? "Preparing PDF..." : "Download PDF Report"}
              </Button>
            )}
          </PDFDownloadLink>
        ) : (
          <Button
            onClick={generateReport}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-6"
          >
            <FileText className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        )}
      </div>
    </div>
  )
}

