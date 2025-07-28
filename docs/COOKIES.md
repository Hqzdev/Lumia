# Куки система для Lumia AI

## Обзор

Система куки в Lumia AI предназначена для сохранения данных аутентификации пользователей на их устройствах, обеспечивая удобство использования и улучшенный пользовательский опыт.

## Функциональность

### Основные возможности

1. **Сохранение данных входа**
   - Никнейм пользователя
   - Настройка "Запомнить меня"
   - Время последнего входа

2. **Безопасность**
   - Ограничение попыток входа
   - Автоматическая очистка при выходе
   - Безопасные флаги куки (Secure, SameSite)

3. **Управление**
   - Автоматическая загрузка сохраненных данных
   - Возможность очистки данных
   - Настройки в профиле пользователя

## Структура куки

### Аутентификационные куки

| Название | Описание | Срок действия |
|----------|----------|---------------|
| `lumia_remember_me` | Флаг "Запомнить меня" | 1 год |
| `lumia_last_nickname` | Последний использованный никнейм | 1 год / 1 неделя |
| `lumia_last_login` | Время последнего входа | 30 дней |
| `lumia_login_attempts` | Счетчик попыток входа | 1 день |

## Использование

### В компонентах

```typescript
import { useCookies } from '@/hooks/use-cookies';

function LoginComponent() {
  const { 
    savedCredentials, 
    saveCredentials, 
    clearCredentials,
    incrementAttempts,
    resetAttempts 
  } = useCookies();

  // Загрузка сохраненных данных
  useEffect(() => {
    if (savedCredentials.nickname) {
      setNickname(savedCredentials.nickname);
      setRememberMe(savedCredentials.rememberMe);
    }
  }, [savedCredentials]);

  // Сохранение данных при успешном входе
  const handleSuccess = () => {
    saveCredentials(nickname, rememberMe);
    resetAttempts();
  };

  // Обработка неудачной попытки
  const handleFailure = () => {
    const attempts = incrementAttempts();
    if (attempts >= 5) {
      // Показать предупреждение
    }
  };
}
```

### Прямое использование утилит

```typescript
import { 
  saveLoginCredentials, 
  getSavedCredentials,
  clearLoginCredentials 
} from '@/lib/utils/cookies';

// Сохранение данных
saveLoginCredentials('username', true);

// Получение данных
const credentials = getSavedCredentials();

// Очистка данных
clearLoginCredentials();
```

## Безопасность

### Флаги безопасности

- **Secure**: Устанавливается только при использовании HTTPS
- **SameSite**: Установлен в "strict" для предотвращения CSRF атак
- **HttpOnly**: Не используется для клиентских куки (необходим доступ из JavaScript)

### Ограничения

- Максимум 5 попыток входа в день
- Автоматическая очистка при выходе из системы
- Временные ограничения на хранение данных

## Настройки пользователя

Пользователи могут управлять своими куки через:

1. **Страница настроек** - просмотр и очистка сохраненных данных
2. **Форма входа** - включение/выключение "Запомнить меня"
3. **Автоматическая очистка** - при выходе из системы

## Совместимость

- Поддерживает все современные браузеры
- Работает с Next.js 14+ и App Router
- Совместимо с NextAuth.js
- Поддерживает SSR/SSG

## Миграция

При обновлении системы куки:

1. Старые куки автоматически заменяются новыми
2. Обратная совместимость поддерживается
3. Пользователи могут очистить старые данные через настройки

## Отладка

### Проверка куки в браузере

```javascript
// В консоли браузера
console.log(document.cookie);

// Проверка конкретной куки
console.log(getCookie('lumia_remember_me'));
```

### Логирование

```typescript
// Включение отладочного режима
const DEBUG_COOKIES = process.env.NODE_ENV === 'development';

if (DEBUG_COOKIES) {
  console.log('Cookie operation:', { name, value, action });
}
```

## Будущие улучшения

- [ ] Шифрование данных в куки
- [ ] Поддержка нескольких устройств
- [ ] Синхронизация настроек
- [ ] Расширенные настройки безопасности 