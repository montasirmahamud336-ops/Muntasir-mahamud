import { motion } from "framer-motion";

interface GlowDividerProps {
  className?: string;
  variant?: "horizontal" | "vertical";
}

export function GlowDivider({ className = "", variant = "horizontal" }: GlowDividerProps) {
  if (variant === "vertical") {
    return (
      <div className={`relative w-px h-full ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/50 to-transparent" />
        <motion.div
          className="absolute inset-0 bg-gradient-to-b from-transparent via-primary to-transparent blur-sm"
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    );
  }

  return (
    <div className={`relative w-full h-px ${className}`}>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-primary to-transparent blur-sm"
        animate={{
          opacity: [0.3, 0.7, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
