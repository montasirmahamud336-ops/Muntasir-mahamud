import { Layout } from "@/components/Layout";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D, GlowText, ShineHeading } from "@/components/Card3D";
import { PenTool, ArrowRight, CheckCircle, Clock, FileCheck, Ruler } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const tools = [
  "AutoCAD 2024",
  "AutoCAD P&ID",
  "AutoCAD Plant 3D",
  "Microsoft Visio",
];

const process = [
  { step: 1, title: "Requirements Gathering", description: "Understanding your project specifications and standards" },
  { step: 2, title: "Draft Creation", description: "Creating initial drawings based on requirements" },
  { step: 3, title: "Review & Revision", description: "Collaborative review and necessary modifications" },
  { step: 4, title: "Final Delivery", description: "Polished drawings in requested formats (DWG, PDF, etc.)" },
];

const deliverables = [
  "Process Flow Diagrams (PFD)",
  "Piping & Instrumentation Diagrams (P&ID)",
  "General Arrangement Drawings (GA)",
  "Isometric Drawings",
  "Equipment Layout Plans",
  "Technical Specifications",
];

const pricing = [
  { tier: "Basic", price: "$75", features: ["Single drawing", "2 revisions", "5-day delivery"] },
  { tier: "Professional", price: "$200", features: ["Up to 5 drawings", "5 revisions", "7-day delivery", "Source files"] },
  { tier: "Enterprise", price: "$500", features: ["Unlimited drawings", "Unlimited revisions", "Priority support", "Rush delivery"] },
];

export default function EngineeringDrawings() {
  return (
    <Layout>
      <section className="section pt-32">
        <div className="container mx-auto">
          {/* Hero */}
          <AnimatedSection className="text-center mb-16">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg shadow-primary/20 flex items-center justify-center mx-auto mb-6">
              <PenTool className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-3d">
              <GlowText className="gradient-text">Engineering Drawings</GlowText>
            </h1>
            <p className="section-subtitle mx-auto max-w-2xl">
              Professional AutoCAD drawings for process engineering, including PFD, P&ID, 
              and General Arrangement diagrams tailored to industry standards.
            </p>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-16" />

          {/* Tools Section */}
          <AnimatedSection className="mb-16">
            <ShineHeading as="h2" className="text-2xl font-heading font-semibold mb-8 text-center">
              Tools & Software
            </ShineHeading>
            <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
              {tools.map((tool, index) => (
                <StaggerItem key={index}>
                  <Card3D className="text-center py-4">
                    <Ruler className="w-6 h-6 text-primary mx-auto mb-2" />
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
              Work Process
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
              Example Deliverables
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
                Ready to Get Started?
              </ShineHeading>
              <p className="text-muted-foreground mb-6">
                Let's discuss your engineering drawing requirements.
              </p>
              <Link to="/get-started?service=autocad">
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
