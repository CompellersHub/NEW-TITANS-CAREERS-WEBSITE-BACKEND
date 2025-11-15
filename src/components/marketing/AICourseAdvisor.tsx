import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Sparkles, Send, X, Minimize2, Maximize2, Mail, History, Plus, Clock, Search, Filter, Download, FileText } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const sb: any = supabase;
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { jsPDF } from "jspdf";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface Conversation {
  id: string;
  title: string | null;
  last_message_at: string;
  message_count: number;
  lead_captured: boolean;
}

interface ConversationWithMessages extends Conversation {
  messages?: { content: string }[];
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
  const [sessionId, setSessionId] = useState<string>("");
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<ConversationWithMessages[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFilter, setDateFilter] = useState<{ from?: Date; to?: Date }>({});
  const [courseFilter, setCourseFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isSendingSummary, setIsSendingSummary] = useState(false);
  const [milestoneSummarySent, setMilestoneSummarySent] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const courseOptions = [
    "Power BI", "SQL", "Python", "Tableau", "Excel", 
    "Azure", "AWS", "Data Science"
  ];

  // Initialize or load session
  useEffect(() => {
    // Get or create session ID
    let storedSessionId = localStorage.getItem("ai_advisor_session_id");
    if (!storedSessionId) {
      storedSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("ai_advisor_session_id", storedSessionId);
    }
    setSessionId(storedSessionId);

    // Load stored email if exists
    const storedEmail = localStorage.getItem("ai_advisor_email");
    if (storedEmail) {
      setEmail(storedEmail);
      setEmailCaptured(true);
      loadConversationHistory(storedEmail);
    }
  }, []);

  // Create or load conversation when session is ready
  useEffect(() => {
    if (sessionId && !conversationId) {
      loadOrCreateConversation();
    }
  }, [sessionId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadOrCreateConversation = async () => {
    try {
      // Check if conversation exists for this session
      const { data: existing } = await sb
        .from("ai_advisor_conversations")
        .select("id")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (existing) {
        setConversationId(existing.id);
        await loadMessages(existing.id);
      } else {
        // Create new conversation
        const { data: newConv, error } = await sb
          .from("ai_advisor_conversations")
          .insert({
            session_id: sessionId,
            email: emailCaptured ? email : null,
          })
          .select()
          .single();

        if (error) {
          console.error("Error creating conversation:", error);
          return;
        }
        setConversationId(newConv.id);
      }
    } catch (error) {
      console.error("Error loading conversation:", error);
      // Don't throw - allow component to render without breaking the page
    }
  };

  const loadMessages = async (convId: string) => {
    try {
      const { data, error } = await sb
        .from("ai_advisor_messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        return;
      }

      if (data && data.length > 0) {
        setMessages(data as Message[]);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
    }
  };

  const loadConversationHistory = async (userEmail: string) => {
    setIsLoadingHistory(true);
    try {

      const { data, error } = await sb
        .from("ai_advisor_conversations")
        .select(`
          id,
          title,
          last_message_at,
          message_count,
          lead_captured,
          ai_advisor_messages(content)
        `)
        .eq("email", userEmail)
        .order("last_message_at", { ascending: false });

      if (error) throw error;
      
      const conversationsWithMessages = (data || []).map((conv: any) => ({
        ...conv,
        messages: conv.ai_advisor_messages || []
      }));
      
      setConversations(conversationsWithMessages as any);
    } catch (error) {
      console.error("Error loading history:", error);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const switchConversation = async (convId: string) => {
    setIsLoadingHistory(true);
    try {
      setConversationId(convId);
      await loadMessages(convId);
      setShowHistory(false);
      setMilestoneSummarySent(false);
    } catch (error) {
      console.error("Error switching conversation:", error);
      toast.error("Failed to load conversation");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const toggleCourseFilter = (course: string) => {
    setCourseFilter(prev => 
      prev.includes(course) 
        ? prev.filter(c => c !== course)
        : [...prev, course]
    );
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDateFilter({});
    setCourseFilter([]);
  };

  const filteredConversations = useMemo(() => {
    return conversations.filter(conv => {
      // Search filter
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const titleMatch = conv.title?.toLowerCase().includes(searchLower);
        const contentMatch = conv.messages?.some(msg => 
          msg.content.toLowerCase().includes(searchLower)
        );
        if (!titleMatch && !contentMatch) return false;
      }

      // Date filter
      if (dateFilter.from || dateFilter.to) {
        const convDate = new Date(conv.last_message_at);
        if (dateFilter.from && convDate < dateFilter.from) return false;
        if (dateFilter.to && convDate > dateFilter.to) return false;
      }

      // Course filter
      if (courseFilter.length > 0) {
        const hasMatchingCourse = conv.messages?.some(msg =>
          courseFilter.some(course => 
            msg.content.toLowerCase().includes(course.toLowerCase())
          )
        );
        if (!hasMatchingCourse) return false;
      }

      return true;
    });
  }, [conversations, searchQuery, dateFilter, courseFilter]);

  const startNewConversation = async () => {
    try {
      const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("ai_advisor_session_id", newSessionId);
      setSessionId(newSessionId);

      const { data: newConv, error } = await sb
        .from("ai_advisor_conversations")
        .insert({
          session_id: newSessionId,
          email: emailCaptured ? email : null,
        })
        .select()
        .single();

      if (error) throw error;

      setConversationId(newConv.id);
      setMessages([
        {
          role: "assistant",
          content: "👋 Hi! I'm your AI career advisor at Titans Careers. I'm here to help you find the perfect course for your career goals. What brings you here today?",
        },
      ]);
      setShowHistory(false);
      setMilestoneSummarySent(false);
      
      if (emailCaptured) {
        loadConversationHistory(email);
      }
    } catch (error) {
      console.error("Error creating new conversation:", error);
      toast.error("Failed to start new conversation");
    }
  };

  const saveMessage = async (message: Message) => {
    if (!conversationId) return;

    try {

      await sb.from("ai_advisor_messages").insert({
        conversation_id: conversationId,
        role: message.role,
        content: message.content,
      });
    } catch (error) {
      console.error("Error saving message:", error);
    }
  };

  const handleEmailSubmit = async () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }

    try {
      // Subscribe to newsletter
      await sb.from("newsletter_subscribers").insert({
        email,
        name: null,
        source: "ai_advisor",
      });

      // Store email locally
      localStorage.setItem("ai_advisor_email", email);

      // Update conversation with email
      if (conversationId) {
        await sb
          .from("ai_advisor_conversations")
          .update({ email, lead_captured: true })
          .eq("id", conversationId);
      }

      setEmailCaptured(true);
      setShowEmailCapture(false);

      // Load conversation history
      await loadConversationHistory(email);

      toast.success("Great! I'll personalize my recommendations for you.");

      const confirmMessage: Message = {
        role: "assistant",
        content: "Perfect! ✅ I've got your email. I'll make sure to give you the most personalized recommendations. Now, let's continue - what are your main career goals?",
      };
      
      setMessages((prev) => [...prev, confirmMessage]);
      await saveMessage(confirmMessage);
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
    await saveMessage(userMessage);
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
      await saveMessage(assistantMessage);

      // Reload history to show updated conversation
      if (emailCaptured && email) {
        loadConversationHistory(email);
      }

      // Check for engagement milestones and send summary if reached
      const allMessages = [...messages, userMessage, assistantMessage];
      await checkEngagementMilestones(allMessages);

      // Check if we should suggest email capture
      if (data.suggestEmailCapture && !emailCaptured && !showEmailCapture) {
        setTimeout(() => {
          setShowEmailCapture(true);
        }, 2000);
      }
    } catch (error) {
      console.error("AI advisor error:", error);
      toast.error("Sorry, I'm having trouble responding. Please try again.");

      const errorMessage: Message = {
        role: "assistant",
        content: "I apologize, but I'm experiencing technical difficulties. Please try sending your message again, or contact us directly at info@titanscareers.com.",
      };

      setMessages((prev) => [...prev, errorMessage]);
      await saveMessage(errorMessage);
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

  const exportAsText = () => {
    const conversation = conversations.find(c => c.id === conversationId);
    const title = conversation?.title || "AI Advisor Conversation";
    const timestamp = new Date().toLocaleString();
    
    let textContent = `${title}\nExported: ${timestamp}\n${"=".repeat(50)}\n\n`;
    
    messages.forEach((msg) => {
      const role = msg.role === "user" ? "You" : "AI Advisor";
      textContent += `${role}:\n${msg.content}\n\n`;
    });
    
    const blob = new Blob([textContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `conversation-${conversationId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast.success("Conversation exported as text file");
  };

  const exportAsPDF = () => {
    const conversation = conversations.find(c => c.id === conversationId);
    const title = conversation?.title || "AI Advisor Conversation";
    const timestamp = new Date().toLocaleString();
    
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const maxWidth = pageWidth - 2 * margin;
    let yPosition = 20;
    
    // Title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(title, margin, yPosition);
    yPosition += 10;
    
    // Timestamp
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Exported: ${timestamp}`, margin, yPosition);
    yPosition += 15;
    
    // Messages
    doc.setFontSize(11);
    messages.forEach((msg) => {
      const role = msg.role === "user" ? "You" : "AI Advisor";
      
      // Check if we need a new page
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }
      
      // Role header
      doc.setFont("helvetica", "bold");
      doc.text(`${role}:`, margin, yPosition);
      yPosition += 7;
      
      // Message content
      doc.setFont("helvetica", "normal");
      const lines = doc.splitTextToSize(msg.content, maxWidth);
      lines.forEach((line: string) => {
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += 5;
      });
      
      yPosition += 8;
    });
    
    doc.save(`conversation-${conversationId}.pdf`);
    toast.success("Conversation exported as PDF");
  };

  const sendConversationSummary = async () => {
    if (!conversationId || !emailCaptured || !email) {
      toast.error("Please provide your email first to receive the summary");
      return;
    }

    if (messages.length <= 1) {
      toast.error("Have a longer conversation before requesting a summary");
      return;
    }

    setIsSendingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke("send-conversation-summary", {
        body: {
          conversationId,
          email,
        },
      });

      if (error) throw error;

      toast.success(
        `📧 Conversation summary sent to ${email}! Check your inbox.`,
        {
          description: data.coursesDiscussed?.length > 0 
            ? `Courses discussed: ${data.coursesDiscussed.join(", ")}`
            : "Your complete transcript and recommendations are on the way!"
        }
      );
    } catch (error) {
      console.error("Error sending summary:", error);
      toast.error("Failed to send conversation summary. Please try again.");
    } finally {
      setIsSendingSummary(false);
    }
  };

  const checkEngagementMilestones = async (allMessages: Message[]) => {
    if (!conversationId || !emailCaptured || !email || milestoneSummarySent) return;

    // Milestone 1: Conversation reaches 10+ messages
    if (allMessages.length === 10) {
      setMilestoneSummarySent(true);
      toast.success(
        "🎉 Great conversation! We'll send you a summary via email.",
        { description: "Keep chatting or review your recommendations anytime!" }
      );
      await sendConversationSummary();
      return;
    }

    // Milestone 2: User mentions enrollment intent keywords
    const enrollmentKeywords = ["enroll", "sign up", "register", "join", "start", "begin course", "price", "cost"];
    const lastUserMessage = allMessages.filter(m => m.role === "user").pop();
    
    if (lastUserMessage) {
      const hasIntent = enrollmentKeywords.some(keyword => 
        lastUserMessage.content.toLowerCase().includes(keyword)
      );
      
      if (hasIntent && allMessages.length >= 5) {
        setMilestoneSummarySent(true);
        setTimeout(async () => {
          toast.success(
            "📚 Ready to take the next step? We've sent you a detailed summary!",
            { description: "Check your email for course recommendations and next steps." }
          );
          await sendConversationSummary();
        }, 2000);
        return;
      }
    }

    // Milestone 3: Multiple courses discussed (3+)
    const courseKeywords = ["Power BI", "SQL", "Python", "Tableau", "Excel", "Azure", "AWS", "Data Science"];
    const coursesDiscussed = new Set<string>();
    
    allMessages.forEach(msg => {
      courseKeywords.forEach(course => {
        if (msg.content.toLowerCase().includes(course.toLowerCase())) {
          coursesDiscussed.add(course);
        }
      });
    });

    if (coursesDiscussed.size >= 3 && allMessages.length >= 6) {
      setMilestoneSummarySent(true);
      setTimeout(async () => {
        toast.success(
          "🎯 You're exploring multiple paths! Summary on the way!",
          { description: `We've discussed ${coursesDiscussed.size} different courses. Check your email!` }
        );
        await sendConversationSummary();
      }, 2000);
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
                  {emailCaptured && conversations.length > 0 && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={() => setShowHistory(!showHistory)}
                      title="Conversation History"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                  )}
                  {emailCaptured && (
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8 text-white hover:bg-white/20"
                      onClick={startNewConversation}
                      title="New Conversation"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                  {!showHistory && messages.length > 1 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white hover:bg-white/20"
                          title="Export & Share"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          onClick={sendConversationSummary}
                          disabled={isSendingSummary || !emailCaptured}
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {isSendingSummary ? "Sending..." : "Email Summary"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportAsPDF}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as PDF
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={exportAsText}>
                          <FileText className="h-4 w-4 mr-2" />
                          Export as Text
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
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
                  {showHistory ? (
                    /* Conversation History */
                    <div className="flex-1 overflow-y-auto p-4 h-[440px]">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Conversation History</h3>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowHistory(false)}
                        >
                          Back to Chat
                        </Button>
                      </div>
                      <ScrollArea className="h-[380px]">
                        <div className="space-y-2">
                          {filteredConversations.map((conv) => (
                            <div
                              key={conv.id}
                              className={`w-full p-3 rounded-lg border transition-colors ${
                                conv.id === conversationId
                                  ? "border-accent bg-accent/10"
                                  : "border-border hover:border-accent/50 hover:bg-accent/5"
                              }`}
                            >
                              <button
                                onClick={() => switchConversation(conv.id)}
                                disabled={isLoadingHistory}
                                className="w-full text-left"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                      {conv.title || "New conversation"}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {conv.message_count} messages
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                    <Clock className="h-3 w-3" />
                                    {new Date(conv.last_message_at).toLocaleDateString()}
                                  </div>
                                </div>
                              </button>
                            </div>
                          ))}
                          {filteredConversations.length === 0 && conversations.length > 0 && (
                            <p className="text-center text-muted-foreground text-sm py-8">
                              No conversations match your filters
                            </p>
                          )}
                          {conversations.length === 0 && (
                            <p className="text-center text-muted-foreground text-sm py-8">
                              No previous conversations
                            </p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  ) : (
                    /* Messages */
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
                  )}

                  {/* Input */}
                  {!showHistory && (
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
                  )}
                </>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
