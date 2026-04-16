import React, { useRef, useState, useCallback, useEffect } from 'react';
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

// Hàm hỗ trợ tìm định dạng video được trình duyệt support
const getSupportedVideoMimeType = () => {
  const types = ['video/webm', 'video/mp4', 'video/webm;codecs=vp8', 'video/webm;codecs=daala', 'video/webm;codecs=h264', 'video/mpeg'];
  for (const type of types) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return '';
};

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user'); 
  const [isCapturing, setIsCapturing] = useState(false);

  // States cho Live Photo (Video)
  const [isRecording, setIsRecording] = useState(false);
  const [recordProgress, setRecordProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunks = useRef<Blob[]>([]);
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  const MAX_RECORD_DURATION = 3000; // Thời gian Live Photo tối đa (3 giây)

  // Cleanup timers khi unmount
  useEffect(() => {
    return () => {
      if (holdTimerRef.current) clearInterval(holdTimerRef.current);
      if (pressTimerRef.current) clearTimeout(pressTimerRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  // 1. Logic chụp ảnh bình thường
  const handleCapturePhoto = useCallback(async () => {
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

  // 2. Logic bắt đầu quay video
  const startRecording = useCallback(() => {
    if (!webcamRef.current?.video?.srcObject) return;
    
    const stream = webcamRef.current.video.srcObject as MediaStream;
    const mimeType = getSupportedVideoMimeType();
    
    try {
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;
      recordedChunks.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          recordedChunks.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks.current, { type: mimeType || 'video/webm' });
        // Đặt đuôi file tùy theo mimeType, mặc định webm
        const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const file = new File([blob], `mindrevol-live-${Date.now()}.${ext}`, { type: blob.type });
        onCapture(file);
        
        setIsRecording(false);
        setRecordProgress(0);
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Cập nhật thanh tiến trình xoay vòng
      const startTime = Date.now();
      holdTimerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min((elapsed / MAX_RECORD_DURATION) * 100, 100);
        setRecordProgress(progress);
        
        // Tự động dừng khi đạt max duration
        if (elapsed >= MAX_RECORD_DURATION) {
          stopRecording();
        }
      }, 50); // Cập nhật UI mỗi 50ms cho mượt

    } catch (err) {
      console.error("Lỗi khởi tạo MediaRecorder:", err);
      toast.error("Thiết bị không hỗ trợ quay Live Photo");
    }
  }, [onCapture]);

  // 3. Logic dừng quay video
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (holdTimerRef.current) {
      clearInterval(holdTimerRef.current);
      holdTimerRef.current = null;
    }
  }, []);

  // 4. Xử lý các sự kiện chạm/nhấn chuột
  const handlePointerDown = (e: React.PointerEvent) => {
    // Chỉ xử lý chuột trái hoặc touch
    if (e.button !== 0 && e.pointerType === 'mouse') return; 
    
    // Đợi 250ms, nếu vẫn giữ thì mới tính là quay video
    pressTimerRef.current = setTimeout(() => {
      startRecording();
    }, 250);
  };

  const handlePointerUp = () => {
    // Nếu nhả ra trước 250ms -> Tính là chụp ảnh bình thường
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }

    if (isRecording) {
      stopRecording(); // Đang quay thì dừng lại và xuất file
    } else {
      handleCapturePhoto(); // Không quay thì chụp ảnh
    }
  };

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

  // Tính toán vòng cung cho SVG progress
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (circumference * recordProgress) / 100;

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

      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[460px] md:max-w-[560px] lg:max-w-[640px] mx-auto relative px-5 mt-4 md:mt-8">
        
        <div className="mb-6 md:mb-8 text-center animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-white text-2xl md:text-3xl font-black tracking-tight">Trạng thái của bạn?</h3>
            <p className="text-white/60 text-[15px] md:text-base font-medium mt-1.5 md:mt-2">
              {isRecording ? <span className="text-red-400 animate-pulse">Đang quay Live Photo...</span> : "Nhấn để chụp, Giữ để quay"}
            </p>
        </div>

        {/* KHUNG CAMERA */}
        <div className={`w-full aspect-square relative bg-zinc-900 overflow-hidden rounded-[36px] md:rounded-[48px] lg:rounded-[64px] border-[6px] md:border-[8px] transition-all duration-300 shadow-[0_0_50px_rgba(255,255,255,0.05)] ${isRecording ? 'border-amber-400/50 scale-[0.98]' : 'border-white/10'}`}>
          
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
        <div className="w-full flex items-center justify-between px-6 md:px-12 mt-8 md:mt-10 mb-6 relative">
          
          <button 
            onClick={() => fileInputRef.current?.click()} 
            className="w-[56px] h-[56px] md:w-[64px] md:h-[64px] rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg border border-white/5"
          >
            <ImageIcon size={24} strokeWidth={2} />
          </button>
          <input type="file" accept="image/*,video/*" ref={fileInputRef} onChange={handleGallerySelect} className="hidden" />

          {/* NÚT CHỤP CHÍNH CÓ HIỆU ỨNG LIVE PHOTO */}
          <div 
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerLeave={handlePointerUp} // Xử lý trường hợp người dùng kéo ngón tay/chuột ra ngoài nút
            className="relative w-[84px] h-[84px] md:w-[96px] md:h-[96px] flex items-center justify-center cursor-pointer group select-none touch-none"
          >
            {/* Vòng viền tĩnh nền */}
            <div className="absolute inset-0 rounded-full border-[4px] md:border-[6px] border-white/30 transition-colors duration-300" />
            
            {/* Vòng viền tiến trình xoay khi đang quay */}
            {isRecording && (
              <svg className="absolute inset-0 w-full h-full -rotate-90 transform origin-center drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke="currentColor"
                  className="text-amber-400 transition-all duration-75 ease-linear"
                  strokeWidth="6"
                  fill="none"
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
            )}

            {/* Lõi nút bên trong */}
            <div className={`
              w-[68px] h-[68px] md:w-[76px] md:h-[76px] bg-white rounded-full flex items-center justify-center 
              transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.6)]
              ${isRecording ? 'scale-75 bg-red-500 rounded-[20px]' : 'group-active:scale-90'}
            `}>
            </div>
          </div>

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