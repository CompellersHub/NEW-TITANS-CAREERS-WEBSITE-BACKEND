import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, X, Minimize2, Maximize2, Mail } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AICourseAdvisor() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hi! I'm your AI career advisor at Titans Careers. I'm here to help you find the perfect course for your career goals. What brings you here today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [showEmailCapture, setShowEmailCapture] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleEmailSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      // Subscribe to newsletter
      await supabase.from("newsletter_subscribers").insert({
        email,
        name: null,
        source: "ai_advisor",
      });

      setEmailCaptured(true);
      setShowEmailCapture(false);
      
      // Track email capture with high score
      await supabase.from("user_behaviors").insert({
        email,
        behavior_type: "ai_advisor_email_captured",
        score_value: 35,
        behavior_data: {
          conversation_length: messages.length,
          captured_via: "ai_advisor",
        },
      });

      await supabase.rpc("update_lead_score", {
        p_email: email,
        p_score_change: 35,
        p_behavior: "ai_advisor_email_captured",
      });

      toast.success("Great! I'll personalize my recommendations for you.");
      
      // Add confirmation message
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Perfect! ✅ I've got your email. I'll make sure to give you the most personalized recommendations. Now, let's continue - what are your main career goals?",
        },
      ]);
    } catch (error) {
      console.error("Email capture error:", error);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("ai-course-advisor", {
        body: {
          messages: [...messages, userMessage],
          email: emailCaptured ? email : undefined,
          captureIntent: false,
        },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      // Check if we should suggest email capture
      if (data.suggestEmailCapture && !emailCaptured && !showEmailCapture) {
        setTimeout(() => {
          setShowEmailCapture(true);
        }, 2000);
      }
    } catch (error) {
      console.error("AI advisor error:", error);
      toast.error("Sorry, I'm having trouble responding. Please try again.");
      
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I apologize, but I'm experiencing technical difficulties. Please try sending your message again, or contact us directly at info@titanscareers.com.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Button
              size="lg"
              onClick={() => setIsOpen(true)}
              className="rounded-full h-16 w-16 shadow-2xl hover:shadow-accent/50 transition-all"
            >
              <Sparkles className="h-6 w-6" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-6 right-6 z-50"
          >
            <Card
              className={`bg-background border-2 border-accent/20 shadow-2xl overflow-hidden transition-all ${
                isMinimized ? "w-80 h-16" : "w-96 h-[600px]"
              }`}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-accent to-accent/80 text-white p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  <div>
                    <h3 className="font-semibold">AI Career Advisor</h3>
                    <p className="text-xs text-white/80">Powered by Titans Careers</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setIsMinimized(!isMinimized)}
                  >
                    {isMinimized ? (
                      <Maximize2 className="h-4 w-4" />
                    ) : (
                      <Minimize2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 text-white hover:bg-white/20"
                    onClick={() => setIsOpen(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[440px]">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user" ? "justify-end" : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                            message.role === "user"
                              ? "bg-accent text-accent-foreground"
                              : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Email Capture Prompt */}
                    {showEmailCapture && !emailCaptured && (
                      <div className="bg-accent/10 border border-accent/30 rounded-lg p-4 space-y-3">
                        <p className="text-sm font-medium flex items-center gap-2">
                          <Mail className="h-4 w-4 text-accent" />
                          Get Personalized Recommendations
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Share your email to receive tailored course guides and resources
                        </p>
                        <div className="flex gap-2">
                          <Input
                            type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="flex-1"
                          />
                          <Button size="sm" onClick={handleEmailSubmit}>
                            Submit
                          </Button>
                        </div>
                        <button
                          onClick={() => setShowEmailCapture(false)}
                          className="text-xs text-muted-foreground hover:text-foreground"
                        >
                          Maybe later
                        </button>
                      </div>
                    )}

                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-muted rounded-2xl px-4 py-3">
                          <div className="flex gap-1">
                            <div className="h-2 w-2 bg-accent rounded-full animate-bounce" />
                            <div className="h-2 w-2 bg-accent rounded-full animate-bounce delay-100" />
                            <div className="h-2 w-2 bg-accent rounded-full animate-bounce delay-200" />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input */}
                  <div className="border-t p-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ask me about courses..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                      />
                      <Button
                        size="icon"
                        onClick={handleSend}
                        disabled={isLoading || !input.trim()}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
