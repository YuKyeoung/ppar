'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

export default function JoinCodeEntry() {
  const router = useRouter();
  const [code, setCode] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 6);
    setCode(value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length === 6) {
      router.push(`/join/${code}`);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-dvh px-5 py-6 bg-gradient-to-b from-cream to-coffee-100">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="flex flex-col items-center mt-20 mb-10"
      >
        <h1 className="font-display font-black text-[28px] text-coffee-800">
          방 코드 입력
        </h1>
        <p className="font-display font-bold text-base text-coffee-500 mt-2">
          친구에게 받은 코드를 입력하세요
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15, ease: 'easeOut' }}
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-6 w-full max-w-sm"
      >
        <input
          type="text"
          value={code}
          onChange={handleChange}
          placeholder="CAFE42"
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          maxLength={6}
          className="
            w-full py-5 px-4 rounded-clay border-none
            font-mono font-black text-[32px] text-center text-coffee-800
            tracking-[0.4em] uppercase
            bg-gradient-to-br from-coffee-100 to-cream
            shadow-clay-inset outline-none
            focus:ring-[3px] focus:ring-coffee-500/15
            placeholder:text-coffee-300 placeholder:tracking-[0.3em]
          "
        />

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: code.length === 6 ? 1 : 0.4 }}
          transition={{ duration: 0.2 }}
          className="w-full"
        >
          <Button
            variant="primary"
            type="submit"
            disabled={code.length !== 6}
          >
            입장하기
          </Button>
        </motion.div>
      </motion.form>

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        whileTap={{ y: 2 }}
        onClick={() => router.push('/')}
        className="
          mt-8 font-display font-bold text-sm text-coffee-400
          bg-transparent border-none cursor-pointer
        "
      >
        홈으로 돌아가기
      </motion.button>
    </div>
  );
}
