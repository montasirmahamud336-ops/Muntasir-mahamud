import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { AnimatedSection, StaggerContainer, StaggerItem } from "@/components/AnimatedSection";
import { GlowDivider } from "@/components/GlowDivider";
import { Card3D } from "@/components/Card3D";
import { MapPin, Mail, Phone, Download, Code, Palette, Video, Settings, Cpu, Globe } from "lucide-react";

const skills = [
  { name: "AutoCAD (PFD, P&ID, GA)", level: 95, icon: Settings, color: "from-rose-600 to-red-500" },
  { name: "HTML, CSS, WordPress", level: 90, icon: Globe, color: "from-red-700 to-orange-500" },
  { name: "Python & AI Tools", level: 75, icon: Cpu, color: "from-stone-700 to-zinc-600" },
  { name: "Canva Flyer Design", level: 88, icon: Palette, color: "from-amber-600 to-orange-500" },
  { name: "Video Editing (Canva, CapCut)", level: 85, icon: Video, color: "from-zinc-700 to-stone-600" },
  { name: "Web Development", level: 82, icon: Code, color: "from-red-600 to-amber-500" },
];

const timeline = [
  {
    year: "2024",
    title: "Senior Freelancer",
    description: "Expanded services to include AI-assisted tool development and advanced video editing.",
  },
  {
    year: "2023",
    title: "Web Development",
    description: "Started offering WordPress and custom website development services.",
  },
  {
    year: "2022",
    title: "Graphic Design",
    description: "Added Canva design and video editing to my skill set.",
  },
  {
    year: "2020",
    title: "Engineering Drawings",
    description: "Started professional career with AutoCAD engineering drawings.",
  },
];

export default function About() {
  return (
    <Layout>
      {/* Hero Section - Two Column Layout */}
      <section className="section pt-32">
        <div className="container mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            {/* Left Column - Profile Card */}
            <AnimatedSection direction="left" className="lg:sticky lg:top-32">
              <div className="perspective">
                <Card3D className="h-full">
                  <div className="text-center lg:text-left">
                    {/* Profile Image Area */}
                    <div className="relative w-48 h-48 mx-auto lg:mx-0 mb-6">
                      <div className="w-full h-full rounded-2xl bg-gradient-to-br from-primary/30 to-primary/5 flex items-center justify-center overflow-hidden">
                        <span className="text-6xl font-heading font-bold gradient-text text-3d">
                          MM
                        </span>
                      </div>
                      {/* Floating badge */}
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 3, repeat: Infinity }}
                        className="absolute -bottom-3 -right-3 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-medium glow-sm"
                      >
                        Available
                      </motion.div>
                    </div>

                    <h2 className="text-2xl font-heading font-bold mb-2">
                      Muhammad Muntasir
                    </h2>
                    <p className="text-primary font-medium mb-4">Mahmud</p>
                    
                    <GlowDivider className="my-6" />

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <MapPin className="w-5 h-5 text-primary" />
                        </div>
                        <span>Rangpur, Bangladesh</span>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Mail className="w-5 h-5 text-primary" />
                        </div>
                        <a href="mailto:montasirmahamud336@gmail.com" className="hover:text-primary transition-colors text-sm">
                          montasirmahamud336@gmail.com
                        </a>
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Phone className="w-5 h-5 text-primary" />
                        </div>
                        <span>01924733432</span>
                      </div>
                    </div>

                    <Link to="/contact">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="btn-primary w-full mt-6 inline-flex items-center justify-center gap-2"
                        type="button"
                      >
                        <Download className="w-4 h-4" />
                        Request CV
                      </motion.button>
                    </Link>
                  </div>
                </Card3D>
              </div>
            </AnimatedSection>

            {/* Right Column - Description & Skills */}
            <AnimatedSection direction="right" delay={0.2}>
              <div className="space-y-8">
                <div>
                  <span className="text-primary font-medium mb-4 block text-glow">About Me</span>
                  <h1 className="text-4xl md:text-5xl font-heading font-bold mb-6 text-3d">
                    Technical & Creative{" "}
                    <span className="gradient-text">Freelancer</span>
                  </h1>
                  <p className="text-muted-foreground text-lg mb-6 leading-relaxed">
                    I'm a technical and creative freelancer based in Rangpur, Bangladesh. 
                    With a passion for precision and creativity, I specialize in delivering 
                    high-quality engineering drawings, web development solutions, and 
                    eye-catching graphic designs.
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    My diverse skill set allows me to bridge the gap between technical 
                    requirements and creative execution, ensuring every project exceeds 
                    expectations.
                  </p>
                </div>

                <GlowDivider className="my-8" />

                {/* Skills Grid */}
                <div>
                  <h3 className="text-2xl font-heading font-bold mb-6 text-glow">
                    My Skills
                  </h3>
                  <div className="grid gap-4">
                    {skills.map((skill, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="card-3d"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${skill.color} flex items-center justify-center`}>
                            <skill.icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-medium">{skill.name}</span>
                              <span className="text-primary font-bold text-glow">{skill.level}%</span>
                            </div>
                            <div className="skill-bar">
                              <motion.div
                                initial={{ width: 0 }}
                                whileInView={{ width: `${skill.level}%` }}
                                transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
                                viewport={{ once: true }}
                                className="skill-bar-fill"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>

      <GlowDivider className="max-w-4xl mx-auto" />

      {/* Timeline Section */}
      <section className="section">
        <div className="container mx-auto">
          <AnimatedSection className="text-center mb-16">
            <h2 className="section-title-3d">
              My <span className="gradient-text">Journey</span>
            </h2>
            <p className="section-subtitle mx-auto">
              The path that led me to where I am today.
            </p>
          </AnimatedSection>

          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              {timeline.map((item, index) => (
                <AnimatedSection key={index} delay={index * 0.15}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="card-3d relative overflow-hidden"
                  >
                    {/* Glow accent */}
                    <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-primary to-primary/30 glow-sm" />
                    
                    <div className="pl-4">
                      <span className="text-primary font-bold text-xl text-glow">
                        {item.year}
                      </span>
                      <h3 className="text-xl font-heading font-semibold mt-2 mb-3">
                        {item.title}
                      </h3>
                      <p className="text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
