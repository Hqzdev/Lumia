'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { User } from 'lucide-react';

interface EditNicknameDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentNickname: string;
  onSuccess?: () => void;
}

export function EditNicknameDialog({
  open,
  onOpenChange,
  currentNickname,
  onSuccess,
}: EditNicknameDialogProps) {
  const [nickname, setNickname] = useState(currentNickname);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setNickname(currentNickname);
      setError('');
    }
  }, [open, currentNickname]);

  const handleSubmit = async () => {
    setError('');

    if (!nickname || !nickname.trim()) {
      setError('Имя пользователя обязательно для заполнения');
      return;
    }

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 3 || trimmedNickname.length > 32) {
      setError('Имя пользователя должно быть от 3 до 32 символов');
      return;
    }

    if (trimmedNickname === currentNickname) {
      setError('Имя пользователя не изменилось');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/update-nickname', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nickname: trimmedNickname,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 409) {
          setError('Это имя пользователя уже занято');
        } else {
          setError(data.error || 'Ошибка при изменении имени');
        }
        setIsLoading(false);
        return;
      }

      toast.success('Имя пользователя успешно изменено');
      if (onSuccess) {
        onSuccess();
      }
      onOpenChange(false);
      // Перезагружаем страницу для обновления сессии
      window.location.reload();
    } catch (error) {
      console.error('Error updating nickname:', error);
      setError('Произошла ошибка при изменении имени');
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setNickname(currentNickname);
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <DialogTitle className="text-xl">Изменить имя пользователя</DialogTitle>
          </div>
          <DialogDescription>
            Введите новое имя пользователя. Оно должно быть уникальным.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Имя пользователя</Label>
            <Input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              placeholder="Введите имя пользователя"
              disabled={isLoading}
              maxLength={32}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSubmit();
                }
              }}
            />
            <p className="text-xs text-gray-500">
              От 3 до 32 символов. Только буквы, цифры и символы.
            </p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={handleCancel}
            disabled={isLoading}
          >
            Отмена
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? 'Сохранение...' : 'Изменить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
