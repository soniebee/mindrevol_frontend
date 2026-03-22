import { JourneyTheme } from "../types";
// Import các icon từ lucide-react
import { 
  Plane, Utensils, BookOpen, Heart, 
  Dumbbell, Gamepad2, Coffee, MoreHorizontal 
} from 'lucide-react';

interface ThemeConfig {
  label: string;
  icon: any; // Component Icon
  color: string; // Màu đại diện (nếu muốn dùng cho icon)
}

export const THEME_CONFIG: Record<JourneyTheme, ThemeConfig> = {
  [JourneyTheme.TRAVEL]: { 
    label: 'Du lịch', 
    icon: Plane,
    color: 'text-blue-400'
  },
  [JourneyTheme.FOOD]: { 
    label: 'Ẩm thực', 
    icon: Utensils,
    color: 'text-orange-400'
  },
  [JourneyTheme.STUDY]: { 
    label: 'Học tập', 
    icon: BookOpen,
    color: 'text-indigo-400'
  },
  [JourneyTheme.DATING]: { 
    label: 'Hẹn hò', 
    icon: Heart,
    color: 'text-pink-400'
  },
  [JourneyTheme.SPORTS]: { 
    label: 'Thể thao', 
    icon: Dumbbell,
    color: 'text-emerald-400'
  },
  [JourneyTheme.GAME]: { 
    label: 'Giải trí', 
    icon: Gamepad2,
    color: 'text-purple-400'
  },
  [JourneyTheme.LIFESTYLE]: { 
    label: 'Đời sống', 
    icon: Coffee,
    color: 'text-teal-400'
  },
  [JourneyTheme.OTHER]: { 
    label: 'Khác', 
    icon: MoreHorizontal, // Icon dấu 3 chấm cho "Khác"
    color: 'text-zinc-400'
  },
};