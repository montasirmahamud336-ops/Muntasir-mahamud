import { Layout } from "@/components/Layout";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D, GlowText, ShineHeading } from "@/components/Card3D";
import { Video, ArrowRight, CheckCircle, Film, Music, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const tools = [
  "CapCut Pro",
  "Canva Video",
  "DaVinci Resolve",
  "Adobe Premiere",
];

const process = [
  { step: 1, title: "Footage Review", description: "Analyzing raw footage and understanding your vision" },
  { step: 2, title: "Rough Cut", description: "Creating initial edit with basic structure" },
  { step: 3, title: "Polish", description: "Adding effects, transitions, and color grading" },
  { step: 4, title: "Final Export", description: "Delivering optimized files for your platform" },
];

const deliverables = [
  "Short-form Social Content",
  "YouTube Videos",
  "Promotional Videos",
  "Motion Graphics",
  "Video Ads",
  "Reels & TikToks",
];

const pricing = [
  { tier: "Basic", price: "$60", features: ["Up to 1 min", "Basic editing", "3-day delivery"] },
  { tier: "Professional", price: "$180", features: ["Up to 5 min", "Motion graphics", "Music/SFX"] },
  { tier: "Enterprise", price: "$500", features: ["Unlimited length", "Advanced effects", "Rush delivery"] },
];

export default function VideoEditing() {
  return (
    <Layout>
      <section className="section pt-32">
        <div className="container mx-auto">
          {/* Hero */}
          <AnimatedSection className="text-center mb-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 flex items-center justify-center mx-auto mb-6">
              <Video className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-3d">
              <GlowText className="gradient-text">Video Editing</GlowText>
            </h1>
            <p className="section-subtitle mx-auto max-w-2xl">
              Professional video editing services to bring your stories to life 
              with engaging visuals and smooth transitions.
            </p>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-16" />

          {/* Tools Section */}
          <AnimatedSection className="mb-16">
            <ShineHeading as="h2" className="text-2xl font-heading font-semibold mb-8 text-center">
              Editing Software
            </ShineHeading>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {tools.map((tool, index) => (
                <StaggerItem key={index}>
                  <Card3D className="text-center py-4">
                    <Film className="w-6 h-6 text-primary mx-auto mb-2" />
                    <span className="text-sm font-medium">{tool}</span>
                  </Card3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-16" />

          {/* Process Section */}
          <AnimatedSection className="mb-16">
            <ShineHeading as="h2" className="text-2xl font-heading font-semibold mb-8 text-center">
              Editing Process
            </ShineHeading>
            <StaggerContainer className="grid md:grid-cols-4 gap-6 max-w-5xl mx-auto">
              {process.map((item, index) => (
                <StaggerItem key={index}>
                  <Card3D className="h-full text-center">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-4">
                      <span className="text-primary font-bold">{item.step}</span>
                    </div>
                    <h3 className="font-medium mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </Card3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-16" />

          {/* Deliverables */}
          <AnimatedSection className="mb-16">
            <ShineHeading as="h2" className="text-2xl font-heading font-semibold mb-8 text-center">
              Video Types
            </ShineHeading>
            <Card3D className="max-w-2xl mx-auto">
              <div className="grid md:grid-cols-2 gap-4">
                {deliverables.map((item, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>
            </Card3D>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-16" />

          {/* Pricing */}
          <AnimatedSection className="mb-16">
            <ShineHeading as="h2" className="text-2xl font-heading font-semibold mb-8 text-center">
              Pricing Overview
            </ShineHeading>
            <StaggerContainer className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {pricing.map((tier, index) => (
                <StaggerItem key={index}>
                  <Card3D className="h-full text-center">
                    <h3 className="font-heading font-semibold mb-2">{tier.tier}</h3>
                    <div className="text-3xl font-bold gradient-text mb-4">{tier.price}</div>
                    <ul className="space-y-2 mb-6">
                      {tier.features.map((feature, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-primary" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </Card3D>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-12" />

          {/* CTA */}
          <AnimatedSection>
            <Card3D className="max-w-xl mx-auto text-center p-8">
              <ShineHeading as="h2" className="text-2xl font-heading font-semibold mb-4">
                Ready to Create?
              </ShineHeading>
              <p className="text-muted-foreground mb-6">
                Let's turn your footage into something amazing.
              </p>
              <Link to="/get-started?service=video">
                <Button className="btn-primary">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </Card3D>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
