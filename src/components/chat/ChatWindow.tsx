import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Paperclip, X, Download, FileIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  is_admin: boolean;
  created_at: string;
}

interface ChatFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

interface ChatWindowProps {
  conversationId: string;
  serviceType: string;
  onClose?: () => void;
}

export function ChatWindow({ conversationId, serviceType, onClose }: ChatWindowProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<ChatFile[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingFile, setUploadingFile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages
  useEffect(() => {
    if (!conversationId) return;

    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching messages:", error);
        return;
      }

      setMessages(data || []);
    };

    const fetchFiles = async () => {
      const { data, error } = await supabase
        .from("chat_files")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error fetching files:", error);
        return;
      }

      setFiles(data || []);
    };

    fetchMessages();
    fetchFiles();

    // Subscribe to realtime messages
    const channel = supabase
      .channel(`messages:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || isLoading) return;

    setIsLoading(true);
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      content: newMessage.trim(),
      is_admin: false,
    });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } else {
      setNewMessage("");
    }
    setIsLoading(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Check file size (50MB limit)
    if (file.size > 52428800) {
      toast({
        title: "File too large",
        description: "Maximum file size is 50MB.",
        variant: "destructive",
      });
      return;
    }

    setUploadingFile(true);

    const filePath = `${conversationId}/${Date.now()}_${file.name}`;
    
    const { error: uploadError } = await supabase.storage
      .from("chat-files")
      .upload(filePath, file);

    if (uploadError) {
      toast({
        title: "Upload failed",
        description: "Failed to upload file. Please try again.",
        variant: "destructive",
      });
      setUploadingFile(false);
      return;
    }

    const { error: dbError } = await supabase.from("chat_files").insert({
      conversation_id: conversationId,
      sender_id: user.id,
      file_name: file.name,
      file_path: filePath,
      file_type: file.type,
      file_size: file.size,
    });

    if (dbError) {
      toast({
        title: "Error",
        description: "Failed to save file info.",
        variant: "destructive",
      });
    } else {
      // Refetch files
      const { data } = await supabase
        .from("chat_files")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      setFiles(data || []);
      
      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully.`,
      });
    }

    setUploadingFile(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadFile = async (filePath: string, fileName: string) => {
    const { data, error } = await supabase.storage
      .from("chat-files")
      .download(filePath);

    if (error) {
      toast({
        title: "Download failed",
        description: "Failed to download file.",
        variant: "destructive",
      });
      return;
    }

    const url = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div className="flex flex-col h-full bg-card/95 backdrop-blur-xl rounded-2xl border border-primary/30 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20">
        <div>
          <h3 className="font-heading font-semibold">Chat Support</h3>
          <p className="text-xs text-muted-foreground capitalize">{serviceType.replace("-", " ")}</p>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        )}
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender_id === user?.id ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                    message.sender_id === user?.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {format(new Date(message.created_at), "HH:mm")}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Files Section */}
          {files.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-primary/10">
              <p className="text-xs text-muted-foreground font-medium">Shared Files</p>
              {files.map((file) => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <FileIcon className="w-8 h-8 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.file_size)} - {format(new Date(file.created_at), "MMM d, HH:mm")}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => downloadFile(file.file_path, file.file_name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 border-t border-primary/20">
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.dwg,.dxf,.mp4,.mov,.avi"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingFile}
          >
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-background/50 border-border/50"
            disabled={isLoading}
          />
          <Button type="submit" size="icon" disabled={isLoading || !newMessage.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </div>
  );
}

