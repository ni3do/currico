"use client";

import { motion, HTMLMotionProps, Variants, useInView, useReducedMotion } from "framer-motion";
import { ReactNode, useRef } from "react";

// ================================================================
// PREMIUM EASING CURVES
// These create that buttery-smooth, high-quality feel
// ================================================================

// Apple-style smooth easing (ease-out with slight overshoot feel)
export const smoothEase = [0.22, 1, 0.36, 1] as const;

// Snappy micro-interaction easing
export const snappyEase = [0.34, 1.56, 0.64, 1] as const;

// Gentle deceleration for entrances
export const gentleEase = [0.25, 0.46, 0.45, 0.94] as const;

// Spring-like bounce for playful interactions
export const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

// Softer spring for larger movements
export const softSpringConfig = {
  type: "spring" as const,
  stiffness: 300,
  damping: 25,
};

// ================================================================
// ANIMATION VARIANTS
// ================================================================

export const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

export const fadeInDown: Variants = {
  hidden: { opacity: 0, y: -16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

export const fadeInLeft: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

export const fadeInRight: Variants = {
  hidden: { opacity: 0, x: 16 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4, ease: gentleEase },
  },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: smoothEase },
  },
};

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

// Card grid stagger - slightly faster for grids
export const cardGridContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.02,
    },
  },
};

// Card item variant for grid animations
export const cardItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: smoothEase },
  },
};

// Default transition settings
const defaultTransition = {
  duration: 0.4,
  ease: smoothEase,
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
  duration = 0.5,
  className = "",
  once = true,
  amount = 0.2,
  ...props
}: FadeInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });
  const prefersReducedMotion = useReducedMotion();

  // Smaller, more subtle movements
  const distance = 16;

  const variants: Variants = {
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion
        ? 0
        : direction === "up"
          ? distance
          : direction === "down"
            ? -distance
            : 0,
      x: prefersReducedMotion
        ? 0
        : direction === "left"
          ? -distance
          : direction === "right"
            ? distance
            : 0,
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
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay: prefersReducedMotion ? 0 : delay,
        ease: smoothEase,
      }}
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
  /** Use for card grids - faster stagger */
  variant?: "default" | "grid";
}

export function StaggerChildren({
  children,
  staggerDelay = 0.08,
  className = "",
  once = true,
  amount = 0.15,
  variant = "default",
  ...props
}: StaggerChildrenProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: variant === "grid" ? 0.05 : staggerDelay,
        delayChildren: 0.02,
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
  /** Card variant adds subtle scale */
  variant?: "default" | "card";
}

export function StaggerItem({
  children,
  className = "",
  variant = "default",
  ...props
}: StaggerItemProps) {
  const itemVariants: Variants = variant === "card" ? cardItem : fadeInUp;
  return (
    <motion.div variants={itemVariants} className={className} {...props}>
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
  const isInView = useInView(ref, { once, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={scaleIn}
      transition={{ duration, delay, ease: smoothEase }}
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
  distance = 30,
  ...props
}: SlideInProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

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
      transition={{ duration, delay, ease: smoothEase }}
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
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.25, ease: smoothEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ================================================================
// PREMIUM HOVER ANIMATIONS
// Subtle, smooth interactions that feel luxurious
// ================================================================

export const hoverScale = {
  scale: 1.015,
  transition: { duration: 0.25, ease: smoothEase },
};

export const hoverLift = {
  y: -3,
  transition: { duration: 0.25, ease: smoothEase },
};

export const tapScale = {
  scale: 0.985,
  transition: { duration: 0.1 },
};

// Premium card hover with shadow
export const hoverCard = {
  y: -4,
  scale: 1.01,
  transition: { duration: 0.3, ease: smoothEase },
};

// Subtle glow effect for buttons
export const hoverGlow = {
  scale: 1.02,
  y: -2,
  transition: { duration: 0.2, ease: smoothEase },
};

// Motion card with built-in hover effects
interface MotionCardProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
  hoverEffect?: "scale" | "lift" | "both" | "none" | "premium";
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
          whileHover: { scale: 1.015, y: -3, transition: { duration: 0.25, ease: smoothEase } },
          whileTap: tapScale,
        };
      case "premium":
        return {
          whileHover: hoverCard,
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
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: smoothEase }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Animated button wrapper with premium feel
interface AnimatedButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "bouncy";
}

export function AnimatedButton({
  children,
  className = "",
  variant = "default",
  ...props
}: AnimatedButtonProps) {
  const getVariantProps = () => {
    switch (variant) {
      case "subtle":
        return {
          whileHover: { scale: 1.01, transition: { duration: 0.2, ease: smoothEase } },
          whileTap: { scale: 0.99, transition: { duration: 0.1 } },
        };
      case "bouncy":
        return {
          whileHover: { scale: 1.03, y: -2, transition: springConfig },
          whileTap: { scale: 0.97, transition: { duration: 0.1 } },
        };
      default:
        return {
          whileHover: { scale: 1.02, y: -1, transition: { duration: 0.2, ease: smoothEase } },
          whileTap: { scale: 0.98, transition: { duration: 0.1 } },
        };
    }
  };

  return (
    <motion.button {...getVariantProps()} className={className} {...props}>
      {children}
    </motion.button>
  );
}

// Animated accordion/collapse with smooth height animation
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
      transition={{ duration: 0.35, ease: smoothEase }}
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
      transition={{ duration: 0.25, ease: gentleEase }}
      onClick={onClick}
      className={className}
    />
  );
}

// Animated modal content with premium entrance
interface AnimatedModalProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedModal({ children, className = "" }: AnimatedModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96, y: 16 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96, y: 16 }}
      transition={{ duration: 0.25, ease: smoothEase }}
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
  duration = 4,
  y = 8,
}: {
  children: ReactNode;
  className?: string;
  duration?: number;
  y?: number;
}) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      animate={
        prefersReducedMotion
          ? {}
          : {
              y: [0, -y, 0],
            }
      }
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

// Pulse animation for attention (more subtle)
export function PulseElement({
  children,
  className = "",
  intensity = "subtle",
}: {
  children: ReactNode;
  className?: string;
  intensity?: "subtle" | "medium" | "strong";
}) {
  const prefersReducedMotion = useReducedMotion();
  const scaleMap = {
    subtle: [1, 1.02, 1],
    medium: [1, 1.04, 1],
    strong: [1, 1.06, 1],
  };

  return (
    <motion.div
      animate={
        prefersReducedMotion
          ? {}
          : {
              scale: scaleMap[intensity],
            }
      }
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Shimmer loading effect (smoother)
export function ShimmerEffect({ className = "" }: { className?: string }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return (
      <div
        className={`bg-gradient-to-r from-transparent via-white/15 to-transparent ${className}`}
      />
    );
  }

  return (
    <motion.div
      className={`bg-gradient-to-r from-transparent via-white/15 to-transparent ${className}`}
      animate={{
        x: ["-100%", "100%"],
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: "linear",
      }}
    />
  );
}

// Counter animation for numbers
interface AnimatedCounterProps {
  value: number;
  className?: string;
}

export function AnimatedCounter({ value, className = "" }: AnimatedCounterProps) {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: smoothEase }}
      className={className}
    >
      {value}
    </motion.span>
  );
}

// ================================================================
// LINK/NAV HOVER ANIMATION
// For navigation items with underline effect
// ================================================================

interface AnimatedLinkProps extends HTMLMotionProps<"span"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedLink({ children, className = "", ...props }: AnimatedLinkProps) {
  return (
    <motion.span className={`relative inline-block ${className}`} whileHover="hover" {...props}>
      {children}
      <motion.span
        className="absolute bottom-0 left-0 h-0.5 bg-current"
        initial={{ width: "0%" }}
        variants={{
          hover: { width: "100%", transition: { duration: 0.25, ease: smoothEase } },
        }}
      />
    </motion.span>
  );
}

// ================================================================
// IMAGE HOVER EFFECT
// For cards with image zoom on hover
// ================================================================

interface AnimatedImageContainerProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedImageContainer({
  children,
  className = "",
  ...props
}: AnimatedImageContainerProps) {
  return (
    <motion.div className={`overflow-hidden ${className}`} whileHover="hover" {...props}>
      <motion.div
        variants={{
          hover: { scale: 1.04, transition: { duration: 0.4, ease: smoothEase } },
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

// ================================================================
// ICON BUTTON ANIMATION
// For icon-only buttons (like hearts, close buttons)
// ================================================================

interface AnimatedIconButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedIconButton({
  children,
  className = "",
  ...props
}: AnimatedIconButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1, transition: { duration: 0.2, ease: smoothEase } }}
      whileTap={{ scale: 0.9, transition: { duration: 0.1 } }}
      className={className}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ================================================================
// LIST ITEM ANIMATION
// For menu items, dropdown items
// ================================================================

interface AnimatedListItemProps extends HTMLMotionProps<"div"> {
  children: ReactNode;
  className?: string;
}

export function AnimatedListItem({ children, className = "", ...props }: AnimatedListItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -8 }}
      transition={{ duration: 0.2, ease: smoothEase }}
      className={className}
      {...props}
    >
      {children}
    </motion.div>
  );
}

// Re-export motion and AnimatePresence for convenience
export { motion, AnimatePresence } from "framer-motion";
