// Простая функция аутентификации для замены удаленной
export async function auth() {
  // Возвращаем объект с user, чтобы код работал
  // В реальном приложении здесь должна быть проверка куки
  return {
    user: {
      id: 'temp-user-id',
      nickname: 'temp-user',
      email: 'temp@example.com',
      subscription: 'free', // Добавляем поле subscription
    },
    expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours from now
  };
}
