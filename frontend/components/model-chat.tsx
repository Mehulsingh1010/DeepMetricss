"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { MessageSquare, Send, Sparkles, User } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from "react-markdown"

interface ModelChatProps {
  modelIds: string[]
  analysisResults: any | null
}

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ModelChat({ modelIds, analysisResults }: ModelChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi there! I can help you improve your machine learning models. What would you like to know?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    if (modelIds.length === 0) {
      toast({
        title: "No models selected",
        description: "Please select at least one model to discuss",
        variant: "destructive",
      })
      return
    }

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      // Call API to get response from Gemini
      const response = await fetch("/api/chat/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: input,
          modelIds,
          analysisResults,
          history: messages.map((msg) => ({
            role: msg.role,
            content: msg.content,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to get response")
      }

      const data = await response.json()

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.response,
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (modelIds.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-12 w-12 text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-medium text-gray-300 mb-2">No Models Selected</h3>
        <p className="text-gray-500 mb-4">Select models to discuss improvements</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[600px]">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4 pr-2">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`flex ${message.role === "user" ? "flex-row-reverse" : "flex-row"} items-start gap-2 max-w-[80%]`}
            >
              <Avatar className={`h-8 w-8 ${message.role === "user" ? "bg-blue-600" : "bg-purple-600"}`}>
                {message.role === "user" ? (
                  <User className="h-5 w-5 text-white" />
                ) : (
                  <Sparkles className="h-5 w-5 text-white" />
                )}
                <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
              </Avatar>

              <div
                className={`rounded-lg px-4 py-3 ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-800 border border-gray-700 text-gray-200"
                }`}
              >
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div className={`text-xs mt-1 ${message.role === "user" ? "text-blue-200" : "text-gray-400"}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex flex-row items-start gap-2 max-w-[80%]">
              <Avatar className="h-8 w-8 bg-purple-600">
                <Sparkles className="h-5 w-5 text-white" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>

              <div className="rounded-lg px-4 py-3 bg-gray-800 border border-gray-700">
                <div className="flex space-x-2">
                  <div
                    className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "150ms" }}
                  ></div>
                  <div
                    className="h-2 w-2 bg-purple-400 rounded-full animate-bounce"
                    style={{ animationDelay: "300ms" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask about model improvements..."
          className="min-h-[80px] bg-gray-800 border-gray-700 pr-12"
          disabled={loading}
        />
        <Button
          onClick={handleSendMessage}
          disabled={!input.trim() || loading}
          className="absolute right-2 bottom-2 p-2 h-auto bg-purple-600 hover:bg-purple-700 rounded-full"
          aria-label="Send message"
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
    </div>
  )
}

