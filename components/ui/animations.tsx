"use client";

import { motion, HTMLMotionProps, Variants, useInView, useReducedMotion } from "framer-motion";
import { ReactNode, useRef } from "react";

// ================================================================
// EASING CURVES
// ================================================================

export const smoothEase = [0.22, 1, 0.36, 1] as const;

// ================================================================
// ANIMATION VARIANTS (used internally by components)
// ================================================================

const fadeInUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: smoothEase },
  },
};

const cardItem: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: smoothEase },
  },
};

// ================================================================
// HOVER CONFIGS (used by MotionCard)
// ================================================================

// Tier 1 – Micro: filter buttons, tabs, small interactive elements
const hoverScale = {
  scale: 1.015,
  transition: { duration: 0.2, ease: smoothEase },
};

// Tier 2 – Card: content cards, list items
const hoverLift = {
  y: -4,
  transition: { duration: 0.25, ease: smoothEase },
};

const tapScale = {
  scale: 0.985,
  transition: { duration: 0.1 },
};

// Tier 2 variant – Card with subtle scale
const hoverCard = {
  y: -4,
  scale: 1.02,
  transition: { duration: 0.3, ease: smoothEase },
};

// ================================================================
// COMPONENTS
// ================================================================

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

// MotionCard with built-in hover effects
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
        return { whileHover: hoverCard, whileTap: tapScale };
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

// AnimatedCollapse for accordion/collapse with smooth height animation
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

// Re-export motion and AnimatePresence for convenience
export { motion, AnimatePresence } from "framer-motion";
