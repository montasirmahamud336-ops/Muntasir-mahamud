import { motion } from "framer-motion";
import { ReactNode, MouseEventHandler, useEffect, useState } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  isSelected?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

export function Card3D({ children, className = "", isSelected = false, onClick }: Card3DProps) {
  const [enableHoverFx, setEnableHoverFx] = useState(false);

  useEffect(() => {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    setEnableHoverFx(canHover);
  }, []);

  return (
    <motion.div
      className={`card-3d ${isSelected ? "ring-1 ring-primary/50" : ""} ${className}`}
      onClick={onClick}
      whileHover={enableHoverFx ? { y: -3, rotateX: 1.4, rotateY: -1.4 } : undefined}
      whileTap={enableHoverFx ? { scale: 0.995 } : undefined}
      transition={{ duration: 0.24, ease: "easeOut" }}
      style={{ transformStyle: "preserve-3d" }}
    >
      {/* Selected state indicator */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pointer-events-none absolute -inset-1 rounded-2xl bg-primary/15 blur-lg -z-10"
        />
      )}
      {children}
    </motion.div>
  );
}

// Component for glowing text effect on headings
export function GlowText({ 
  children, 
  className = "",
  as: Component = "span" 
}: { 
  children: ReactNode; 
  className?: string;
  as?: keyof JSX.IntrinsicElements;
}) {
  return (
    <Component 
      className={`relative inline-block ${className}`}
      style={{
        textShadow: `
          0 0 10px hsl(var(--primary) / 0.5),
          0 0 20px hsl(var(--primary) / 0.3),
          0 0 40px hsl(var(--primary) / 0.2)
        `,
      }}
    >
      {children}
    </Component>
  );
}

// Heading with subtle shine effect
export function ShineHeading({ 
  children, 
  className = "",
  as: Component = "h3" 
}: { 
  children: ReactNode; 
  className?: string;
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}) {
  return (
    <Component 
      className={`relative ${className}`}
      style={{
        textShadow: `
          0 0 15px hsl(var(--primary) / 0.4),
          0 2px 4px hsl(var(--background) / 0.6)
        `,
      }}
    >
      {children}
    </Component>
  );
}
