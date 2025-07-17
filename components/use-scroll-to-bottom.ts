import { useEffect, useRef, type RefObject } from 'react';

export function useScrollToBottom<T extends HTMLElement>(
  deps: any[] = [],
): [RefObject<T>, RefObject<T>] {
  const containerRef = useRef<T>(null);
  const endRef = useRef<T>(null);

  useEffect(() => {
    const end = endRef.current;
    if (end) {
      setTimeout(() => {
        end.scrollIntoView({ behavior: 'smooth', block: 'end' });
      }, 30);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return [containerRef, endRef];
}
