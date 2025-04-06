import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, Brain, Database, FileSpreadsheet, Stars } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background stars */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/stars-bg.svg')] bg-repeat opacity-50"></div>
      </div>

      {/* Floating planets */}
      <div className="fixed top-20 right-20 w-32 h-32 rounded-full bg-purple-500/20 blur-xl animate-pulse"></div>
      <div className="fixed bottom-40 left-20 w-48 h-48 rounded-full bg-blue-500/20 blur-xl animate-pulse"></div>

      <div className="relative z-10 container mx-auto px-4 py-16">
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <div className="mb-8">
            <Stars className="h-16 w-16 text-purple-400 mb-4 mx-auto" />
            <h1 className="text-5xl md:text-7xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 via-pink-500 to-blue-500">
              ML Model Analyzer
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
              Upload your models, analyze with Gemini AI, and discover insights from your data
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl mb-12">
            <Card className="bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-400" />
                  Upload Model
                </CardTitle>
                <CardDescription>Upload your PKL model files</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">Support for various ML models in PKL format</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-400" />
                  Upload Dataset
                </CardTitle>
                <CardDescription>Upload your CSV datasets</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">Test your models with custom datasets</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-900/60 border border-gray-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-pink-400" />
                  Generate Data
                </CardTitle>
                <CardDescription>Create edge case datasets</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-400 text-sm">Generate custom datasets with Gemini AI</p>
              </CardContent>
            </Card>
          </div>

          <Link href="/dashboard">
            <Button className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white px-8 py-6 rounded-full text-lg group">
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>
    </main>
  )
}

