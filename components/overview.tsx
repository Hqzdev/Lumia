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

// Функция для парсинга строки с <...> и возвращения массива React-элементов
function parsePhraseWithBlue(text: string) {
  const result: React.ReactNode[] = [];
  let idx = 0;
  const regex = /<([^>]+)>/g;
  let match: RegExpExecArray | null;
  let lastIndex = 0;

  while ((match = regex.exec(text)) !== null) {
    // Текст до <...>
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    // Само слово в <>
    result.push(
      <span key={idx++} className="text-blue-600">
        {match[1]}
      </span>,
    );
    lastIndex = regex.lastIndex;
  }
  // Остаток строки
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }
  return result;
}

export const Overview = ({ nickname }: { nickname?: string }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [currentPhraseIdx, setCurrentPhraseIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [charIdx, setCharIdx] = useState(0);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Размер текста для приветствия (больше для телефона)
  const textSize = isMobile
    ? 'text-[32px] sm:text-[36px] md:text-[40px]'
    : 'text-[28px] md:text-[32px] lg:text-[40px]';

  // Анимация печатания (плавнее и медленнее)
  useEffect(() => {
    const phrase = phrases[currentPhraseIdx];
    let timeout: NodeJS.Timeout | undefined;

    if (!isDeleting && charIdx < phrase.length) {
      timeout = setTimeout(() => {
        setDisplayedText(phrase.slice(0, charIdx + 1));
        setCharIdx(charIdx + 1);
      }, 110); // медленнее
    } else if (!isDeleting && charIdx === phrase.length) {
      // Пауза после полного вывода фразы
      timeout = setTimeout(() => {
        setIsDeleting(true);
      }, 1800); // дольше пауза
    } else if (isDeleting && charIdx > 0) {
      timeout = setTimeout(() => {
        setDisplayedText(phrase.slice(0, charIdx - 1));
        setCharIdx(charIdx - 1);
      }, 60); // медленнее удаление
    } else if (isDeleting && charIdx === 0) {
      // Следующая фраза
      timeout = setTimeout(() => {
        setIsDeleting(false);
        setCurrentPhraseIdx((prev) => (prev + 1) % phrases.length);
      }, 700); // дольше пауза между фразами
    }

    typingTimeout.current = timeout ?? null;
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [charIdx, isDeleting, currentPhraseIdx]);

  // Сброс charIdx при смене фразы
  useEffect(() => {
    if (!isDeleting) setCharIdx(0);
  }, [currentPhraseIdx, isDeleting]);

  return (
    <div
      key="overview"
      className="max-w-5xl mx-auto md:mt-32 px-4 size-full flex flex-col justify-center items-center"
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
      <div
        className={`flex gap-[2px] ${textSize} font-bold justify-center mb-8`}
        style={{ lineHeight: 1.05, minHeight: isMobile ? 40 : 36 }}
      >
        <span
          className="text-gray-600 dark:text-gray-400"
          style={{
            letterSpacing: '0.01em',
            transition: 'color 0.2s',
          }}
        >
          {displayedText}
        </span>
        <span
          className="ml-1"
          style={{
            color: '#6b7280', // Tailwind gray-500
            WebkitTextStroke: '1px #fff',
            fontWeight: 900,
            animation: 'blink 1.8s steps(1) infinite', // медленнее и плавнее
          }}
        >
          |
        </span>
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
