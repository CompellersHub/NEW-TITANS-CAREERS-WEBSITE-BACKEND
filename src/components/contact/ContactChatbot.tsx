import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { MessageCircle, X, Send, Loader2, Trash2, Volume2, VolumeX, Paperclip, Image as ImageIcon, Search, Download, Mail, Bookmark, BookmarkCheck, ThumbsUp, ThumbsDown, BarChart3, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface QuickReply {
  category: 'courses' | 'pricing' | 'contact' | 'general';
  question: string;
  label: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
  id?: string;
  attachments?: Array<{
    type: 'image';
    data: string;
    mimeType: string;
    name: string;
  }>;
}

export const ContactChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm here to help answer your questions about our courses, pricing, and services. How can I assist you today?",
      id: 'initial-message'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [userIdentifier, setUserIdentifier] = useState<string | null>(null);
  const [attachments, setAttachments] = useState<Array<{ type: 'image'; data: string; mimeType: string; name: string }>>([]);
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('chatbot_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [emailAddress, setEmailAddress] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [bookmarkedMessages, setBookmarkedMessages] = useState<Set<string>>(() => {
    const saved = localStorage.getItem('chatbot_bookmarks');
    return saved ? new Set(JSON.parse(saved)) : new Set();
  });
  const [showBookmarks, setShowBookmarks] = useState(false);
  const [messageRatings, setMessageRatings] = useState<Map<string, 'up' | 'down'>>(() => {
    const saved = localStorage.getItem('chatbot_ratings');
    return saved ? new Map(JSON.parse(saved)) : new Map();
  });
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showQuickReplies, setShowQuickReplies] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { toast } = useToast();

  const quickReplies: QuickReply[] = [
    // Courses
    { category: 'courses', question: 'What courses do you offer?', label: '📚 Available Courses' },
    { category: 'courses', question: 'How long are the courses?', label: '⏱️ Course Duration' },
    { category: 'courses', question: 'Do you provide certifications?', label: '🎓 Certifications' },
    { category: 'courses', question: 'What are the prerequisites for your courses?', label: '📋 Prerequisites' },
    
    // Pricing
    { category: 'pricing', question: 'What are your course prices?', label: '💰 Pricing Info' },
    { category: 'pricing', question: 'Do you offer discounts or payment plans?', label: '💳 Payment Options' },
    { category: 'pricing', question: 'Is there a refund policy?', label: '↩️ Refund Policy' },
    
    // Contact
    { category: 'contact', question: 'How can I contact you?', label: '📞 Contact Methods' },
    { category: 'contact', question: 'Where are you located?', label: '📍 Location' },
    { category: 'contact', question: 'What are your operating hours?', label: '🕐 Business Hours' },
    
    // General
    { category: 'general', question: 'How do I enroll in a course?', label: '✅ Enrollment Process' },
    { category: 'general', question: 'Do you offer online or in-person training?', label: '💻 Training Format' },
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const playSound = (type: 'send' | 'receive') => {
    if (!soundEnabled) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Different frequencies for send vs receive
    oscillator.frequency.value = type === 'send' ? 800 : 600;
    oscillator.type = 'sine';
    
    // Short beep
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('chatbot_sound_enabled', String(newValue));
    toast({
      title: newValue ? "Sound enabled" : "Sound disabled",
      description: newValue ? "You'll hear sounds for messages" : "Message sounds are off",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load draft message on mount
  useEffect(() => {
    const savedDraft = localStorage.getItem('chatbot_draft_message');
    if (savedDraft) {
      setInput(savedDraft);
    }
  }, []);

  // Auto-save draft message
  useEffect(() => {
    if (input.trim()) {
      localStorage.setItem('chatbot_draft_message', input);
    } else {
      localStorage.removeItem('chatbot_draft_message');
    }
  }, [input]);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('chatbot_bookmarks', JSON.stringify([...bookmarkedMessages]));
  }, [bookmarkedMessages]);

  // Persist ratings
  useEffect(() => {
    localStorage.setItem('chatbot_ratings', JSON.stringify([...messageRatings]));
  }, [messageRatings]);

  // Initialize conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      // Get or create user identifier
      let identifier = localStorage.getItem('chatbot_user_id');
      if (!identifier) {
        identifier = crypto.randomUUID();
        localStorage.setItem('chatbot_user_id', identifier);
      }
      setUserIdentifier(identifier);

      // Get or create conversation
      let convId = localStorage.getItem('chatbot_conversation_id');
      
      if (convId) {
        // Load existing conversation messages
        const { data: conversation } = await supabase
          .from('chat_conversations')
          .select('id')
          .eq('id', convId)
          .eq('user_identifier', identifier)
          .single();

        if (conversation) {
          const { data: chatMessages } = await supabase
            .from('chat_messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('created_at', { ascending: true });

          if (chatMessages && chatMessages.length > 0) {
            const loadedMessages: Message[] = chatMessages.map(msg => ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
              timestamp: new Date(msg.created_at),
              id: msg.id
            }));
            setMessages(prev => [...prev, ...loadedMessages]);
          }
          setConversationId(convId);
          return;
        }
      }

      // Create new conversation
      const { data: newConversation } = await supabase
        .from('chat_conversations')
        .insert({ user_identifier: identifier })
        .select()
        .single();

      if (newConversation) {
        convId = newConversation.id;
        localStorage.setItem('chatbot_conversation_id', convId);
        setConversationId(convId);
      }
    };

    initConversation();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: typeof attachments = [];

    for (const file of Array.from(files)) {
      // Check file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 20MB limit`,
          variant: "destructive"
        });
        continue;
      }

      // Only accept images
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are supported",
          variant: "destructive"
        });
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          type: 'image',
          data: base64,
          mimeType: file.type,
          name: file.name
        });
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          title: "Error",
          description: `Failed to read ${file.name}`,
          variant: "destructive"
        });
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set to false if leaving the chat area entirely
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const newAttachments: typeof attachments = [];

    for (const file of Array.from(files)) {
      // Check file size (20MB limit)
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds 20MB limit`,
          variant: "destructive"
        });
        continue;
      }

      // Only accept images
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Invalid file type",
          description: "Only image files are supported",
          variant: "destructive"
        });
        continue;
      }

      try {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const base64String = (reader.result as string).split(',')[1];
            resolve(base64String);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          type: 'image',
          data: base64,
          mimeType: file.type,
          name: file.name
        });
      } catch (error) {
        console.error('Error reading file:', error);
        toast({
          title: "Error",
          description: `Failed to read ${file.name}`,
          variant: "destructive"
        });
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
  };

  const exportAsText = () => {
    const timestamp = new Date().toLocaleString();
    let content = `Chat History - ${timestamp}\n\n`;
    
    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      content += `[${time}] ${role}:\n${msg.content}\n\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chat-history-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported",
      description: "Chat history exported as text file"
    });
    playSound('send');
  };

  const exportAsPDF = () => {
    const doc = new jsPDF();
    const timestamp = new Date().toLocaleString();
    
    doc.setFontSize(16);
    doc.text('Chat History', 20, 20);
    doc.setFontSize(10);
    doc.text(timestamp, 20, 28);
    
    let yPosition = 40;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;
    
    messages.forEach((msg) => {
      const role = msg.role === 'user' ? 'You' : 'Assistant';
      const time = msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : '';
      
      // Check if we need a new page
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = 20;
      }
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(`[${time}] ${role}:`, margin, yPosition);
      yPosition += lineHeight;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      
      // Split long text into multiple lines
      const textLines = doc.splitTextToSize(msg.content, 170);
      textLines.forEach((line: string) => {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, margin, yPosition);
        yPosition += lineHeight;
      });
      
      yPosition += 3; // Add spacing between messages
    });
    
    doc.save(`chat-history-${Date.now()}.pdf`);
    toast({
      title: "Exported",
      description: "Chat history exported as PDF"
    });
    playSound('send');
  };

  const handleEmailTranscript = async () => {
    if (!emailAddress || !emailAddress.includes('@')) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address",
        variant: "destructive"
      });
      return;
    }

    setIsSendingEmail(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-chat-transcript', {
        body: {
          email: emailAddress,
          messages: messages.map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: msg.timestamp?.toISOString()
          }))
        }
      });

      if (error) throw error;

      toast({
        title: "Email sent!",
        description: `Chat transcript has been sent to ${emailAddress}`
      });
      playSound('send');
      setShowEmailDialog(false);
      setEmailAddress('');
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Failed to send email",
        description: "Please try again or use the export option",
        variant: "destructive"
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-300 dark:bg-yellow-600 text-foreground">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const filteredMessages = searchQuery.trim()
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  const searchResultCount = searchQuery.trim() 
    ? filteredMessages.length 
    : 0;

  const sendMessage = async () => {
    if ((!input.trim() && attachments.length === 0) || isLoading) return;

    const userMessage: Message = { 
      role: 'user', 
      content: input || 'Attached image(s)', 
      timestamp: new Date(),
      id: crypto.randomUUID(),
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setAttachments([]);
    localStorage.removeItem('chatbot_draft_message'); // Clear draft after sending
    setIsLoading(true);
    playSound('send');

    try {
      const { data, error } = await supabase.functions.invoke('contact-chat', {
        body: { 
          messages: [...messages, userMessage],
          conversationId,
          userIdentifier
        }
      });

      if (error) throw error;

      if (data?.message) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: data.message, 
          timestamp: new Date(),
          id: crypto.randomUUID()
        }]);
        playSound('receive');
      } else {
        throw new Error('No response from AI');
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: "Failed to get response. Please try again.",
        variant: "destructive"
      });
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but I'm having trouble responding right now. Please try using our contact form or reach out directly.",
        timestamp: new Date(),
        id: crypto.randomUUID()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleQuickReply = (question: string) => {
    setInput(question);
    setShowQuickReplies(false);
    // Auto-send the message
    setTimeout(() => {
      const syntheticEvent = new KeyboardEvent('keypress', { key: 'Enter' });
      sendMessage();
    }, 100);
  };

  const clearHistory = async () => {
    try {
      // Create new conversation
      if (!userIdentifier) return;

      const { data: newConversation } = await supabase
        .from('chat_conversations')
        .insert({ user_identifier: userIdentifier })
        .select()
        .single();

      if (newConversation) {
        const newConvId = newConversation.id;
        localStorage.setItem('chatbot_conversation_id', newConvId);
        setConversationId(newConvId);
        
        // Reset messages to initial state
        setMessages([{
          role: 'assistant',
          content: "Hi! I'm here to help answer your questions about our courses, pricing, and services. How can I assist you today?",
          id: 'initial-message'
        }]);
        setAttachments([]);
        setBookmarkedMessages(new Set());
        setMessageRatings(new Map());

        toast({
          title: "History cleared",
          description: "Started a fresh conversation",
        });
      }
    } catch (error) {
      console.error('Error clearing history:', error);
      toast({
        title: "Error",
        description: "Failed to clear history",
        variant: "destructive"
      });
    }
  };

  const toggleBookmark = (messageId: string) => {
    setBookmarkedMessages(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks.has(messageId)) {
        newBookmarks.delete(messageId);
        toast({
          title: "Bookmark removed",
          description: "Message removed from bookmarks"
        });
      } else {
        newBookmarks.add(messageId);
        toast({
          title: "Message bookmarked",
          description: "You can access this message from the bookmarks menu"
        });
      }
      return newBookmarks;
    });
  };

  const scrollToMessage = (messageId: string) => {
    const messageElement = messageRefs.current.get(messageId);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the message briefly
      messageElement.style.backgroundColor = 'hsl(var(--accent))';
      setTimeout(() => {
        messageElement.style.backgroundColor = '';
      }, 2000);
      setShowBookmarks(false);
    }
  };

  const bookmarkedMessagesList = messages.filter(msg => msg.id && bookmarkedMessages.has(msg.id));

  const rateMessage = (messageId: string, rating: 'up' | 'down') => {
    setMessageRatings(prev => {
      const newRatings = new Map(prev);
      const currentRating = newRatings.get(messageId);
      
      // Toggle if same rating, otherwise set new rating
      if (currentRating === rating) {
        newRatings.delete(messageId);
        toast({
          title: "Rating removed",
          description: "Your feedback has been removed"
        });
      } else {
        newRatings.set(messageId, rating);
        toast({
          title: "Thanks for your feedback!",
          description: rating === 'up' ? "Glad the response was helpful" : "We'll work on improving our responses"
        });
      }
      return newRatings;
    });
  };

  // Calculate analytics metrics
  const calculateAnalytics = () => {
    const userMessages = messages.filter(m => m.role === 'user');
    const assistantMessages = messages.filter(m => m.role === 'assistant');
    
    // Total messages (excluding initial greeting)
    const totalMessages = messages.length - 1; // Subtract initial greeting
    
    // Conversation duration
    let conversationDuration = 0;
    if (messages.length > 1 && messages[1].timestamp && messages[messages.length - 1].timestamp) {
      const start = new Date(messages[1].timestamp).getTime();
      const end = new Date(messages[messages.length - 1].timestamp).getTime();
      conversationDuration = Math.floor((end - start) / 1000); // in seconds
    }
    
    // Average response time (time between user message and AI response)
    let totalResponseTime = 0;
    let responseCount = 0;
    for (let i = 0; i < messages.length - 1; i++) {
      if (messages[i].role === 'user' && messages[i + 1].role === 'assistant') {
        if (messages[i].timestamp && messages[i + 1].timestamp) {
          const userTime = new Date(messages[i].timestamp).getTime();
          const assistantTime = new Date(messages[i + 1].timestamp).getTime();
          totalResponseTime += (assistantTime - userTime);
          responseCount++;
        }
      }
    }
    const avgResponseTime = responseCount > 0 ? Math.floor(totalResponseTime / responseCount / 1000) : 0;
    
    // Satisfaction rate
    const ratedMessages = assistantMessages.filter(m => m.id && messageRatings.has(m.id));
    const positiveRatings = ratedMessages.filter(m => m.id && messageRatings.get(m.id) === 'up').length;
    const satisfactionRate = ratedMessages.length > 0 
      ? Math.round((positiveRatings / ratedMessages.length) * 100) 
      : null;
    
    return {
      totalMessages,
      userMessages: userMessages.length,
      assistantMessages: assistantMessages.length - 1, // Subtract initial greeting
      conversationDuration,
      avgResponseTime,
      satisfactionRate,
      totalRatings: ratedMessages.length,
      positiveRatings,
      negativeRatings: ratedMessages.length - positiveRatings
    };
  };

  const analytics = calculateAnalytics();

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[500px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="bg-primary text-primary-foreground p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">Chat Support</h3>
                <p className="text-xs opacity-90">Powered by Gemini AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setShowSearch(!showSearch);
                  setSearchQuery('');
                }}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                title="Search messages"
              >
                <Search className="h-4 w-4" />
              </Button>
              <DropdownMenu open={showBookmarks} onOpenChange={setShowBookmarks}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                    title="Bookmarked messages"
                  >
                    <Bookmark className="h-4 w-4" />
                    {bookmarkedMessages.size > 0 && (
                      <span className="absolute top-1 right-1 h-2 w-2 bg-accent rounded-full" />
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 max-h-96 overflow-y-auto">
                  {bookmarkedMessagesList.length === 0 ? (
                    <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                      No bookmarked messages yet
                    </div>
                  ) : (
                    bookmarkedMessagesList.map((msg, idx) => (
                      <DropdownMenuItem
                        key={msg.id}
                        onClick={() => msg.id && scrollToMessage(msg.id)}
                        className="flex flex-col items-start gap-1 cursor-pointer"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <BookmarkCheck className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium">
                            {msg.role === 'user' ? 'You' : 'Assistant'}
                          </span>
                          {msg.timestamp && (
                            <span className="text-xs text-muted-foreground ml-auto">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2 w-full">
                          {msg.content}
                        </p>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                    disabled={messages.length <= 1}
                    title="Export chat history"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={exportAsText}>
                    Export as Text
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportAsPDF}>
                    Export as PDF
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowEmailDialog(true)}>
                    <Mail className="h-4 w-4 mr-2" />
                    Email Transcript
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowAnalytics(true)}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                title="View analytics"
              >
                <BarChart3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSound}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                title={soundEnabled ? "Disable sounds" : "Enable sounds"}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={clearHistory}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
                title="Clear history"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          {showSearch && (
            <div className="px-4 pt-3 pb-2 border-b">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search messages..."
                  className="pl-9 pr-20"
                />
                {searchQuery && (
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {searchResultCount} {searchResultCount === 1 ? 'result' : 'results'}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSearchQuery('')}
                      className="h-6 w-6"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Messages */}
          <div 
            className="flex-1 overflow-y-auto p-4 space-y-4 relative"
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            {isDragging && (
              <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10 pointer-events-none">
                <div className="text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-primary" />
                  <p className="text-lg font-semibold text-primary">Drop images here</p>
                  <p className="text-sm text-muted-foreground">Images up to 20MB</p>
                </div>
              </div>
            )}
            {searchQuery.trim() && filteredMessages.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No messages found matching "{searchQuery}"</p>
              </div>
            )}
            {filteredMessages.map((message, index) => (
              <div
                key={index}
                ref={(el) => {
                  if (el && message.id) {
                    messageRefs.current.set(message.id, el);
                  }
                }}
                className={`flex flex-col ${message.role === 'user' ? 'items-end' : 'items-start'} group relative`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  {message.attachments && message.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {message.attachments.map((attachment, idx) => (
                        <img
                          key={idx}
                          src={`data:${attachment.mimeType};base64,${attachment.data}`}
                          alt={attachment.name}
                          className="max-w-[200px] max-h-[200px] rounded object-cover"
                        />
                      ))}
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">
                    {searchQuery.trim() ? highlightText(message.content, searchQuery) : message.content}
                  </p>
                </div>
                {message.id && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity absolute ${
                      message.role === 'user' ? 'right-0' : 'left-0'
                    } top-0 -translate-y-1`}
                    onClick={() => toggleBookmark(message.id!)}
                  >
                    {bookmarkedMessages.has(message.id) ? (
                      <BookmarkCheck className="h-3 w-3 text-primary" />
                    ) : (
                      <Bookmark className="h-3 w-3" />
                    )}
                  </Button>
                )}
                <div className="flex items-center gap-2">
                  {message.timestamp && (
                    <span className="text-xs text-muted-foreground px-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                  {message.role === 'assistant' && message.id && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${messageRatings.get(message.id) === 'up' ? 'text-success' : 'text-muted-foreground'}`}
                        onClick={() => rateMessage(message.id!, 'up')}
                        title="Helpful response"
                      >
                        <ThumbsUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className={`h-6 w-6 ${messageRatings.get(message.id) === 'down' ? 'text-destructive' : 'text-muted-foreground'}`}
                        onClick={() => rateMessage(message.id!, 'down')}
                        title="Not helpful"
                      >
                        <ThumbsDown className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center gap-1">
                  <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-foreground/60 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {showQuickReplies && messages.length <= 2 && (
            <div className="border-t bg-muted/30 p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Quick Replies</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowQuickReplies(false)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {quickReplies.map((reply, idx) => (
                  <Badge
                    key={idx}
                    variant="secondary"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors text-xs py-1 px-2"
                    onClick={() => handleQuickReply(reply.question)}
                  >
                    {reply.label}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!showQuickReplies && messages.length <= 2 && (
            <div className="border-t px-4 py-2 bg-muted/20">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => setShowQuickReplies(true)}
              >
                <Zap className="h-3 w-3 mr-2" />
                Show Quick Replies
              </Button>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t">
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 p-2 bg-muted rounded">
                {attachments.map((attachment, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={`data:${attachment.mimeType};base64,${attachment.data}`}
                      alt={attachment.name}
                      className="w-16 h-16 rounded object-cover"
                    />
                    <button
                      onClick={() => removeAttachment(idx)}
                      className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                title="Attach image"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your question..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || (!input.trim() && attachments.length === 0)}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Chat Transcript</DialogTitle>
            <DialogDescription>
              Enter your email address to receive a copy of this chat conversation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="your.email@example.com"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleEmailTranscript();
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowEmailDialog(false);
                setEmailAddress('');
              }}
              disabled={isSendingEmail}
            >
              Cancel
            </Button>
            <Button
              onClick={handleEmailTranscript}
              disabled={isSendingEmail || !emailAddress}
            >
              {isSendingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Analytics Dialog */}
      <Dialog open={showAnalytics} onOpenChange={setShowAnalytics}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Chat Session Analytics</DialogTitle>
            <DialogDescription>
              Insights about your conversation session
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Message Stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Total Messages</div>
                <div className="text-2xl font-bold">{analytics.totalMessages}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {analytics.userMessages} from you, {analytics.assistantMessages} from AI
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Duration</div>
                <div className="text-2xl font-bold">
                  {analytics.conversationDuration > 0 ? formatDuration(analytics.conversationDuration) : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  Conversation length
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-muted-foreground mb-1">Avg Response</div>
                <div className="text-2xl font-bold">
                  {analytics.avgResponseTime > 0 ? `${analytics.avgResponseTime}s` : 'N/A'}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  AI response time
                </div>
              </Card>
            </div>

            {/* Satisfaction Rate */}
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-2">Satisfaction Rate</div>
              {analytics.satisfactionRate !== null ? (
                <>
                  <div className="flex items-center gap-4">
                    <div className="text-3xl font-bold text-primary">{analytics.satisfactionRate}%</div>
                    <div className="flex-1">
                      <div className="w-full bg-muted rounded-full h-3">
                        <div 
                          className="bg-primary h-3 rounded-full transition-all" 
                          style={{ width: `${analytics.satisfactionRate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-sm">
                    <div className="flex items-center gap-1 text-success">
                      <ThumbsUp className="h-4 w-4" />
                      <span>{analytics.positiveRatings} positive</span>
                    </div>
                    <div className="flex items-center gap-1 text-destructive">
                      <ThumbsDown className="h-4 w-4" />
                      <span>{analytics.negativeRatings} negative</span>
                    </div>
                    <div className="text-muted-foreground ml-auto">
                      {analytics.totalRatings} total ratings
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p className="mb-2">No ratings yet</p>
                  <p className="text-sm">Rate AI responses to see satisfaction metrics</p>
                </div>
              )}
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Messages per minute</div>
                    <div className="text-lg font-semibold">
                      {analytics.conversationDuration > 0 
                        ? ((analytics.totalMessages / analytics.conversationDuration) * 60).toFixed(1)
                        : 'N/A'
                      }
                    </div>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                    <Bookmark className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Bookmarked Messages</div>
                    <div className="text-lg font-semibold">{bookmarkedMessages.size}</div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={() => setShowAnalytics(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
