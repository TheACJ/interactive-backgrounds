import { useState, useEffect } from 'react';

export function useColorMode(): 'light' | 'dark' {
  const [mode, setMode] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const getMode = (): 'light' | 'dark' => {
      // Check for 'dark' class on <html>
      if (document.documentElement.classList.contains('dark')) {
        return 'dark';
      }

      // Check system preference
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }

      // Parse <body> background color and compute luminance
      const bg = getComputedStyle(document.body).backgroundColor;
      const rgb = bg.match(/\d+/g)?.map(Number) || [255, 255, 255]; // Default to white
      const luminance = 0.299 * rgb[0] + 0.587 * rgb[1] + 0.114 * rgb[2];
      return luminance < 128 ? 'dark' : 'light';
    };

    setMode(getMode());

    // Listen for media query changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => setMode(getMode());
    mediaQuery.addEventListener('change', handleChange);

    // Observe class changes on <html>
    const observer = new MutationObserver(handleChange);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      observer.disconnect();
    };
  }, []);

  return mode;
}