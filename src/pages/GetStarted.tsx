import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Layout } from "@/components/Layout";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D, GlowText } from "@/components/Card3D";
import { 
  PenTool, 
  Code, 
  Cpu, 
  Palette, 
  Video, 
  FileText,
  Check,
  ArrowRight,
  Mail,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";

const services = [
  {
    id: "autocad",
    icon: PenTool,
    title: "AutoCAD Drawings",
    description: "Professional technical drawings",
    pricing: {
      basic: { price: 75, features: ["Single drawing", "2 revisions", "5-day delivery"] },
      professional: { price: 200, features: ["Up to 5 drawings", "5 revisions", "7-day delivery", "Source files"] },
      enterprise: { price: 500, features: ["Unlimited drawings", "Unlimited revisions", "Priority support", "Rush delivery available"] },
    },
  },
  {
    id: "web",
    icon: Code,
    title: "Web Development",
    description: "Modern responsive websites",
    pricing: {
      basic: { price: 150, features: ["Landing page", "Mobile responsive", "5-day delivery"] },
      professional: { price: 400, features: ["Multi-page site", "CMS integration", "SEO setup", "10-day delivery"] },
      enterprise: { price: 1000, features: ["Full website", "Custom features", "Ongoing support", "Maintenance included"] },
    },
  },
  {
    id: "automation",
    icon: Cpu,
    title: "Automation Tools",
    description: "Python-based automation",
    pricing: {
      basic: { price: 100, features: ["Simple script", "Documentation", "3-day delivery"] },
      professional: { price: 300, features: ["Complex automation", "API integration", "Testing included"] },
      enterprise: { price: 800, features: ["Full system", "AI integration", "Maintenance", "Training"] },
    },
  },
  {
    id: "graphics",
    icon: Palette,
    title: "Graphic Design",
    description: "Marketing materials",
    pricing: {
      basic: { price: 40, features: ["Single design", "2 revisions", "2-day delivery"] },
      professional: { price: 120, features: ["5 designs", "5 revisions", "Brand consistency"] },
      enterprise: { price: 300, features: ["Complete package", "Unlimited revisions", "Brand guidelines"] },
    },
  },
  {
    id: "video",
    icon: Video,
    title: "Video Editing",
    description: "Professional video content",
    pricing: {
      basic: { price: 60, features: ["Up to 1 min", "Basic editing", "3-day delivery"] },
      professional: { price: 180, features: ["Up to 5 min", "Motion graphics", "Music/SFX"] },
      enterprise: { price: 500, features: ["Unlimited length", "Advanced effects", "Rush delivery"] },
    },
  },
  {
    id: "documentation",
    icon: FileText,
    title: "Technical Documentation",
    description: "Clear documentation",
    pricing: {
      basic: { price: 50, features: ["Single document", "2 revisions", "3-day delivery"] },
      professional: { price: 150, features: ["Document set", "5 revisions", "Templates"] },
      enterprise: { price: 400, features: ["Full documentation", "Ongoing updates", "Training"] },
    },
  },
];

type PricingTier = "basic" | "professional" | "enterprise";

export default function GetStarted() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const initialService = searchParams.get("service") || "";
  
  const [selectedService, setSelectedService] = useState<string>(initialService);
  const [selectedTier, setSelectedTier] = useState<PricingTier>("professional");
  const [showContactOptions, setShowContactOptions] = useState(false);

  useEffect(() => {
    if (initialService) {
      setSelectedService(initialService);
    }
  }, [initialService]);

  const currentService = services.find(s => s.id === selectedService);

  const handleGetStarted = () => {
    setShowContactOptions(true);
  };

  const handleSendEmail = () => {
    if (!user) {
      navigate("/auth?redirect=/get-started" + (selectedService ? `?service=${selectedService}` : ""));
      return;
    }
    
    const subject = encodeURIComponent(`Inquiry: ${currentService?.title} - ${selectedTier} package`);
    const body = encodeURIComponent(
      `Hi,\n\nI'm interested in the ${selectedTier} package for ${currentService?.title}.\n\nPrice: $${currentService?.pricing[selectedTier].price}\n\nPlease let me know the next steps.\n\nThank you!`
    );
    window.location.href = `mailto:montasirmahamud336@gmail.com?subject=${subject}&body=${body}`;
  };

  const handleStartChat = () => {
    if (!user) {
      navigate("/auth?redirect=/chat" + (selectedService ? `?service=${selectedService}` : ""));
      return;
    }
    navigate(`/chat?service=${selectedService}`);
  };

  return (
    <Layout>
      <section className="section pt-32">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block text-glow">Start Your Project</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-3d">
              <GlowText className="gradient-text">Get Started</GlowText>
            </h1>
            <p className="section-subtitle mx-auto">
              Select a service and choose a package that fits your needs.
            </p>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-12" />

          {/* Step 1: Select Service */}
          <AnimatedSection className="mb-16">
            <h2 
              className="text-2xl font-heading font-semibold mb-8 text-center"
              style={{ textShadow: "0 0 15px hsl(var(--primary) / 0.3)" }}
            >
              1. Select a Service
            </h2>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {services.map((service) => (
                <StaggerItem key={service.id} className="h-full">
                  <Card3D 
                    isSelected={selectedService === service.id}
                    className="cursor-pointer h-full"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedService(service.id);
                        setShowContactOptions(false);
                      }}
                      className="w-full h-full min-h-[160px] text-center p-4 flex flex-col items-center justify-center"
                    >
                      <service.icon 
                        className={`w-8 h-8 mx-auto mb-3 transition-colors ${
                          selectedService === service.id ? "text-primary" : "text-muted-foreground"
                        }`}
                        style={selectedService === service.id ? { filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.6))" } : {}}
                      />
                      <h3 className="text-sm font-medium leading-snug min-h-[2.75rem] flex items-center justify-center">
                        {service.title}
                      </h3>
                    </button>
                  </Card3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>

          {/* Step 2: Pricing Panel */}
          <AnimatePresence mode="wait">
            {currentService && (
              <motion.div
                key={currentService.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <GlowDivider className="max-w-4xl mx-auto mb-12" />
                
                <AnimatedSection className="mb-16">
                  <h2 
                    className="text-2xl font-heading font-semibold mb-8 text-center"
                    style={{ textShadow: "0 0 15px hsl(var(--primary) / 0.3)" }}
                  >
                    2. Choose Your Package
                  </h2>

                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                    className="relative max-w-4xl mx-auto"
                  >
                    <div className="absolute -inset-[2px] rounded-2xl bg-gradient-to-r from-primary/60 via-primary/30 to-primary/60 opacity-80 blur-sm" />
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-primary/40 to-primary/40" />
                    
                    <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl p-6 md:p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                          <currentService.icon className="w-6 h-6 text-primary" style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))" }} />
                        </div>
                        <div>
                          <h3 className="text-xl font-heading font-semibold">{currentService.title}</h3>
                          <p className="text-muted-foreground text-sm">{currentService.description}</p>
                        </div>
                      </div>

                      <RadioGroup
                        value={selectedTier}
                        onValueChange={(value) => {
                          setSelectedTier(value as PricingTier);
                          setShowContactOptions(false);
                        }}
                        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                      >
                        {(["basic", "professional", "enterprise"] as const).map((tier) => {
                          const pricing = currentService.pricing[tier];
                          const isSelected = selectedTier === tier;
                          
                          return (
                            <Label
                              key={tier}
                              htmlFor={tier}
                              className={`relative cursor-pointer rounded-xl p-5 transition-all duration-300 ${
                                isSelected 
                                  ? "bg-primary/10 border-2 border-primary/50" 
                                  : "bg-card/50 border border-border/50 hover:border-primary/30"
                              }`}
                              style={isSelected ? {
                                boxShadow: "0 0 20px hsl(var(--primary) / 0.2), inset 0 0 20px hsl(var(--primary) / 0.05)"
                              } : {}}
                            >
                              <RadioGroupItem value={tier} id={tier} className="sr-only" />
                              
                              {tier === "professional" && (
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
                                  Popular
                                </span>
                              )}

                              <div className="text-center mb-4">
                                <h4 className="font-medium capitalize mb-1">{tier}</h4>
                                <div className="flex items-baseline justify-center gap-1">
                                  <span 
                                    className="text-3xl font-bold"
                                    style={isSelected ? { textShadow: "0 0 20px hsl(var(--primary) / 0.5)" } : {}}
                                  >
                                    ${pricing.price}
                                  </span>
                                </div>
                              </div>

                              <ul className="space-y-2">
                                {pricing.features.map((feature, i) => (
                                  <li key={i} className="flex items-center gap-2 text-sm">
                                    <Check className={`w-4 h-4 flex-shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                                    <span className="text-muted-foreground">{feature}</span>
                                  </li>
                                ))}
                              </ul>
                            </Label>
                          );
                        })}
                      </RadioGroup>
                    </div>
                  </motion.div>
                </AnimatedSection>

                {/* Step 3: Contact Options */}
                <GlowDivider className="max-w-4xl mx-auto mb-12" />
                
                <AnimatedSection className="mb-16">
                  <h2 
                    className="text-2xl font-heading font-semibold mb-8 text-center"
                    style={{ textShadow: "0 0 15px hsl(var(--primary) / 0.3)" }}
                  >
                    3. Get Started
                  </h2>

                  <AnimatePresence mode="wait">
                    {!showContactOptions ? (
                      <motion.div
                        key="get-started-btn"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                      >
                        <Card3D className="max-w-md mx-auto p-8">
                          <h3 className="text-xl font-heading font-semibold mb-2">Order Summary</h3>
                          <div className="space-y-2 mb-6 text-left">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Service:</span>
                              <span className="font-medium">{currentService.title}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Package:</span>
                              <span className="font-medium capitalize">{selectedTier}</span>
                            </div>
                            <GlowDivider />
                            <div className="flex justify-between text-lg">
                              <span className="font-medium">Total:</span>
                              <GlowText className="font-bold text-primary">
                                ${currentService.pricing[selectedTier].price}
                              </GlowText>
                            </div>
                          </div>
                          <Button onClick={handleGetStarted} className="btn-primary w-full">
                            Get Started
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Card3D>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="contact-options"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto"
                      >
                        <Card3D className="cursor-pointer">
                          <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              <Mail className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-heading font-semibold mb-2">Send Email</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Send a detailed inquiry via email
                            </p>
                            <Button type="button" className="btn-primary w-full" onClick={handleSendEmail}>
                              Open Email
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </Card3D>

                        <Card3D className="cursor-pointer">
                          <div className="text-center py-6">
                            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                              <MessageSquare className="w-8 h-8 text-primary" />
                            </div>
                            <h3 className="text-lg font-heading font-semibold mb-2">Start Chat</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Real-time messaging with file sharing
                            </p>
                            <Button type="button" className="btn-primary w-full" onClick={handleStartChat}>
                              {user ? "Open Chat" : "Sign In to Chat"}
                              <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        </Card3D>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </AnimatedSection>
              </motion.div>
            )}
          </AnimatePresence>

          {!currentService && (
            <AnimatedSection className="text-center py-12">
              <p className="text-muted-foreground">Select a service above to view pricing options.</p>
            </AnimatedSection>
          )}
        </div>
      </section>
    </Layout>
  );
}
