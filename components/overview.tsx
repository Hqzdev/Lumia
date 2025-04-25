'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const waveText = 'How can I help you?'.split("");

export const Overview = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Увеличенный размер текста для приветствия
  const waveSize = isMobile
    ? 'text-[32px] sm:text-[40px] md:text-[48px]'
    : 'text-[48px] md:text-[56px] lg:text-[72px]';

  return (
    <div
      key="overview"
      className="max-w-5xl mx-auto md:mt-32 px-4 size-full flex flex-col justify-center items-center"
    >
      <div
        className={`flex gap-[2px] ${waveSize} font-extrabold justify-center mb-8`}
        style={{ lineHeight: 1.05 }}
      >
        {waveText.map((char, i) => (
          <motion.span
            key={i}
            initial={{ color: '#fff' }}
            animate={{
              color: [
                '#fff',
                'rgb(0, 0, 0)', // gray-900
                '#fff',
              ],
            }}
            transition={{
              duration: 2,
              delay: i * 0.12,
              repeat: Infinity,
              repeatType: 'loop',
              ease: 'linear',
            }}
            className="bg-clip-text text-transparent"
            style={{ WebkitTextStroke: '2px #fff' }}
          >
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        ))}
      </div>
      
    </div>
  );
};
