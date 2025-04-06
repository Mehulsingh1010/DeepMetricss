"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ModelUploader } from "@/components/model-uploader"
import { DatasetUploader } from "@/components/dataset-uploader"
import { ModelAnalysis } from "@/components/model-analysis"
import { DatasetGenerator } from "@/components/dataset-generator"
import { ModelComparison } from "@/components/model-comparison"
import { ModelChat } from "@/components/model-chat"
import { ReportGenerator } from "@/components/report-generator"
import { Rocket, Stars, BarChart3, MessageSquare, FileText, Upload, Database, Activity, ChevronRight } from "lucide-react"

export default function Dashboard() {
  const [activeModel, setActiveModel] = useState<string | null>(null)
  const [activeDataset, setActiveDataset] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any | null>(null)
  const [selectedModels, setSelectedModels] = useState<string[]>([])

  const handleModelSelect = (modelId: string, selected: boolean) => {
    if (selected) {
      setSelectedModels((prev) => [...prev, modelId])
    } else {
      setSelectedModels((prev) => prev.filter((id) => id !== modelId))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Subtle background gradient with stars */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/stars-bg.svg')] bg-repeat opacity-30"></div>
      </div>

      {/* Refined floating elements */}
      <div className="fixed top-40 right-10 w-64 h-64 rounded-full bg-purple-600/10 blur-3xl"></div>
      <div className="fixed bottom-20 left-10 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl"></div>
      <div className="fixed top-1/3 left-1/4 w-40 h-40 rounded-full bg-pink-600/10 blur-3xl animate-pulse"></div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg">
              <Stars className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-500 to-blue-500">
              ML Model Analyzer Pro
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:block text-xs text-gray-400 bg-gray-800/60 px-3 py-1 rounded-full">
              v2.4.0
            </div>
            <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white transition-all">
              <Rocket className="mr-2 h-4 w-4" />
              Documentation
            </Button>
          </div>
        </header>

        {/* Status bar showing active selections */}
        {(activeModel || activeDataset || selectedModels.length > 0) && (
          <div className="mb-6 p-3 bg-gray-800/40 backdrop-blur-sm rounded-lg border border-gray-700 flex flex-wrap gap-3">
            {activeModel && (
              <div className="text-xs bg-indigo-900/50 border border-indigo-800 rounded-full px-3 py-1 flex items-center">
                <Activity className="h-3 w-3 mr-1" /> Active Model: {activeModel}
              </div>
            )}
            {activeDataset && (
              <div className="text-xs bg-blue-900/50 border border-blue-800 rounded-full px-3 py-1 flex items-center">
                <Database className="h-3 w-3 mr-1" /> Active Dataset: {activeDataset}
              </div>
            )}
            {selectedModels.length > 0 && (
              <div className="text-xs bg-purple-900/50 border border-purple-800 rounded-full px-3 py-1 flex items-center">
                <BarChart3 className="h-3 w-3 mr-1" /> Models Selected: {selectedModels.length}
              </div>
            )}
          </div>
        )}

        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-8 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-xl p-1">
            <TabsTrigger value="upload" className="data-[state=active]:bg-indigo-600/20 data-[state=active]:border-indigo-500 data-[state=active]:text-white">
              <Upload className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Upload</span>
            </TabsTrigger>
            <TabsTrigger value="analyze" className="data-[state=active]:bg-blue-600/20 data-[state=active]:border-blue-500 data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Analyze</span>
            </TabsTrigger>
            <TabsTrigger value="compare" className="data-[state=active]:bg-purple-600/20 data-[state=active]:border-purple-500 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Compare</span>
            </TabsTrigger>
            <TabsTrigger value="chat" className="data-[state=active]:bg-cyan-600/20 data-[state=active]:border-cyan-500 data-[state=active]:text-white">
              <MessageSquare className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">AI Chat</span>
            </TabsTrigger>
            <TabsTrigger value="generate" className="data-[state=active]:bg-green-600/20 data-[state=active]:border-green-500 data-[state=active]:text-white">
              <Database className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Generate</span>
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-amber-600/20 data-[state=active]:border-amber-500 data-[state=active]:text-white">
              <FileText className="h-4 w-4 mr-2" />
              <span className="hidden md:inline">Reports</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-900/80 border border-gray-800 backdrop-blur-md shadow-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-indigo-600/20">
                      <Upload className="h-4 w-4 text-indigo-400" />
                    </div>
                    <CardTitle>Upload Model</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">Upload your PKL or H5 model files for analysis</CardDescription>
                </CardHeader>
                <CardContent>
                  <ModelUploader
                    onUploadComplete={(modelId) => {
                      setActiveModel(modelId)
                      setSelectedModels((prev) => [...prev, modelId])
                    }}
                    multipleSelect={true}
                    onModelSelect={handleModelSelect}
                  />
                </CardContent>
                <CardFooter className="border-t border-gray-800 bg-gray-900/50 text-xs text-gray-500 flex justify-between">
                  <span>Supports: .pkl, .h5, .onnx, .pt formats</span>
                  <span>Max size: 500MB</span>
                </CardFooter>
              </Card>

              <Card className="bg-gray-900/80 border border-gray-800 backdrop-blur-md shadow-lg overflow-hidden">
                <div className="h-1 bg-gradient-to-r from-blue-500 to-cyan-500"></div>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-600/20">
                      <Database className="h-4 w-4 text-blue-400" />
                    </div>
                    <CardTitle>Upload Dataset</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">Upload CSV or JSON datasets to test with your models</CardDescription>
                </CardHeader>
                <CardContent>
                  <DatasetUploader onUploadComplete={(datasetId) => setActiveDataset(datasetId)} />
                </CardContent>
                <CardFooter className="border-t border-gray-800 bg-gray-900/50 text-xs text-gray-500 flex justify-between">
                  <span>Supports: .csv, .json, .parquet formats</span>
                  <span>Max size: 1GB</span>
                </CardFooter>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analyze">
            <Card className="bg-gray-900/80 border border-gray-800 backdrop-blur-md shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-md bg-blue-600/20">
                      <Activity className="h-4 w-4 text-blue-400" />
                    </div>
                    <CardTitle>Model Analysis</CardTitle>
                  </div>
                  <CardDescription className="text-gray-400">Comprehensive insights and performance metrics for your model</CardDescription>
                </div>
                {analysisResults && (
                  <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300">
                    Export
                    <ChevronRight className="ml-1 h-3 w-3" />
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                <ModelAnalysis
                  modelId={activeModel}
                  datasetId={activeDataset}
                  results={analysisResults}
                  onAnalysisComplete={setAnalysisResults}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compare">
            <Card className="bg-gray-900/80 border border-gray-800 backdrop-blur-md shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-purple-500 to-pink-500"></div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-purple-600/20">
                    <BarChart3 className="h-4 w-4 text-purple-400" />
                  </div>
                  <CardTitle>Model Comparison</CardTitle>
                </div>
                <CardDescription className="text-gray-400">Compare multiple models side-by-side to identify the best performer</CardDescription>
              </CardHeader>
              <CardContent>
                <ModelComparison modelIds={selectedModels} datasetId={activeDataset} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="chat">
            <Card className="bg-gray-900/80 border border-gray-800 backdrop-blur-md shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500"></div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-cyan-600/20">
                    <MessageSquare className="h-4 w-4 text-cyan-400" />
                  </div>
                  <CardTitle>AI Assistant</CardTitle>
                </div>
                <CardDescription className="text-gray-400">Chat with our AI about improving your models and interpreting results</CardDescription>
              </CardHeader>
              <CardContent>
                <ModelChat modelIds={selectedModels} analysisResults={analysisResults} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="generate">
            <Card className="bg-gray-900/80 border border-gray-800 backdrop-blur-md shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-green-600/20">
                    <Database className="h-4 w-4 text-green-400" />
                  </div>
                  <CardTitle>Generate Custom Datasets</CardTitle>
                </div>
                <CardDescription className="text-gray-400">Create synthetic and edge-case datasets to thoroughly test your models</CardDescription>
              </CardHeader>
              <CardContent>
                <DatasetGenerator
                  modelId={activeModel}
                  onDatasetGenerated={(datasetId) => setActiveDataset(datasetId)}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card className="bg-gray-900/80 border border-gray-800 backdrop-blur-md shadow-lg overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 to-orange-500"></div>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-amber-600/20">
                    <FileText className="h-4 w-4 text-amber-400" />
                  </div>
                  <CardTitle>Analysis Reports</CardTitle>
                </div>
                <CardDescription className="text-gray-400">Generate comprehensive PDF reports of your analyses and model comparisons</CardDescription>
              </CardHeader>
              <CardContent>
                <ReportGenerator modelIds={selectedModels} analysisResults={analysisResults} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}