import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, Code, Palette, Video, Settings } from "lucide-react";
import { Layout } from "@/components/Layout";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D } from "@/components/Card3D";
import heroBg from "@/assets/hero-bg.jpg";

const services = [
  {
    icon: Settings,
    title: "Engineering Drawings",
    description: "Professional AutoCAD drawings including PFD, P&ID, and GA.",
    color: "from-rose-600 to-red-500",
    path: "/services/engineering-drawings",
  },
  {
    icon: Code,
    title: "Web Development",
    description: "Modern websites using HTML, CSS, and WordPress.",
    color: "from-red-700 to-orange-500",
    path: "/services/web-development",
  },
  {
    icon: Palette,
    title: "Graphic Design",
    description: "Eye-catching flyers and marketing materials.",
    color: "from-amber-600 to-orange-500",
    path: "/services/graphic-design",
  },
  {
    icon: Video,
    title: "Video Editing",
    description: "Professional video editing with Canva and CapCut.",
    color: "from-stone-700 to-zinc-600",
    path: "/services/video-editing",
  },
];

const stats = [
  { value: "50+", label: "Projects Completed" },
  { value: "30+", label: "Happy Clients" },
  { value: "5+", label: "Years Experience" },
  { value: "100%", label: "Satisfaction" },
];

// Floating shapes for hero
const FloatingShape = ({ delay, duration, className }: { delay: number; duration: number; className: string }) => (
  <motion.div
    animate={{
      y: [0, -30, 0],
      rotate: [0, 180, 360],
      scale: [1, 1.1, 1],
    }}
    transition={{
      duration,
      delay,
      repeat: Infinity,
      ease: "easeInOut",
    }}
    className={`absolute pointer-events-none ${className}`}
  >
    <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 backdrop-blur-sm border border-primary/10" />
  </motion.div>
);

export default function Home() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0">
          <img
            src={heroBg}
            alt=""
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
        </div>

        {/* Floating 3D Shapes */}
        <FloatingShape delay={0} duration={8} className="top-1/4 left-[10%] w-20 h-20" />
        <FloatingShape delay={1} duration={10} className="top-1/3 right-[15%] w-16 h-16" />
        <FloatingShape delay={2} duration={9} className="bottom-1/3 left-[20%] w-24 h-24" />
        <FloatingShape delay={0.5} duration={11} className="bottom-1/4 right-[10%] w-14 h-14" />
        <FloatingShape delay={1.5} duration={7} className="top-1/2 left-[5%] w-12 h-12" />

        {/* Animated Glow Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 8, repeat: Infinity }}
            className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.3), transparent 70%)",
              filter: "blur(60px)",
            }}
          />
          <motion.div
            animate={{
              scale: [1.3, 1, 1.3],
              opacity: [0.15, 0.3, 0.15],
            }}
            transition={{ duration: 10, repeat: Infinity, delay: 2 }}
            className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full"
            style={{
              background: "radial-gradient(circle, hsl(var(--primary) / 0.25), transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass text-sm text-primary glow-sm mb-8">
                <Sparkles className="w-4 h-4" />
                Available for Freelance Work
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight text-3d"
            >
              Hi, I'm{" "}
              <span className="gradient-text">Muhammad Muntasir Mahmud</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
            >
              Technical & Creative Freelancer from Rangpur, Bangladesh.
              Specializing in engineering drawings, web development, and creative design solutions.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link to="/portfolio">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-primary inline-flex items-center gap-2 justify-center h-14 px-8 w-full sm:w-auto"
                >
                  View My Work
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="btn-outline inline-flex items-center justify-center h-14 px-8 w-full sm:w-auto"
                >
                  Contact Me
                </motion.button>
              </Link>
            </motion.div>
          </div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2"
          >
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-6 h-10 rounded-full border-2 border-primary/50 flex items-start justify-center p-2 glow-sm"
            >
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-primary"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      <GlowDivider className="max-w-6xl mx-auto" />

      {/* Services Section */}
      <section className="section">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="section-title-3d">
              What I <span className="gradient-text">Offer</span>
            </h2>
            <p className="section-subtitle mx-auto">
              Comprehensive technical and creative solutions tailored to your needs.
            </p>
          </AnimatedSection>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <StaggerItem key={index}>
                <Link to={service.path} className="block perspective h-full">
                  <Card3D className="h-full">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center mb-4`}>
                      <service.icon className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-xl font-heading font-semibold mb-2">
                      {service.title}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      {service.description}
                    </p>
                    <span className="text-primary text-sm font-medium inline-flex items-center gap-1">
                      Learn More <ArrowRight className="w-3 h-3" />
                    </span>
                  </Card3D>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <GlowDivider className="max-w-4xl mx-auto" />

      {/* Stats Section */}
      <section className="section">
        <div className="container mx-auto">
          <StaggerContainer className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <StaggerItem key={index} className="text-center">
                <motion.div
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  className="card-3d"
                >
                  <div className="text-4xl md:text-5xl font-heading font-bold gradient-text text-3d mb-2">
                    {stat.value}
                  </div>
                  <div className="text-muted-foreground text-sm">
                    {stat.label}
                  </div>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      <GlowDivider className="max-w-4xl mx-auto" />

      {/* CTA Section */}
      <section className="section">
        <div className="container mx-auto">
          <AnimatedSection>
            <div className="perspective">
              <Card3D className="p-12 md:p-16 text-center">
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4 text-3d">
                  Ready to Start Your <span className="gradient-text">Project?</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
                  Let's work together to bring your ideas to life. Get in touch today!
                </p>
              <Link to="/get-started">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="btn-primary inline-flex items-center gap-2"
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </Card3D>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </Layout>
  );
}
