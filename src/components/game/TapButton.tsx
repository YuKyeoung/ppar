'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface TapButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: ReactNode;
}

export default function TapButton({
  children,
  disabled,
  className = '',
  ...props
}: TapButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      disabled={disabled}
      className={`w-full py-4 rounded-clay border-none font-display font-black text-lg bg-gradient-to-br from-accent to-[#FF9F5F] text-white shadow-clay-accent cursor-pointer disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}
