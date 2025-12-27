import { useEffect, useState } from 'react';

export type OS = 'mac' | 'windows' | 'linux' | 'unknown';

export function useOS(): OS {
  const [os, setOS] = useState<OS>('unknown');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const platform = window.navigator.platform.toLowerCase();

    if (platform.includes('mac') || userAgent.includes('mac')) {
      setOS('mac');
    } else if (platform.includes('win') || userAgent.includes('win')) {
      setOS('windows');
    } else if (platform.includes('linux') || userAgent.includes('linux')) {
      setOS('linux');
    } else {
      setOS('unknown');
    }
  }, []);

  return os;
}
