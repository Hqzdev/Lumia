'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function SignOutForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        // Перенаправляем на домен аутентификации
        window.location.href = data.redirectUrl;
      } else {
        console.error('Logout failed:', data.error);
      }
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      onClick={handleSignOut}
      disabled={isLoading}
      className="w-full"
    >
      {isLoading ? 'Выход...' : 'Выйти'}
    </Button>
  );
}
