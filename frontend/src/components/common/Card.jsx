import React from 'react';
import { motion } from 'framer-motion';

/**
 * Komponen Reusable Glassmorphism Card Container
 * Mewakili tampilan kartu statistik dashboard dan kontainer modul.
 */
export const Card = ({ children, className = '', hover = true, ...props }) => {
  return (
    <motion.div
      whileHover={hover ? { y: -3, transition: { duration: 0.2 } } : {}}
      className={`glass-panel rounded-2xl p-6 shadow-sm border border-slate-200/80 dark:border-slate-800/80 transition-all ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
};
