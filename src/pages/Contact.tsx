import { useState } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { AnimatedSection } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D } from "@/components/Card3D";
import { Mail, Phone, MapPin, Send, Clock, CheckCircle, Loader2, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

type ContactInfoItem = {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
};

export default function Contact() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const subject = encodeURIComponent(formData.subject.trim() || "Project Inquiry");
    const body = encodeURIComponent(
      `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`,
    );

    window.location.href = `mailto:montasirmahamud336@gmail.com?subject=${subject}&body=${body}`;

    toast({
      title: "Email Draft Opened",
      description: "Your email app has been opened with the message details.",
    });

    setFormData({ name: "", email: "", subject: "", message: "" });
    setIsSubmitting(false);
  };

  const contactInfo: ContactInfoItem[] = [
    {
      icon: Phone,
      label: "Phone",
      value: "01924733432",
      href: "tel:01924733432",
    },
    {
      icon: Mail,
      label: "Email",
      value: "montasirmahamud336@gmail.com",
      href: "mailto:montasirmahamud336@gmail.com",
    },
    {
      icon: MapPin,
      label: "Location",
      value: "Rangpur, Bangladesh",
    },
    {
      icon: Clock,
      label: "Response Time",
      value: "Within 24 hours",
    },
  ];

  return (
    <Layout>
      <section className="section pt-32">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block text-glow">Get In Touch</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-3d">
              Let&apos;s <span className="gradient-text">Connect</span>
            </h1>
            <p className="section-subtitle mx-auto">
              Have a project in mind or want to discuss collaboration opportunities?
              I&apos;d love to hear from you.
            </p>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-12" />

          <div className="grid lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            <AnimatedSection direction="left">
              <div className="perspective">
                <Card3D>
                  <h2 className="text-2xl font-heading font-semibold mb-6 text-glow">
                    Send a Message
                  </h2>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Name</label>
                        <Input
                          type="text"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Email</label>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Subject</label>
                      <Input
                        type="text"
                        placeholder="Project inquiry..."
                        value={formData.subject}
                        onChange={(e) =>
                          setFormData({ ...formData, subject: e.target.value })
                        }
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">Message</label>
                      <Textarea
                        placeholder="Tell me about your project..."
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        className="bg-background/50 border-border/50 focus:border-primary focus:ring-primary/20 min-h-[150px]"
                        required
                      />
                    </div>

                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Button
                        type="submit"
                        className="w-full btn-primary"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Opening...
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <Send className="w-4 h-4" />
                            Send Message
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </form>
                </Card3D>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="right" delay={0.2}>
              <div className="space-y-6">
                <div className="perspective">
                  <Card3D>
                    <h2 className="text-2xl font-heading font-semibold mb-6 text-glow">
                      Contact Information
                    </h2>

                    <div className="space-y-4">
                      {contactInfo.map((item, index) => {
                        const Content = (
                          <>
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center group-hover:glow-sm transition-all">
                              <item.icon className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <span className="text-sm text-muted-foreground">
                                {item.label}
                              </span>
                              <p className="font-medium">{item.value}</p>
                            </div>
                          </>
                        );

                        if (item.href) {
                          return (
                            <motion.a
                              key={index}
                              href={item.href}
                              whileHover={{ x: 8 }}
                              className="flex items-center gap-4 p-3 rounded-xl hover:bg-primary/5 transition-colors group"
                            >
                              {Content}
                            </motion.a>
                          );
                        }

                        return (
                          <div
                            key={index}
                            className="flex items-center gap-4 p-3 rounded-xl bg-primary/5"
                          >
                            {Content}
                          </div>
                        );
                      })}
                    </div>
                  </Card3D>
                </div>

                <div className="perspective">
                  <Card3D>
                    <h3 className="text-xl font-heading font-semibold mb-4 text-glow">
                      Why Work With Me?
                    </h3>
                    <ul className="space-y-3">
                      {[
                        "Fast turnaround time",
                        "Clear communication",
                        "Competitive pricing",
                        "Quality guaranteed",
                        "Unlimited revisions",
                      ].map((item, index) => (
                        <li key={index} className="flex items-center gap-3 text-muted-foreground">
                          <CheckCircle className="w-5 h-5 text-primary" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </Card3D>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </Layout>
  );
}
