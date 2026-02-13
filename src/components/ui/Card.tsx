'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-gradient-to-br from-white to-[#FBF3EA]
        rounded-clay-lg p-5
        shadow-clay
        ${onClick ? 'cursor-pointer active:translate-y-[2px] active:scale-[0.98] transition-transform' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
