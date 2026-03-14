import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(true);

  // Khởi tạo theme
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  return (
    <button 
      onClick={() => setIsDark(!isDark)}
      className="p-3 rounded-full bg-surface border border-border text-foreground hover:bg-border transition-all active:scale-90"
      title="Đổi giao diện Sáng/Tối"
    >
      {isDark ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-orange-500" />}
    </button>
  );
};