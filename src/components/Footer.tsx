import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Github, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import { GlowDivider } from "./GlowDivider";

const socialLinks = [
  { icon: Github, href: "https://github.com", label: "GitHub" },
  { icon: Linkedin, href: "https://linkedin.com", label: "LinkedIn" },
  { icon: Mail, href: "mailto:montasirmahamud336@gmail.com", label: "Email" },
];

const footerLinks = [
  {
    title: "Navigation",
    links: [
      { name: "Home", path: "/" },
      { name: "About", path: "/about" },
      { name: "Portfolio", path: "/portfolio" },
      { name: "Reviews", path: "/reviews" },
    ],
  },
  {
    title: "Services",
    links: [
      { name: "AutoCAD Drawings", path: "/services/engineering-drawings" },
      { name: "Web Development", path: "/services/web-development" },
      { name: "Video Editing", path: "/services/video-editing" },
      { name: "Graphic Design", path: "/services/graphic-design" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border/50">
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center, hsl(var(--primary) / 0.15), transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      <div className="container mx-auto px-4 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="space-y-4">
            <Link to="/" className="inline-block">
              <div className="font-heading font-bold">
                <span className="text-2xl gradient-text text-glow">Muntasir</span>
                <span className="text-2xl text-foreground ml-1">Mahmud</span>
              </div>
            </Link>
            <p className="text-muted-foreground text-sm leading-relaxed">
              Technical freelancer specializing in engineering drawings, web development, and creative design solutions.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:border-primary/50 hover:glow-sm transition-all"
                >
                  <social.icon className="w-4 h-4 text-muted-foreground hover:text-primary" />
                </motion.a>
              ))}
            </div>
          </div>

          {footerLinks.map((section) => (
            <div key={section.title} className="space-y-4">
              <h4 className="font-heading font-semibold text-foreground text-glow">
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      to={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors link-underline"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div className="space-y-4">
            <h4 className="font-heading font-semibold text-foreground text-glow">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-4 h-4 text-primary" />
                <span>01924733432</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:montasirmahamud336@gmail.com" className="hover:text-primary transition-colors">
                  montasirmahamud336@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-4 h-4 text-primary mt-0.5" />
                <span>Rangpur, Bangladesh</span>
              </li>
            </ul>
          </div>
        </div>

        <GlowDivider className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            (c) {new Date().getFullYear()} Muhammad Muntasir Mahmud. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Contact
            </Link>
            <Link to="/get-started" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
