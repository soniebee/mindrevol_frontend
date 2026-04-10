// File TẠO MỚI: src/modules/chat/components/ForwardMessageModal.tsx
import React, { useState } from 'react';
import { X, Search, Send } from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { chatService } from '../services/chat.service';
import { toast } from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const ForwardMessageModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { conversations, forwardingMessage, setForwardingMessage } = useChatStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);

  if (!isOpen || !forwardingMessage) return null;

  // Lọc danh sách hội thoại để chuyển tiếp
  const filteredList = conversations.filter(c => {
    const name = c.boxName || c.partner?.fullname || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleForward = async () => {
    if (selectedIds.length === 0) return;
    setIsSending(true);

    try {
      for (const targetId of selectedIds) {
        const isBox = conversations.find(c => c.id === targetId)?.boxId;
        const partnerId = conversations.find(c => c.id === targetId)?.partner?.id;

        await chatService.sendMessage({
          conversationId: isBox ? targetId : undefined,
          receiverId: partnerId || (targetId.startsWith('friend_') ? targetId.replace('friend_', '') : undefined),
          content: forwardingMessage.content,
          type: (forwardingMessage.type === 'SYSTEM' ? 'TEXT' : forwardingMessage.type) as 'TEXT' | 'IMAGE' | 'VIDEO' | 'VOICE' | 'FILE',
          metadata: forwardingMessage.metadata 
        });
      }
      toast.success("Đã chuyển tiếp tin nhắn");
      setForwardingMessage(null);
      onClose();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi chuyển tiếp");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white dark:bg-[#1E1E24] w-full max-w-md rounded-3xl shadow-xl flex flex-col overflow-hidden animate-in zoom-in-95">
        <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
          <h3 className="font-bold text-lg text-zinc-800 dark:text-zinc-100" style={{ fontFamily: '"Nunito", sans-serif' }}>Chuyển tiếp đến</h3>
          <button onClick={() => { setForwardingMessage(null); onClose(); }} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full text-zinc-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input 
              value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm người hoặc nhóm..." 
              className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:outline-none"
            />
          </div>

          <div className="max-h-60 overflow-y-auto space-y-1 custom-scrollbar pr-1">
            {filteredList.map(item => (
              <div key={item.id} onClick={() => handleToggleSelect(item.id)} className="flex items-center gap-3 p-2 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl cursor-pointer transition-colors">
                <input 
                  type="checkbox" checked={selectedIds.includes(item.id)} readOnly
                  className="w-4 h-4 rounded border-zinc-300 text-blue-500 focus:ring-blue-500"
                />
                <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.boxAvatar ? <span>{item.boxAvatar}</span> : <img src={item.partner?.avatarUrl || "https://placehold.co/40x40"} className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-zinc-800 dark:text-zinc-200 truncate">{item.boxName || item.partner?.fullname}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-end gap-2">
          <button onClick={() => { setForwardingMessage(null); onClose(); }} className="px-5 py-2.5 font-bold text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors">Hủy</button>
          <button onClick={handleForward} disabled={selectedIds.length === 0 || isSending} className={cn("px-5 py-2.5 font-bold text-white rounded-xl transition-all flex items-center gap-2", selectedIds.length > 0 ? "bg-blue-500 hover:bg-blue-600" : "bg-blue-300 cursor-not-allowed")}>
            {isSending ? "Đang gửi..." : <><Send className="w-4 h-4" /> Gửi</>}
          </button>
        </div>
      </div>
    </div>
  );
};