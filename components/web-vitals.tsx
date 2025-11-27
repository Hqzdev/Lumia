'use client';

import { useEffect } from 'react';
import type { Metric } from 'web-vitals';

// Мониторинг Core Web Vitals (ШАГ 8)
export function WebVitals() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Отслеживание Core Web Vitals
    const reportWebVitals = (metric: Metric) => {
      // Отправка метрик в аналитику (можно интегрировать с Yandex.Metrika или Google Analytics)
      if (process.env.NODE_ENV === 'production') {
        // Пример отправки в Yandex.Metrika
        if (typeof window !== 'undefined' && (window as any).ym) {
          (window as any).ym(103415484, 'reachGoal', 'web_vital', {
            name: metric.name,
            value: metric.value,
            id: metric.id,
            delta: metric.delta,
          });
        }
      } else {
        // В development режиме логируем в консоль
        console.log('[Web Vitals]', metric);
      }
    };

    // Импорт и инициализация web-vitals
    import('web-vitals').then(({ onCLS, onFID, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(reportWebVitals);
      onFID(reportWebVitals);
      onFCP(reportWebVitals);
      onLCP(reportWebVitals);
      onTTFB(reportWebVitals);
      onINP(reportWebVitals);
    }).catch((error) => {
      // web-vitals не установлен или произошла ошибка
      if (process.env.NODE_ENV === 'development') {
        console.warn('[Web Vitals] Failed to load:', error);
      }
    });
  }, []);

  return null;
}

