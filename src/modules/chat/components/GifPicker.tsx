// File: src/modules/chat/components/GifPicker.tsx
import React, { useState, useEffect } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface GifPickerProps {
  onSelect: (gifUrl: string) => void;
}

export const GifPicker: React.FC<GifPickerProps> = ({ onSelect }) => {
  const [gifs, setGifs] = useState<string[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  // API Key miễn phí từ Tenor
  const TENOR_API_KEY = "LIVDSRZULELA"; 

  const fetchGifs = async (query: string) => {
    setLoading(true);
    try {
      const endpoint = query 
        ? `https://g.tenor.com/v1/search?q=${query}&key=${TENOR_API_KEY}&limit=20`
        : `https://g.tenor.com/v1/trending?key=${TENOR_API_KEY}&limit=20`;
      
      const res = await fetch(endpoint);
      const data = await res.json();
      const urls = data.results.map((item: any) => item.media[0].gif.url);
      setGifs(urls);
    } catch (error) {
      console.error("Lỗi tải GIF:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGifs('');
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== undefined) fetchGifs(search);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  return (
    <div className="w-[300px] h-[350px] bg-white dark:bg-zinc-800 flex flex-col rounded-3xl overflow-hidden">
      <div className="p-3 border-b border-zinc-100 dark:border-zinc-700 relative shrink-0">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input 
          value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm kiếm GIF..." 
          className="w-full bg-zinc-100 dark:bg-zinc-900 rounded-xl py-2 pl-9 pr-3 text-sm focus:outline-none text-zinc-800 dark:text-white"
        />
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 custom-scrollbar">
        {loading ? (
          <div className="flex justify-center items-center h-full"><Loader2 className="w-6 h-6 animate-spin text-zinc-400"/></div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {gifs.map((url, idx) => (
              <img 
                key={idx} src={url} alt="gif" 
                onClick={() => onSelect(url)}
                className="w-full h-24 object-cover rounded-xl cursor-pointer hover:opacity-80 transition-opacity bg-zinc-100 dark:bg-zinc-700" 
                loading="lazy"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};