'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useOS } from '@/hooks/use-os';
import { formatHotkey, type Hotkey } from '@/hooks/use-hotkeys';
import { useIsMobile } from '@/hooks/use-mobile';

interface Shortcut {
  label: string;
  hotkey: Hotkey;
  description?: string;
}

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SHORTCUTS: Shortcut[] = [
  {
    label: 'Отправить сообщение',
    hotkey: { key: 'Enter' },
    description: 'Отправить текущее сообщение',
  },
  {
    label: 'Новая строка',
    hotkey: { key: 'Enter', shift: true },
    description: 'Добавить новую строку в сообщении',
  },
  {
    label: 'Поиск чатов',
    hotkey: { key: 'k', meta: true },
    description: 'Открыть поиск по чатам',
  },
  {
    label: 'Фокус на поле ввода',
    hotkey: { key: 'l', meta: true },
    description: 'Установить фокус на поле ввода сообщения',
  },
  {
    label: 'Показать горячие клавиши',
    hotkey: { key: '/', meta: true },
    description: 'Открыть этот диалог',
  },
  {
    label: 'Закрыть диалог',
    hotkey: { key: 'Escape' },
    description: 'Закрыть открытый диалог',
  },
];

export function KeyboardShortcutsDialog({
  open,
  onOpenChange,
}: KeyboardShortcutsDialogProps) {
  const os = useOS();
  const isMobile = useIsMobile();

  // Don't show on mobile
  if (isMobile) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Горячие клавиши</DialogTitle>
        </DialogHeader>
        <div className="mt-4 space-y-4">
          {SHORTCUTS.map((shortcut) => {
            const formatted = formatHotkey(shortcut.hotkey, os);
            return (
              <div
                key={shortcut.label}
                className="flex items-center justify-between py-2 border-b border-gray-200 dark:border-gray-700 last:border-0"
              >
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-gray-100">
                    {shortcut.label}
                  </div>
                  {shortcut.description && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {shortcut.description}
                    </div>
                  )}
                </div>
                <kbd className="inline-flex items-center gap-1 px-2.5 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded">
                  {formatted}
                </kbd>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Горячие клавиши доступны только на десктопе. На мобильных устройствах они отключены.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
