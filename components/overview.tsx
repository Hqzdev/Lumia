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
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ delay: 0.6 }}
        className="text-4xl text-zinc-500 text-center"
      >
        <style jsx>{`
          .wave {
            animation-name: wave-animation;
            animation-duration: 2.1s;
            animation-iteration-count: infinite;
            transform-origin: 70% 70%;
            display: inline-block;
            font-size: 2.5em;
          }

          @keyframes wave-animation {
            0% { transform: rotate(0deg); }
            10% { transform: rotate(14deg); }
            20% { transform: rotate(-8deg); }
            30% { transform: rotate(14deg); }
            40% { transform: rotate(-4deg); }
            50% { transform: rotate(10deg); }
            60% { transform: rotate(0deg); }
            100% { transform: rotate(0deg); }
          }
        `}</style>
        <div className="space-y-8">
          <div>
            <span className="md-3 text-3xl md:text-4xl lg:text-5xl font-semibold">Hi, There!{" "}</span>
            <span
              className="wave"
              role="img"
              aria-label="wave"
            >
              👋🏻
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
