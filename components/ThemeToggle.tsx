
import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

const ThemeToggle: React.FC = () => {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.documentElement.classList.contains('dark') || 
             localStorage.getItem('theme') === 'dark';
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <button
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-2xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:scale-105 active:scale-95 flex items-center justify-center"
      aria-label="Toggle Theme"
    >
      {isDark ? (
        <Sun size={20} className="text-amber-500" />
      ) : (
        <Moon size={20} className="text-indigo-600" />
      )}
    </button>
  );
};

export default ThemeToggle;
