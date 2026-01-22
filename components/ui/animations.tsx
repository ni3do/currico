"use client";

import { motion, HTMLMotionProps, Variants, useInView } from "framer-motion";
import { ReactNode, useRef } from "react";

// Animation variants for reuse
export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0 },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Default transition settings
const defaultTransition = {
  duration: 0.4,
  ease: [0.25, 0.1, 0.25, 1] as const, // Custom easing for smooth feel
};

// FadeIn component with scroll trigger
interface FadeInProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function FadeIn({
  children,
  direction = "up",
  delay = 0,
  duration = 0.4,
  className = "",
  once = true,
  amount = 0.3,
  ...props
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const variants: Variants = {
    hidden: {
      opacity: 0,
      y: direction === "up" ? 20 : direction === "down" ? -20 : 0,
      x: direction === "left" ? -20 : direction === "right" ? 20 : 0,
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ ...defaultTransition, duration, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// StaggerChildren component for animating lists
interface StaggerChildrenProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  once?: boolean;
  amount?: number;
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className = "",
  once = true,
  amount = 0.2,
  ...props
}: StaggerChildrenProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// StaggerItem component for use inside StaggerChildren
interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = "", ...props }: StaggerItemProps) {
  return (
    <motion.div variants={fadeInUp} className={className} {...props}>
      {children}
    </motion.div>
  );
}

// ScaleIn component for pop effects
interface ScaleInProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

export function ScaleIn({
  children,
  delay = 0,
  duration = 0.4,
  className = "",
  once = true,
  ...props
}: ScaleInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleIn}
      transition={{ ...defaultTransition, duration, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// SlideIn component for sliding animations
interface SlideInProps extends Omit<HTMLMotionProps<"div">, "variants"> {
  children: ReactNode;
  direction?: "left" | "right" | "up" | "down";
  delay?: number;
  duration?: number;
  className?: string;
  once?: boolean;
  distance?: number;
}

export function SlideIn({
  children,
  direction = "left",
  delay = 0,
  duration = 0.5,
  className = "",
  once = true,
  distance = 50,
  ...props
}: SlideInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  const variants: Variants = {
    hidden: {
      opacity: 0,
      x: direction === "left" ? -distance : direction === "right" ? distance : 0,
      y: direction === "up" ? distance : direction === "down" ? -distance : 0,
    },
    visible: {
      opacity: 1,
      x: 0,
      y: 0,
    },
  };

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants}
      transition={{ ...defaultTransition, duration, delay }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// AnimatedTabs component for tab switching
interface AnimatedTabsProps {
  children: ReactNode;
  activeTab: string | number;
  className?: string;
}

export function AnimatedTabContent({ children, activeTab, className = "" }: AnimatedTabsProps) {
  return (
    <motion.div
      key={activeTab}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Hover animations for cards and interactive elements
export const hoverScale = {
  scale: 1.02,
  transition: { duration: 0.2 },
};

export const hoverLift = {
  y: -4,
  transition: { duration: 0.2 },
};

export const tapScale = {
  scale: 0.98,
};

// Motion card with built-in hover effects
interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hoverEffect?: "scale" | "lift" | "both" | "none";
}

export function MotionCard({
  children,
  className = "",
  hoverEffect = "lift",
  ...props
}: MotionCardProps) {
  const getHoverProps = () => {
    switch (hoverEffect) {
      case "scale":
        return { whileHover: hoverScale, whileTap: tapScale };
      case "lift":
        return { whileHover: hoverLift, whileTap: tapScale };
      case "both":
        return {
          whileHover: { ...hoverScale, ...hoverLift },
          whileTap: tapScale,
        };
      default:
        return {};
    }
  };

  return (
    <motion.div className={className} {...getHoverProps()} {...props}>
      {children}
    </motion.div>
  );
}

// Page transition wrapper
interface PageTransitionProps {
  children: ReactNode;
  className?: string;
}

export function PageTransition({ children, className = "" }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated button wrapper
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedButton({ children, className = "", ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.15 }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// Animated accordion/collapse
interface AnimatedCollapseProps {
  isOpen: boolean;
  children: ReactNode;
  className?: string;
}

export function AnimatedCollapse({ isOpen, children, className = "" }: AnimatedCollapseProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        height: isOpen ? "auto" : 0,
        opacity: isOpen ? 1 : 0,
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={`overflow-hidden ${className}`}
    >
      {children}
    </motion.div>
  );
}

// Animated modal/dialog backdrop
interface AnimatedBackdropProps {
  isOpen: boolean;
  onClick?: () => void;
  className?: string;
}

export function AnimatedBackdrop({ isOpen, onClick, className = "" }: AnimatedBackdropProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={className}
    />
  );
}

// Animated modal content
interface AnimatedModalProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedModal({ children, className = "" }: AnimatedModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 20 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating animation for decorative elements
export function FloatingElement({
  children,
  className = "",
  duration = 3,
  y = 10,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  y?: number;
}) {
  return (
    <motion.div
      animate={{
        y: [0, -y, 0],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Pulse animation for attention
export function PulseElement({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Shimmer loading effect
export function ShimmerEffect({ className = "" }: { className?: string }) {
  return (
    <motion.div
      className={`bg-gradient-to-r from-transparent via-white/20 to-transparent ${className}`}
      animate={{
        x: ["-100%", "100%"],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Counter animation for numbers
interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
}

export function AnimatedCounter({ value, duration = 1, className = "" }: AnimatedCounterProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

// Re-export motion for convenience
export { motion, AnimatePresence } from "framer-motion";
