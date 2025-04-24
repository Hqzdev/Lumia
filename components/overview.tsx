'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

const waveText = "help you?".split("");

export const Overview = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Фиксированные размеры текста для мобильных и десктопа
  const headingSize = isMobile ? 'text-2xl' : 'text-xl';
  // Для мобильных увеличиваем help you, для ПК — обычный размер
  const waveSize = isMobile ? 'text-[40px] sm:text-[48px] md:text-[56px]' : 'text-[40px] md:text-[48px] lg:text-[56px]';

  return (
    <motion.div
      key="overview"
      className="max-w-3xl md:mt-10 px-4 md:px-0 mx-auto"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="rounded-xl p-6 flex flex-col gap-8 leading-relaxed items-center">
        <h2 className={`${headingSize} font-bold mt-[75px] flex flex-col items-center`}>
          {/* Первая строка — заголовок */}
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className={isMobile ? 'text-[32px] text-center ' : 'text-[50px] text-center'}
          >
            How can I
          </motion.span>
          <br />

          {/* help you: для пк — серый цвет без анимации, для телефона — увеличен и с анимацией */}
          <div
            className={`flex gap-[1px] ${waveSize} font-semibold justify-center`}
          >
            {isMobile ? (
              // Мобильная версия: увеличенный размер и анимация
              waveText.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ color: '#fff' }}
                  animate={{
                    color: [
                      '#fff',
                      'rgb(0, 0, 0)', // gray-600
                      '#fff',
                    ],
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.15,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'linear',
                  }}
                  className="bg-clip-text text-transparent"
                  style={{ WebkitTextStroke: '0.5px #fff' }}
                >
                  {char}
                </motion.span>
              ))
            ) : (
              // ПК: серый цвет, без анимации
              waveText.map((char, i) => (
                <span
                  key={i}
                  className="text-black"
                  style={{ WebkitTextStroke: '0.5px #fff' }}
                >
                  {char}
                </span>
              ))
            )}
          </div>
        </h2>
      </div>
    </motion.div>
  );
};
