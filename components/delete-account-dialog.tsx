'use client';

import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';

interface DeleteAccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteAccountDialog({
  open,
  onOpenChange,
}: DeleteAccountDialogProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleDelete = async () => {
    if (!password.trim()) {
      setError('Пожалуйста, введите пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/delete-account', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Неверный пароль');
        } else {
          setError(data.error || 'Ошибка при удалении аккаунта');
        }
        setIsLoading(false);
        return;
      }

      // Успешное удаление
      toast.success('Аккаунт успешно удален');
      onOpenChange(false);
      
      // Выходим из системы и перенаправляем на главную страницу
      await signOut({ redirect: true, callbackUrl: '/' });
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Произошла ошибка при удалении аккаунта');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPassword('');
    setError('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-red-100">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl">
              Удалить аккаунт
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-left space-y-4">
            <p>
              Вы уверены, что хотите удалить свой аккаунт? Это действие
              невозможно отменить.
            </p>
            <p className="font-medium text-gray-900">
              Все ваши данные будут безвозвратно удалены:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-600 ml-2">
              <li>Все чаты и сообщения</li>
              <li>Все документы и артефакты</li>
              <li>Настройки профиля</li>
              <li>История активности</li>
            </ul>
            <div className="pt-2">
              <Label htmlFor="delete-password" className="text-sm font-medium">
                Введите пароль для подтверждения:
              </Label>
              <Input
                id="delete-password"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                placeholder="Ваш пароль"
                className="mt-2"
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !isLoading && password.trim()) {
                    handleDelete();
                  }
                }}
              />
              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Отмена
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={isLoading || !password.trim()}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isLoading ? 'Удаление...' : 'Да, удалить аккаунт'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
