'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent';

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-gradient-to-br from-coffee-500/90 to-coffee-500 text-cream shadow-clay-primary',
  secondary:
    'bg-gradient-to-br from-white to-coffee-100 text-coffee-800 shadow-clay',
  accent:
    'bg-gradient-to-br from-[#FF9F5F] to-accent text-white shadow-clay-accent',
};

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: Variant;
  children: ReactNode;
  fullWidth?: boolean;
}

export default function Button({
  variant = 'primary',
  children,
  fullWidth = true,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileTap={{ y: 3, scale: 0.98 }}
      disabled={disabled}
      className={`
        font-display font-black text-[17px] py-[18px] px-8
        rounded-clay border-none cursor-pointer text-center
        transition-colors
        ${variantStyles[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </motion.button>
  );
}
