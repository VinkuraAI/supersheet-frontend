"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { X, Send, Sparkles } from "lucide-react"

export function AiChatWidget() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Array<{ role: "user" | "ai"; text: string }>>([])
  const inputRef = useRef<HTMLInputElement>(null)

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
        className={`fixed left-1/2  -translate-x-1/2 z-50 w-full max-w-4xl px-4 ${
          isExpanded ? "top-[10vh] h-[70vh] bottom-6" : "bottom-6"
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
                className="flex-1 overflow-y-auto p-6 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                    <div className="text-center space-y-2">
                      <Sparkles className="size-8 mx-auto text-primary/50" />
                      <p>Start a conversation with AI</p>
                      <p className="text-xs">Ask me anything about your service desk...</p>
                    </div>
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
                        className={`max-w-[75%] rounded-2xl px-5 py-3 ${
                          msg.role === "user" 
                            ? "bg-primary text-primary-foreground shadow-lg" 
                            : "bg-muted text-foreground shadow-md"
                        }`}
                      >
                        {msg.text}
                      </div>
                    </motion.div>
                  ))
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
              className={`flex items-center gap-3 ${
                isExpanded ? "px-6 py-5" : "px-6 py-5"
              }`}
            >
              {/* AI Icon */}
              <div className={`flex-shrink-0 transition-colors duration-300 ${
                isExpanded ? "text-primary" : "text-muted-foreground"
              }`}>
                <Sparkles className="size-6" />
              </div>

              {/* Input field - seamlessly blended */}
              <input
                ref={inputRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onFocus={() => setIsExpanded(true)}
                placeholder="Ask AI anything..."
                className="flex-1 bg-transparent border-0 outline-none focus:outline-none text-base placeholder:text-muted-foreground/70 text-foreground"
              />

              {/* Action buttons */}
              <div className="flex items-center gap-2 flex-shrink-0">
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
                        className="size-10 rounded-full hover:bg-muted"
                      >
                        <X className="size-5" />
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button
                  type="submit"
                  size="icon"
                  disabled={!message.trim()}
                  className={`size-10 rounded-full transition-all duration-300 ${
                    message.trim() 
                      ? "bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30" 
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Send className="size-5" />
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
                className="absolute -top-10 left-1/2 -translate-x-1/2 text-sm text-muted-foreground whitespace-nowrap bg-card/80 backdrop-blur-sm px-3 py-1 rounded-full border border-border"
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
