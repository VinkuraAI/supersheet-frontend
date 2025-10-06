"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Send, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useWorkspace } from "@/lib/workspace-context"
import apiClient from "@/utils/api.client"

export function AiChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { selectedWorkspace } = useWorkspace()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load messages from sessionStorage on mount
  useEffect(() => {
    const storedMessages = sessionStorage.getItem("aiChatMessages")
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages))
    }
  }, [])

  // Save messages to sessionStorage
  useEffect(() => {
    sessionStorage.setItem("aiChatMessages", JSON.stringify(messages))
  }, [messages])

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isExpanded) {
        setIsExpanded(false)
      }
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [isExpanded])

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isExpanded])

  const handleSend = async () => {
    if (!message.trim() || !selectedWorkspace) return
    const userMessage = { role: "user" as const, text: message }
    setMessages((prev) => [...prev, userMessage])
    setMessage("")
    setIsLoading(true)

    try {
      const response = await apiClient.post(
        `/ai/workspace/${selectedWorkspace._id}/ask`,
        { question: message }
      )
      const aiMessage = { role: "ai" as const, text: response.data.response }
      setMessages((prev) => [...prev, aiMessage])
    } catch (error) {
      const errorMessage = {
        role: "ai" as const,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
      }
      setMessages((prev) => [...prev, errorMessage])
      console.error("Error asking AI:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="h-full">
      {/* Backdrop overlay when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </AnimatePresence>

      {/* Main chat container - expands to full height when active */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ 
          opacity: 1, 
          y: 0,
        }}
        className={`fixed left-1/2  -translate-x-1/2 z-50 w-full max-w-3xl px-3 ${
          isExpanded ? "top-[10vh] h-[70vh] bottom-4" : "bottom-4"
        }`}
      >
        <motion.div
          animate={{
            height: isExpanded ? "100%" : "auto",
            borderRadius: "24px",
            scale: isExpanded ? 1 : 0.98,
          }}
          transition={{ 
            duration: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
            height: { duration: 0.4 },
            borderRadius: { duration: 0.4 },
            scale: { duration: 0.3 }
          }}
          className={`relative flex flex-col ${
            isExpanded 
              ? "bg-card/95 backdrop-blur-xl border-2 border-primary h-[30rem] shadow-2xl shadow-primary/20" 
              : "bg-card/90 backdrop-blur-md border border-border shadow-xl hover:shadow-2xl"
          } transition-colors duration-300 overflow-hidden`}
        >
          {/* Chat messages panel - shows when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { delay: 0.2, duration: 0.3 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-thin scrollbar-thumb-primary scrollbar-track-transparent"
              >
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                    <div className="text-center space-y-1.5">
                      <Sparkles className="size-6 mx-auto text-primary/50" />
                      <p>Start a conversation with AI</p>
                      <p className="text-[0.65rem]">Ask me anything about your service desk...</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-xl px-3 py-2 text-xs ${
                            msg.role === "user"
                              ? "bg-primary text-primary-foreground shadow-lg"
                              : "bg-muted text-foreground shadow-md"
                          }`}
                        >
                          {msg.role === "user" ? (
                            msg.text
                          ) : (
                            <div className="markdown-content">
                              <ReactMarkdown>{msg.text}</ReactMarkdown>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[75%] rounded-xl px-3 py-2 bg-muted text-foreground shadow-md">
                          <div className="flex items-center space-x-1.5">
                            <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse"></span>
                            <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-150"></span>
                            <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse delay-300"></span>
                          </div>
                        </div>
                      </motion.div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Input area - always visible */}
          <div className={`${isExpanded ? "border-t border-border" : ""}`}>
            <form
              onSubmit={(e) => {
                e.preventDefault()
                handleSend()
              }}
              className={`flex items-center gap-2 ${
                isExpanded ? "px-4 py-3" : "px-4 py-3"
              }`}
            >
              {/* AI Icon */}
              <div
                className={`flex-shrink-0 transition-colors duration-300 ${
                  isExpanded ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <Sparkles className="size-5" />
              </div>

              {/* Input field - seamlessly blended */}
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder={selectedWorkspace ? "Ask AI anything..." : "Please select a workspace first"}
                className="flex-1 bg-transparent border-0 outline-none focus:outline-none text-xs placeholder:text-muted-foreground/70 text-foreground"
                disabled={!selectedWorkspace || isLoading}
              />

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setIsExpanded(false)
                          setMessage("")
                        }}
                        className="size-7 rounded-full hover:bg-muted"
                      >
                        <X className="size-4" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim() || isLoading}
                  className={`size-7 rounded-full transition-all duration-300 ${
                    message.trim()
                      ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Send className="size-4" />
                </Button>
              </div>
            </form>
          </div>

          {/* Helper text when not expanded */}
          <AnimatePresence>
            {!isExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute -top-8 left-1/2 -translate-x-1/2 text-xs text-muted-foreground whitespace-nowrap bg-card/80 backdrop-blur-sm px-2 py-0.5 rounded-full border border-border"
              >
                Click to start chatting with AI
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  )
}
