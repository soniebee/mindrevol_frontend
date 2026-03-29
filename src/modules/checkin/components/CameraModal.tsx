import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { X, RefreshCcw, ImageIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (file: File) => void; 
}

const base64ToFile = async (base64Url: string, filename: string): Promise<File> => {
  const res = await fetch(base64Url);
  const blob = await res.blob();
  return new File([blob], filename, { type: 'image/jpeg' });
};

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); 
  const [isCapturing, setIsCapturing] = useState(false);

  const handleCapture = useCallback(async () => {
    if (webcamRef.current) {
      setIsCapturing(true);
      const imageSrc = webcamRef.current.getScreenshot();
      
      if (imageSrc) {
        setTimeout(async () => {
          try {
            const fileName = `mindrevol-cam-${Date.now()}.jpg`;
            const file = await base64ToFile(imageSrc, fileName);
            onCapture(file); 
          } catch (error) {
            toast.error("Lỗi xử lý ảnh chụp");
          } finally {
            setIsCapturing(false);
          }
        }, 150); 
      } else {
        setIsCapturing(false);
      }
    }
  }, [webcamRef, onCapture]);

  if (!isOpen) return null;

  const toggleCamera = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  const handleGallerySelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      onCapture(file); 
    }
  };

  return (
    <div className="fixed inset-0 z-[110] bg-[#121212]/95 backdrop-blur-3xl flex flex-col animate-in fade-in zoom-in-95 duration-300 font-sans">
      
      {/* Header */}
      <div className="h-20 flex items-center justify-between px-6 w-full absolute top-0 z-20">
        <button 
          onClick={onClose} 
          className="p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-sm"
        >
          <X size={24} />
        </button>
      </div>

      {/* BODY: ĐÃ TĂNG CHIỀU RỘNG TRÊN DESKTOP (md:max-w-[560px] lg:max-w-[640px]) */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[460px] md:max-w-[560px] lg:max-w-[640px] mx-auto relative px-5 mt-4 md:mt-8">
        
        <div className="mb-6 md:mb-8 text-center animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-white text-2xl md:text-3xl font-black tracking-tight">Trạng thái của bạn?</h3>
            <p className="text-white/60 text-[15px] md:text-base font-medium mt-1.5 md:mt-2">Lưu giữ khoảnh khắc ngay bây giờ</p>
        </div>

        {/* KHUNG CAMERA */}
        <div className="w-full aspect-square relative bg-zinc-900 overflow-hidden rounded-[36px] md:rounded-[48px] lg:rounded-[64px] border-[6px] md:border-[8px] border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.05)] transform transition-transform duration-300">
          
          {isCapturing && <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300" />}

          <Webcam
            ref={webcamRef}
            audio={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.92}
            videoConstraints={{
              facingMode: facingMode,
              aspectRatio: 1 
            }}
            className="w-full h-full object-cover"
            mirrored={facingMode === 'user'} 
          />

          <div className="absolute inset-0 pointer-events-none grid grid-cols-3 grid-rows-3 opacity-30">
            <div className="border-r border-b border-white/30" />
            <div className="border-r border-b border-white/30" />
            <div className="border-b border-white/30" />
            <div className="border-r border-b border-white/30" />
            <div className="border-r border-b border-white/30" />
            <div className="border-b border-white/30" />
            <div className="border-r border-white/30" />
            <div className="border-r border-white/30" />
            <div className="" />
          </div>
        </div>

        {/* CÁC NÚT ĐIỀU KHIỂN */}
        <div className="w-full flex items-center justify-between px-6 md:px-12 mt-8 md:mt-10 mb-6">
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/5"
          >
            <ImageIcon size={24} strokeWidth={2} />
          </button>
          <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleGallerySelect} className="hidden" />

          <button 
            onClick={handleCapture} 
            className="w-[84px] h-[84px] md:w-[96px] md:h-[96px] rounded-full border-[4px] md:border-[6px] border-white/30 p-1.5 flex items-center justify-center hover:scale-105 active:scale-95 transition-all group shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <div className="w-full h-full bg-white rounded-full flex items-center justify-center group-hover:bg-zinc-200 transition-colors shadow-[0_0_20px_rgba(255,255,255,0.6)]">
            </div>
          </button>

          <button 
            onClick={toggleCamera} 
            className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/5"
          >
            <RefreshCcw size={24} strokeWidth={2} />
          </button>

        </div>
      </div>
    </div>
  );
};