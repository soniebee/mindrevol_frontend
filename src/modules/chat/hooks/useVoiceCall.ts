import { useState, useEffect, useRef, useCallback } from 'react';
import { socket } from '@/lib/socket'; 

const servers = { iceServers: [{ urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] }] };

export const useVoiceCall = (currentUserId: string) => {
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [outgoingCall, setOutgoingCall] = useState<any>(null);
  const [isInCall, setIsInCall] = useState(false);
  
  const pc = useRef<RTCPeerConnection | null>(null);
  const localStream = useRef<MediaStream | null>(null);
  const remoteAudioRef = useRef<HTMLAudioElement | null>(null);

  const sendSignal = useCallback((payload: any) => {
    socket.send('/app/chat/webrtc', payload);
  }, []);

  // SỬA CHỖ NÀY: Bắt buộc truyền targetId vào
  const initWebRTC = async (targetId: string) => {
    pc.current = new RTCPeerConnection(servers);
    try {
      localStream.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      localStream.current.getTracks().forEach(track => {
        if (localStream.current && pc.current) pc.current.addTrack(track, localStream.current);
      });
    } catch (error) {
      console.error("Lỗi Mic:", error);
      return false;
    }

    pc.current.ontrack = (event) => {
      console.log("📥 Đã bắt được luồng âm thanh từ bên kia");
      if (remoteAudioRef.current && event.streams[0]) {
        remoteAudioRef.current.srcObject = event.streams[0];
      }
    };

    pc.current.onicecandidate = (event) => {
      if (event.candidate) {
        // LUÔN GỬI ICE CHO ĐÚNG NGƯỜI
        sendSignal({ type: 'ice-candidate', targetId: targetId, senderId: currentUserId, candidate: event.candidate });
      }
    };
    return true;
  };

  const createOffer = async (targetId: string) => {
    if (!pc.current) return;
    const offer = await pc.current.createOffer();
    await pc.current.setLocalDescription(offer);
    sendSignal({ type: 'offer', targetId: targetId, senderId: currentUserId, sdp: JSON.stringify(offer) });
  };

  const handleOffer = async (data: any) => {
    if (!pc.current) return;
    const offer = JSON.parse(data.sdp);
    await pc.current.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await pc.current.createAnswer();
    await pc.current.setLocalDescription(answer);
    sendSignal({ type: 'answer', targetId: data.senderId, senderId: currentUserId, sdp: JSON.stringify(answer) });
  };

  const handleAnswer = async (data: any) => {
    if (!pc.current) return;
    const answer = JSON.parse(data.sdp);
    await pc.current.setRemoteDescription(new RTCSessionDescription(answer));
  };

  const handleIceCandidate = async (data: any) => {
    if (!pc.current) return;
    if (data.candidate) await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
  };

  const startCall = (targetId: string) => {
    setOutgoingCall({ targetId }); 
    sendSignal({ type: 'call-request', targetId, senderId: currentUserId });
  };

  const endCall = () => {
    localStream.current?.getTracks().forEach(track => track.stop());
    if (pc.current) { pc.current.close(); pc.current = null; }
    setIsInCall(false);
    setIncomingCall(null);
    setOutgoingCall(null); 
  };

  useEffect(() => {
    if (!currentUserId) return;
    const sub = socket.subscribe(`/topic/webrtc.${currentUserId}`, async (data: any) => {
      switch (data.type) {
        case 'call-request': setIncomingCall(data); break;
        case 'call-reject': alert("Người kia đã từ chối"); endCall(); break;
        case 'call-accept':
          // SỬA CHỖ NÀY: Truyền ID người nhận vào initWebRTC
          const isReady = await initWebRTC(data.senderId);
          if (isReady) { await createOffer(data.senderId); setIsInCall(true); }
          break;
        case 'offer': await handleOffer(data); break;
        case 'answer': await handleAnswer(data); break;
        case 'ice-candidate': await handleIceCandidate(data); break;
        case 'end-call': endCall(); break;
      }
    });
    return () => { if (sub && typeof sub.unsubscribe === 'function') sub.unsubscribe(); };
  }, [currentUserId]);

  return { startCall, endCall, incomingCall, outgoingCall, isInCall, setIsInCall, initWebRTC, sendSignal, remoteAudioRef };
};