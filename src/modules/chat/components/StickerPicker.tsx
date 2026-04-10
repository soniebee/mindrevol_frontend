// File TẠO MỚI: src/modules/chat/components/StickerPicker.tsx
import React from 'react';

// Danh sách URL Sticker (Bạn có thể thay bằng link ảnh PNG/GIF tuỳ ý)
const STICKER_PACK = [
  "https://media.giphy.com/media/l41YkxvU8c7J7Bba0/giphy.gif",
  "https://media.giphy.com/media/3oriO0OEd9QIDdllqo/giphy.gif",
  "https://media.giphy.com/media/xT0xeQ1ZUQ0cbvF4aI/giphy.gif",
  "https://media.giphy.com/media/26AHONQ79FdWZhAI0/giphy.gif",
  "https://media.giphy.com/media/3o7TKMt1VVNkHV2PaE/giphy.gif",
  "https://media.giphy.com/media/l0HlvtIPzPdt2usKs/giphy.gif",
  "https://media.giphy.com/media/26AHLBZUC1n53ozi8/giphy.gif",
  "https://media.giphy.com/media/xT0xezQGU5x3CEQaYY/giphy.gif"
];

interface StickerPickerProps {
  onSelect: (url: string) => void;
}

export const StickerPicker: React.FC<StickerPickerProps> = ({ onSelect }) => {
  return (
    <div className="w-[300px] h-[300px] bg-white dark:bg-zinc-800 flex flex-col rounded-3xl overflow-hidden p-3 shadow-xl">
      <div className="text-sm font-bold text-zinc-600 dark:text-zinc-300 mb-2 px-1" style={{ fontFamily: '"Nunito", sans-serif' }}>
          Nhãn dán (Stickers)
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar grid grid-cols-4 gap-3 p-1">
        {STICKER_PACK.map((url, idx) => (
          <div 
            key={idx} 
            onClick={() => onSelect(url)}
            className="cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-700 p-1.5 rounded-xl transition-colors flex items-center justify-center active:scale-95"
          >
            <img src={url} alt={`sticker-${idx}`} className="w-full h-auto object-contain" loading="lazy" />
          </div>
        ))}
      </div>
    </div>
  );
};