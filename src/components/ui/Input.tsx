'use client';

import { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export default function Input({ className = '', ...props }: InputProps) {
  return (
    <input
      className={`
        w-full py-4 px-5 rounded-[16px] border-none
        font-display font-bold text-base text-coffee-800
        bg-gradient-to-br from-coffee-100 to-cream
        shadow-clay-inset outline-none
        focus:ring-[3px] focus:ring-coffee-500/15
        placeholder:text-coffee-400
        ${className}
      `}
      {...props}
    />
  );
}
