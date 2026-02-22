import { Layout } from "@/components/Layout";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D, GlowText, ShineHeading } from "@/components/Card3D";
import { 
  PenTool, 
  Code, 
  Cpu, 
  Palette, 
  Video, 
  FileText,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const services = [
  {
    id: "autocad",
    icon: PenTool,
    title: "AutoCAD Drawings",
    description: "Professional technical drawings including PFD, P&ID, and General Arrangement diagrams for engineering projects.",
    features: ["Process Flow Diagrams", "P&ID Drawings", "General Arrangement", "Technical Specifications"],
  },
  {
    id: "web",
    icon: Code,
    title: "Web Development",
    description: "Modern, responsive websites built with HTML, CSS, and WordPress. Clean code and user-friendly designs.",
    features: ["Responsive Design", "WordPress Sites", "Landing Pages", "Custom Themes"],
  },
  {
    id: "automation",
    icon: Cpu,
    title: "Automation Tools",
    description: "Python-based automation solutions and AI-assisted tool development to streamline your workflows.",
    features: ["Python Scripts", "AI Integration", "Workflow Automation", "Data Processing"],
  },
  {
    id: "graphics",
    icon: Palette,
    title: "Graphic Design",
    description: "Eye-catching flyer designs and visual content created with Canva for marketing and promotional needs.",
    features: ["Flyer Design", "Social Media Graphics", "Brand Assets", "Marketing Materials"],
  },
  {
    id: "video",
    icon: Video,
    title: "Video Editing",
    description: "Professional video editing using Canva and CapCut for engaging content that tells your story.",
    features: ["Short-form Content", "Social Media Videos", "Promotional Videos", "Motion Graphics"],
  },
  {
    id: "documentation",
    icon: FileText,
    title: "Technical Documentation",
    description: "Clear, comprehensive documentation for technical projects, processes, and user guides.",
    features: ["User Manuals", "Process Documentation", "Technical Guides", "SOPs"],
  },
];

export default function Services() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="section pt-32">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-16">
            <span className="text-primary font-medium mb-4 block text-glow">What I Offer</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold mb-6 text-3d">
              My <GlowText className="gradient-text">Services</GlowText>
            </h1>
            <p className="section-subtitle mx-auto">
              Comprehensive solutions for engineering, web development, automation, and creative design needs.
            </p>
          </AnimatedSection>

          <GlowDivider className="max-w-4xl mx-auto mb-16" />

          {/* Services Grid - Consistent card heights */}
          <StaggerContainer className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {services.map((service) => (
              <StaggerItem key={service.id}>
                <Card3D className="h-full">
                  <div className="flex flex-col h-full min-h-[320px]">
                    {/* Icon */}
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-5 border border-primary/20">
                      <service.icon 
                        className="w-7 h-7 text-primary" 
                        style={{ filter: "drop-shadow(0 0 8px hsl(var(--primary) / 0.5))" }} 
                      />
                    </div>

                    {/* Title with shine effect */}
                    <ShineHeading 
                      as="h3"
                      className="text-xl font-heading font-semibold mb-3"
                    >
                      {service.title}
                    </ShineHeading>

                    {/* Description */}
                    <p className="text-muted-foreground mb-5 flex-grow text-sm leading-relaxed">
                      {service.description}
                    </p>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {service.features.map((feature, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary border border-primary/20"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    {/* CTA */}
                    <Link to={`/get-started?service=${service.id}`} className="mt-auto">
                      <Button 
                        variant="outline" 
                        className="w-full group border-primary/30 hover:border-primary/60 hover:bg-primary/10"
                      >
                        Get Started
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </div>
                </Card3D>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <GlowDivider className="max-w-4xl mx-auto mb-12" />

          {/* CTA Section */}
          <AnimatedSection>
            <Card3D className="max-w-3xl mx-auto">
              <div className="p-4 md:p-8 text-center">
                <ShineHeading 
                  as="h2"
                  className="text-2xl md:text-3xl font-heading font-semibold mb-4"
                >
                  Ready to Start Your Project?
                </ShineHeading>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Let's discuss your requirements and find the perfect solution for your needs. 
                  Get a custom quote tailored to your project.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/get-started">
                    <Button className="btn-primary px-8">
                      View Pricing
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                  <Link to="/contact">
                    <Button variant="outline" className="border-primary/30 hover:border-primary/60 px-8">
                      Contact Me
                    </Button>
                  </Link>
                </div>
              </div>
            </Card3D>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
