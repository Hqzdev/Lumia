'use client';

import { useEffect, useState, useRef } from 'react';

// Фразы с выделением слов в <>
const phrases = [
  'How can I assist you?',
  'What are you curious about?',
  "Ask me anything, I'm ready!",
  'Need help with something?',
  "What's on your mind?",
  'Looking for advice?',
  'How can I support you?',
  'What can I do for you?',
  'Ready when you are!',
  "Let's find the answer together!",
  'Made by HT',
];

export const Overview = ({ nickname }: { nickname?: string }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  // Оптимизированная проверка мобильного устройства
  useEffect(() => {
    const check = () => {
      const isMobileDevice = window.innerWidth < 768;
      setIsMobile(isMobileDevice);
    };
    check();
    // Используем debounce для resize события
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(check, 150);
    };
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
    };
  }, []);

  // Intersection Observer для остановки анимации когда компонент не виден
  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Оптимизированная анимация с использованием requestAnimationFrame
  useEffect(() => {
    if (!isVisible || isMobile) {
      // На мобильных показываем статичный текст
      if (isMobile && displayedText !== phrases[0]) {
        setDisplayedText(phrases[0]);
      }
      return;
    }

    const phrase = phrases[currentPhraseIdx];
    const TYPING_SPEED = 80; // Быстрее для лучшей производительности
    const DELETING_SPEED = 40;
    const PAUSE_AFTER_TYPING = 2000;
    const PAUSE_BETWEEN_PHRASES = 500;

    const animate = (currentTime: number) => {
      if (lastUpdateTimeRef.current === 0) {
        lastUpdateTimeRef.current = currentTime;
      }

      const deltaTime = currentTime - lastUpdateTimeRef.current;
      const speed = isDeleting ? DELETING_SPEED : TYPING_SPEED;

      if (deltaTime >= speed) {
        lastUpdateTimeRef.current = currentTime;

        if (!isDeleting && charIdx < phrase.length) {
          setDisplayedText(phrase.slice(0, charIdx + 1));
          setCharIdx(charIdx + 1);
        } else if (!isDeleting && charIdx === phrase.length) {
          // Пауза после полного вывода фразы
          if (deltaTime >= PAUSE_AFTER_TYPING) {
            setIsDeleting(true);
            lastUpdateTimeRef.current = currentTime;
          }
        } else if (isDeleting && charIdx > 0) {
          setDisplayedText(phrase.slice(0, charIdx - 1));
          setCharIdx(charIdx - 1);
        } else if (isDeleting && charIdx === 0) {
          // Следующая фраза
          if (deltaTime >= PAUSE_BETWEEN_PHRASES) {
            setIsDeleting(false);
            setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
            setCharIdx(0);
            lastUpdateTimeRef.current = currentTime;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      lastUpdateTimeRef.current = 0;
    };
  }, [charIdx, isDeleting, currentPhraseIdx, isVisible, isMobile, displayedText]);

  // Размер текста для приветствия (больше для телефона)
  const textSize = isMobile
    ? 'text-[32px] sm:text-[36px] md:text-[40px]'
    : 'text-[28px] md:text-[32px] lg:text-[40px]';

  return (
    <div
      ref={containerRef}
      key="overview"
      className="max-w-5xl mx-auto md:mt-22 px-4 size-full flex flex-col justify-center items-center"
      style={{
        // Оптимизация для мобильных - используем will-change только когда нужно
        willChange: !isMobile && isVisible ? 'transform, opacity' : 'auto',
      }}
    >
      {nickname && (
        <div
          className="mb-4 font-extrabold flex items-center justify-center"
          style={{
            fontSize: isMobile ? '2.8rem' : '2.2rem',
            lineHeight: 1.1,
            letterSpacing: '0.01em',
          }}
        >
          <span className="text-gray-600 dark:text-gray-400 mr-2">Hi,</span>
          <span
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 2px 16px #5050ff',
            }}
          >
            {nickname}
          </span>
        </div>
      )}
      {/* Фразы показываем только на desktop, на мобильных статичный текст */}
      <div
        className={`flex gap-[2px] ${textSize} font-bold justify-center mb-8`}
        style={{ lineHeight: 1.05, minHeight: 36 }}
      >
        <span
          className="text-gray-600 dark:text-gray-400"
          style={{
            letterSpacing: '0.01em',
            transition: 'color 0.2s',
          }}
        >
          {isMobile ? phrases[0] : displayedText}
        </span>
        {!isMobile && (
          <span
            className="ml-1"
            style={{
              color: '#6b7280',
              WebkitTextStroke: '1px #fff',
              fontWeight: 900,
              animation: 'blink 1.8s steps(1) infinite',
            }}
          >
            |
          </span>
        )}
      </div>
      <style>
        {`
          @keyframes blink {
            0%, 60% { opacity: 1; }
            61%, 100% { opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};
