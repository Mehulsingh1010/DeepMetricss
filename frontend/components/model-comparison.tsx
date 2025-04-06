"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, BarChart3 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import {
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"

interface ModelComparisonProps {
  modelIds: string[]
  datasetId: string | null
}

interface ModelInfo {
  id: string
  name: string
  metrics: {
    accuracy: number
    precision: number
    recall: number
    f1Score: number
    efficiency: string
  }
}

export function ModelComparison({ modelIds, datasetId }: ModelComparisonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [comparisonData, setComparisonData] = useState<ModelInfo[]>([])
  const { toast } = useToast()

  const runComparison = async () => {
    if (modelIds.length < 2) {
      toast({
        title: "Not enough models",
        description: "Please select at least two models to compare",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setError(null)

    try {
      // Call API to compare models
      const response = await fetch("/api/compare/models", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          modelIds,
          datasetId,
        }),
      })

      if (!response.ok) {
        throw new Error("Comparison failed")
      }

      const data = await response.json()
      setComparisonData(data.models)

      toast({
        title: "Comparison complete",
        description: "Your models have been compared successfully",
      })
    } catch (error) {
      setError("Failed to compare models. Please try again.")

      toast({
        title: "Comparison failed",
        description: "There was an error comparing your models",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Prepare data for charts
  const prepareBarChartData = () => {
    const metrics = ["accuracy", "precision", "recall", "f1Score"]
    return metrics.map((metric) => {
      const data: any = { name: metric.charAt(0).toUpperCase() + metric.slice(1) }
      comparisonData.forEach((model) => {
        data[model.name] = model.metrics[metric as keyof typeof model.metrics]
      })
      return data
    })
  }

  const prepareRadarChartData = () => {
    const metrics = ["accuracy", "precision", "recall", "f1Score"]
    return comparisonData.map((model) => {
      const data: any = { name: model.name }
      metrics.forEach((metric) => {
        data[metric] = model.metrics[metric as keyof typeof model.metrics]
      })
      return data
    })
  }

  // Generate random colors for models
  const getModelColor = (index: number) => {
    const colors = [
      "#8884d8",
      "#82ca9d",
      "#ffc658",
      "#ff8042",
      "#a4de6c",
      "#d0ed57",
      "#83a6ed",
      "#8dd1e1",
      "#a4262c",
      "#ec407a",
    ]
    return colors[index % colors.length]
  }

  if (modelIds.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Models Selected</h3>
        <p className="text-gray-500 mb-4">Select models to compare their performance</p>
      </div>
    )
  }

  if (modelIds.length === 1) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">Need More Models</h3>
        <p className="text-gray-500 mb-4">Select at least two models to compare</p>
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

        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">Comparison Error</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <Button onClick={runComparison} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  if (comparisonData.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <h3 className="text-xl font-medium text-gray-300 mb-2">Ready for Comparison</h3>
          <p className="text-gray-500 mb-4">{modelIds.length} models selected for comparison</p>
        </div>

        <Button
          onClick={runComparison}
          className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-6"
        >
          <BarChart3 className="mr-2 h-4 w-4" />
          Compare Models
        </Button>
      </div>
    )
  }

  // Render comparison results with charts
  const barChartData = prepareBarChartData()
  const radarChartData = prepareRadarChartData()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-medium text-gray-200">Comparison Results</h3>
        <Button onClick={runComparison} variant="outline" size="sm" className="border-gray-700">
          Refresh
        </Button>
      </div>

      {/* Performance Metrics Bar Chart */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-300">Performance Metrics Comparison</h4>
        <div className="h-80 w-full bg-gray-800/60 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsBarChart
              data={barChartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              className="animate-in fade-in duration-1000"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="name" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip contentStyle={{ backgroundColor: "#222", borderColor: "#444" }} labelStyle={{ color: "#fff" }} />
              <Legend />
              {comparisonData.map((model, index) => (
                <Bar
                  key={model.id}
                  dataKey={model.name}
                  fill={getModelColor(index)}
                  animationDuration={1500}
                  animationBegin={index * 300}
                />
              ))}
            </RechartsBarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar Chart for Model Strengths */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-300">Model Strengths Radar</h4>
        <div className="h-80 w-full bg-gray-800/60 rounded-lg p-4">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              cx="50%"
              cy="50%"
              outerRadius="80%"
              data={comparisonData}
              className="animate-in fade-in duration-1000"
            >
              <PolarGrid stroke="#444" />
              <PolarAngleAxis dataKey="name" stroke="#888" />
              <PolarRadiusAxis stroke="#888" />
              {["accuracy", "precision", "recall", "f1Score"].map((metric, index) => (
                <Radar
                  key={metric}
                  name={metric.charAt(0).toUpperCase() + metric.slice(1)}
                  dataKey={`metrics.${metric}`}
                  stroke={getModelColor(index)}
                  fill={getModelColor(index)}
                  fillOpacity={0.3}
                  animationDuration={1500}
                  animationBegin={index * 300}
                />
              ))}
              <Tooltip contentStyle={{ backgroundColor: "#222", borderColor: "#444" }} labelStyle={{ color: "#fff" }} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Model Comparison Table */}
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-gray-300">Detailed Comparison</h4>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-400">Model</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-400">Accuracy</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-400">Precision</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-400">Recall</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-400">F1 Score</th>
                <th className="py-2 px-4 text-left text-sm font-medium text-gray-400">Efficiency</th>
              </tr>
            </thead>
            <tbody>
              {comparisonData.map((model) => (
                <tr key={model.id} className="border-b border-gray-700">
                  <td className="py-2 px-4 text-sm text-gray-300 font-medium">{model.name}</td>
                  <td className="py-2 px-4 text-sm text-gray-300">{model.metrics.accuracy}</td>
                  <td className="py-2 px-4 text-sm text-gray-300">{model.metrics.precision}</td>
                  <td className="py-2 px-4 text-sm text-gray-300">{model.metrics.recall}</td>
                  <td className="py-2 px-4 text-sm text-gray-300">{model.metrics.f1Score}</td>
                  <td className="py-2 px-4 text-sm text-gray-300">{model.metrics.efficiency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

