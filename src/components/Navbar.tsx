import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ChevronDown, LogOut } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { 
  PenTool, 
  Code, 
  Palette, 
  Video, 
} from "lucide-react";

const navLinks = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services", hasDropdown: true },
  { name: "Portfolio", path: "/portfolio" },
  { name: "Reviews", path: "/reviews" },
  { name: "Contact", path: "/contact" },
  { name: "Get Started", path: "/get-started" },
];

const serviceItems = [
  { name: "Engineering Drawings", path: "/services/engineering-drawings", icon: PenTool },
  { name: "Web Development", path: "/services/web-development", icon: Code },
  { name: "Graphic Design", path: "/services/graphic-design", icon: Palette },
  { name: "Video Editing", path: "/services/video-editing", icon: Video },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { user, signOut } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsServicesOpen(false);
  }, [location]);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsServicesOpen(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsServicesOpen(false);
    }, 150);
  };

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "py-3 backdrop-blur-xl bg-background/80 border-b border-border/50 shadow-lg shadow-primary/5"
            : "py-5 bg-transparent"
        }`}
      >
        <div className="container mx-auto px-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-lg md:text-xl font-heading font-bold"
            >
              <span className="gradient-text text-glow">Muntasir</span>
              <span className="text-foreground ml-1">Mahmud</span>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <div
                key={link.path}
                className="relative"
                onMouseEnter={link.hasDropdown ? handleMouseEnter : undefined}
                onMouseLeave={link.hasDropdown ? handleMouseLeave : undefined}
                ref={link.hasDropdown ? dropdownRef : undefined}
              >
                <Link
                  to={link.path}
                  className="relative px-4 py-2 text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
                >
                  {location.pathname === link.path && (
                    <motion.span
                      layoutId="activeNav"
                      className="absolute inset-0 rounded-lg bg-primary/10"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{link.name}</span>
                  {link.hasDropdown && (
                    <ChevronDown 
                      className={`w-4 h-4 transition-transform duration-200 ${isServicesOpen ? "rotate-180" : ""}`} 
                    />
                  )}
                </Link>

                {/* Services Dropdown */}
                {link.hasDropdown && (
                  <AnimatePresence>
                    {isServicesOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute top-full left-0 mt-2 w-64 rounded-xl overflow-hidden z-50"
                        style={{
                          background: "linear-gradient(145deg, hsl(var(--card)), hsl(var(--background)))",
                          boxShadow: `
                            0 10px 40px hsl(var(--primary) / 0.2),
                            0 4px 20px hsl(var(--background) / 0.8),
                            inset 0 1px 0 hsl(var(--primary) / 0.2)
                          `,
                          border: "1px solid hsl(var(--primary) / 0.3)",
                        }}
                      >
                        <div className="p-2">
                          {serviceItems.map((service, index) => (
                            <motion.div
                              key={service.path}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.05 }}
                            >
                              <Link
                                to={service.path}
                                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-foreground/80 hover:text-primary hover:bg-primary/10 transition-all duration-200 group"
                              >
                                <service.icon className="w-4 h-4 text-primary/70 group-hover:text-primary transition-colors" />
                                <span>{service.name}</span>
                              </Link>
                            </motion.div>
                          ))}
                        </div>
                        <div className="border-t border-primary/20 p-2">
                          <Link
                            to="/services"
                            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary hover:bg-primary/10 transition-all duration-200"
                          >
                            View All Services
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <Button
                onClick={() => signOut()}
                variant="ghost"
                className="hidden lg:flex items-center gap-2 text-sm"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </Button>
            ) : (
              <Link to="/auth" className="hidden lg:block">
                <Button className="btn-primary text-sm">Sign In</Button>
              </Link>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 pt-20 glass lg:hidden overflow-y-auto"
          >
            <div className="flex flex-col items-center gap-4 p-8">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={link.path}
                    className={`text-xl font-medium transition-colors ${
                      location.pathname === link.path
                        ? "text-primary"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: navLinks.length * 0.1 }}
              >
                <Link to="/auth">
                  <Button className="btn-primary mt-4">Sign In</Button>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
