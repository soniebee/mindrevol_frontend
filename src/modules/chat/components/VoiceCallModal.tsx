//src/components/VoiceCallModal
import React, { useState, useEffect } from 'react';
import { Phone, PhoneOff, Mic } from 'lucide-react';

interface VoiceCallModalProps {
  incomingCall: any;
  outgoingCall: any;
  isInCall: boolean;
  onAccept: () => void;
  onReject: () => void;
  onEndCall: () => void;
  onCancelCall: () => void;
  remoteAudioRef: React.RefObject<HTMLAudioElement | null>;
  partnerName: string;
}

export const VoiceCallModal: React.FC<VoiceCallModalProps> = ({
  incomingCall, outgoingCall, isInCall, onAccept, onReject, onEndCall, onCancelCall, remoteAudioRef, partnerName
}) => {
  const [callDuration, setCallDuration] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>; 
    if (isInCall) {
      interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    } else {
      setCallDuration(0); 
    }
    return () => clearInterval(interval);
  }, [isInCall]);

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Nếu không có hoạt động gọi thì ẩn hoàn toàn
  if (!incomingCall && !outgoingCall && !isInCall) return null;

  return (
    <>
      {/* BÍ QUYẾT Ở ĐÂY: Luôn render thẻ audio ở ngoài cùng.
        Nó sẽ không bao giờ bị ngắt quãng dù component có đếm giờ nhảy loạn xạ!
      */}
      <audio ref={remoteAudioRef} autoPlay className="hidden" />

      {/* 1. ĐANG GỌI ĐI */}
      {outgoingCall && !isInCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-6 w-80 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <Phone className="w-10 h-10 text-blue-500" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-['Jua'] text-black">{partnerName}</h3>
              <p className="text-gray-500">Đang gọi...</p>
            </div>
            <div className="flex gap-6 w-full justify-center mt-2">
              <button onClick={onCancelCall} className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110">
                <PhoneOff className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. CÓ NGƯỜI GỌI TỚI */}
      {incomingCall && !isInCall && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-6 w-80 animate-in zoom-in-95">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
              <Phone className="w-10 h-10 text-blue-500" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-['Jua'] text-black">{partnerName}</h3>
              <p className="text-gray-500">Đang gọi cho bạn...</p>
            </div>
            <div className="flex gap-6 w-full justify-center mt-2">
              <button onClick={onReject} className="w-14 h-14 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110">
                <PhoneOff className="w-6 h-6" />
              </button>
              <button onClick={onAccept} className="w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center text-white transition-transform hover:scale-110 animate-bounce">
                <Phone className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. ĐANG TRONG CUỘC GỌI */}
      {isInCall && (
        <div className="fixed top-20 right-4 z-[100] bg-zinc-900 p-4 rounded-2xl shadow-2xl flex flex-col items-center gap-4 w-64 border border-zinc-700">
          <div className="text-center">
            <h3 className="text-lg font-['Jua'] text-white">{partnerName}</h3>
            <p className="text-green-400 text-sm font-mono tracking-wider">{formatTime(callDuration)}</p>
          </div>
          <div className="flex gap-4">
            <button className="w-12 h-12 bg-zinc-700 hover:bg-zinc-600 rounded-full flex items-center justify-center text-white">
              <Mic className="w-5 h-5" />
            </button>
            <button onClick={onEndCall} className="w-12 h-12 bg-red-500 hover:bg-red-600 rounded-full flex items-center justify-center text-white">
              <PhoneOff className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};