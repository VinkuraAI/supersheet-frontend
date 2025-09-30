"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Send } from "lucide-react"

export function AiChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([])
  const modalRef = useRef<HTMLDivElement>(null)

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

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isExpanded && modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setIsExpanded(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isExpanded])

  const handleSend = () => {
    if (!message.trim()) return
    setMessages((prev) => [...prev, { role: "user", text: message }])
    // Simulate AI response
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "ai", text: "I'm here to help! How can I assist you today?" }])
    }, 500)
    setMessage("")
  }

  return (
    <>
      <AnimatePresence>
        {!isExpanded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <div
              onClick={() => setIsExpanded(true)}
              className="bg-primary text-primary-foreground rounded-lg shadow-2xl px-4 py-3 cursor-text hover:shadow-xl hover:scale-105 transition-all border-2 border-primary/20"
            >
              <p className="text-sm font-medium">Ask AI anything...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 z-50 w-full max-w-md bg-card border border-border rounded-xl shadow-2xl"
            style={{ height: "50vh", minHeight: "400px" }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-4 py-3 bg-primary text-primary-foreground rounded-t-xl">
              <h3 className="font-semibold">AI Assistant</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(false)}
                className="size-8 hover:bg-primary-foreground/20 text-primary-foreground"
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Message history */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ height: "calc(100% - 120px)" }}>
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Ask me anything about your service desk...
                </div>
              ) : (
                messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Input area */}
            <div className="border-t p-4">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex gap-2"
              >
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                  autoFocus
                />
                <Button type="submit" size="icon" disabled={!message.trim()}>
                  <Send className="size-4" />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
