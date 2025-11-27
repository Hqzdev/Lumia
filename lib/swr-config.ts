// Глобальная конфигурация SWR для оптимизации (ШАГ 6)
import { SWRConfiguration } from 'swr';

export const swrConfig: SWRConfiguration = {
  // Дедупликация запросов - одинаковые запросы выполняются один раз
  dedupingInterval: 2000,
  // Время кэширования данных
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  // Оптимизация для мобильных
  revalidateIfStale: true,
  // Кэширование на 5 минут
  refreshInterval: 0,
  // Ошибки не блокируют UI
  shouldRetryOnError: true,
  errorRetryCount: 3,
  errorRetryInterval: 5000,
};

