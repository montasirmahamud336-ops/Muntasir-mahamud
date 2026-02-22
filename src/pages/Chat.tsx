import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { AnimatedSection } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D, GlowText } from "@/components/Card3D";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MessageSquare, Plus, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

interface Conversation {
  id: string;
  service_type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Chat() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const isCreatingRef = useRef(false);

  const serviceFromUrl = searchParams.get("service");

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth?redirect=/chat" + (serviceFromUrl ? `?service=${serviceFromUrl}` : ""));
    }
  }, [user, loading, navigate, serviceFromUrl]);

  const createConversation = useCallback(
    async (serviceType: string) => {
      if (!user || isCreatingRef.current) return;

      isCreatingRef.current = true;
      setIsCreating(true);

      try {
        const { data, error } = await supabase
          .from("conversations")
          .insert({
            user_id: user.id,
            service_type: serviceType,
          })
          .select()
          .single();

        if (!error && data) {
          setConversations((prev) => [data, ...prev]);
          setSelectedConversation(data);
        }
      } finally {
        isCreatingRef.current = false;
        setIsCreating(false);
      }
    },
    [user],
  );

  useEffect(() => {
    if (!user) return;

    const fetchConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });

      if (!error && data) {
        setConversations(data);

        // Auto-select or create if coming from service page
        if (serviceFromUrl && data.length === 0) {
          createConversation(serviceFromUrl);
        } else if (serviceFromUrl) {
          const existing = data.find((c) => c.service_type === serviceFromUrl && c.status === "active");
          if (existing) {
            setSelectedConversation(existing);
          } else {
            createConversation(serviceFromUrl);
          }
        }
      }
    };

    fetchConversations();
  }, [user, serviceFromUrl, createConversation]);

  if (loading) {
    return (
      <Layout>
        <section className="section pt-32 min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-primary">Loading...</div>
        </section>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <section className="section pt-32">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-heading font-bold mb-4 text-3d">
              <GlowText className="gradient-text">Chat Support</GlowText>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Real-time messaging with file sharing. Get quick responses to your project inquiries.
            </p>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-12" />

          <div className="grid lg:grid-cols-3 gap-6 max-w-6xl mx-auto" style={{ minHeight: "500px" }}>
            {/* Conversations List */}
            <div className="lg:col-span-1">
              <Card3D className="h-full">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-heading font-semibold">Conversations</h3>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => createConversation("general")}
                    disabled={isCreating}
                    className="border-primary/30"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    New
                  </Button>
                </div>

                <div className="space-y-2">
                  {conversations.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No conversations yet. Start a new one!
                    </p>
                  ) : (
                    conversations.map((conv) => (
                      <motion.button
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full text-left p-3 rounded-xl transition-all ${
                          selectedConversation?.id === conv.id
                            ? "bg-primary/20 border border-primary/50"
                            : "bg-muted/50 hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <MessageSquare className="w-5 h-5 text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm capitalize truncate">
                              {conv.service_type.replace("-", " ")}
                            </p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {format(new Date(conv.updated_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          <span
                            className={`px-2 py-0.5 text-xs rounded-full ${
                              conv.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {conv.status}
                          </span>
                        </div>
                      </motion.button>
                    ))
                  )}
                </div>
              </Card3D>
            </div>

            {/* Chat Window */}
            <div className="lg:col-span-2">
              {selectedConversation ? (
                <ChatWindow
                  conversationId={selectedConversation.id}
                  serviceType={selectedConversation.service_type}
                />
              ) : (
                <Card3D className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      Select a conversation or start a new one
                    </p>
                  </div>
                </Card3D>
              )}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
