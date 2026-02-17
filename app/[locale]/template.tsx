"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ReactNode } from "react";

const smoothEase = [0.22, 1, 0.36, 1] as const;

export default function PageTransitionTemplate({ children }: { children: ReactNode }) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: smoothEase }}
    >
      {children}
    </motion.div>
  );
}
