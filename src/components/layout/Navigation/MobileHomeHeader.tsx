import React, { useRef, useState } from 'react';
import { MessageCircle, Users, Bell, Camera, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileHomeHeader = () => {
  const navigate = useNavigate();
  const [customBg, setCustomBg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomBg(URL.createObjectURL(file));
    }
  };

  return (
    // Tăng tổng chiều cao lên 280px để có không gian nhét 3 nút xuống dưới
    <div className="relative w-full h-[280px] block md:hidden mb-4">
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        onChange={handleImageUpload} 
        className="hidden" 
      />

      {/* 1. ẢNH BÌA LỚN PHÍA SAU (Chỉ cao 200px, phần bên dưới sẽ là màu nền) */}
      <div className="absolute top-0 left-0 w-full h-[200px] overflow-hidden bg-green-100 dark:bg-green-900/30">
        {customBg ? (
          <img src={customBg} className="w-full h-full object-cover" alt="Cover" />
        ) : (
          <img src="https://images.unsplash.com/photo-1540304453527-62f97914fd76?q=80&w=1000&auto=format&fit=crop" className="w-full h-full object-cover opacity-80" alt="Default Cover" />
        )}
        <div className="absolute inset-0 bg-black/10" />
      </div>

      {/* 2. TOP BAR */}
      <div className="absolute top-0 left-0 w-full p-6 pt-12 flex justify-between items-center z-20">
        <h1 className="text-white text-4xl font-normal tracking-wide drop-shadow-md flex items-center gap-1" style={{ fontFamily: '"Jua", sans-serif' }}>
          HOME <Sparkles className="w-5 h-5 text-yellow-300" strokeWidth={2} />
        </h1>
        <button 
          className="w-11 h-10 bg-amber-300 hover:bg-amber-400 rounded-[10px] shadow-[0px_4px_8px_rgba(0,0,0,0.15)] flex items-center justify-center text-black transition-all active:scale-95 relative"
        >
          <Bell size={20} />
          <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
        </button>
      </div>

      {/* 3. KHỐI BO TRÒN BÊN DƯỚI (Phủ lên ảnh tạo viền cong) */}
      {/* Bắt đầu từ 180px, cắt lên ảnh 20px, tạo ra phần nền cao 100px ở dưới cùng */}
      <div className="absolute bottom-0 left-0 w-full h-[100px] bg-zinc-50 dark:bg-[#121212] rounded-t-[32px] z-10 transition-colors duration-300 shadow-[0_-4px_10px_rgba(0,0,0,0.02)]" />

      {/* 4. 3 NÚT TRÒN LƠ LỬNG */}
      {/* Nằm cách đáy 16px (bottom-4), sẽ hoàn toàn nằm trong phần nền bo tròn, cách ảnh bìa một khoảng nhỏ */}
      <div className="absolute bottom-4 left-0 w-full flex justify-center gap-8 z-20 px-6">
        <button 
          onClick={() => fileInputRef.current?.click()} 
          className="w-14 h-14 rounded-full bg-yellow-400/30 backdrop-blur-md flex items-center justify-center text-yellow-600 dark:text-yellow-400 shadow-sm transition-transform active:scale-95"
        >
          <Camera size={24} />
        </button>
        <button 
          onClick={() => navigate('/chat')} 
          className="w-14 h-14 rounded-full bg-blue-300/30 backdrop-blur-md flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm transition-transform active:scale-95"
        >
          <MessageCircle size={24} />
        </button>
        <button 
          className="w-14 h-14 rounded-full bg-green-300/30 backdrop-blur-md flex items-center justify-center text-green-600 dark:text-green-400 shadow-sm transition-transform active:scale-95"
        >
          <Users size={24} />
        </button>
      </div>
    </div>
  );
};