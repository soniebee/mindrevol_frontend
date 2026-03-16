import { useState } from 'react';
import { useAuth } from '@/modules/auth/store/AuthContext';
import { checkinService } from '@/modules/checkin/services/checkin.service';
import { PostProps } from '../types';
import { toast } from 'react-hot-toast';

interface UsePostCardLogicProps {
  post: PostProps;
  onDelete?: (postId: string) => void;
  onUpdate?: (postId: string, newCaption: string) => void;
}

export const usePostCardLogic = ({ post, onDelete, onUpdate }: UsePostCardLogicProps) => {
  const { user: currentUser } = useAuth();
  
  // State UI
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  
  // State Edit Logic
  const [isEditing, setIsEditing] = useState(false);
  // [FIX] Luôn đảm bảo giá trị khởi tạo là string, tránh undefined/null
  const [editCaption, setEditCaption] = useState(post.caption || '');
  const [isSaving, setIsSaving] = useState(false);

  const isOwner = currentUser?.id.toString() === post.userId;

  // Handlers
  const handleReport = () => { 
      setShowReportModal(true); 
      setShowMenu(false); 
  };

  const handleDelete = async () => {
    if (confirm("Bạn có chắc muốn xóa khoảnh khắc này?")) {
      try { 
          await checkinService.deleteCheckin(post.id); 
          toast.success("Đã xóa bài viết");
          if (onDelete) onDelete(post.id); 
      } catch (error) { 
          console.error(error);
          toast.error("Không thể xóa bài viết");
      }
    }
    setShowMenu(false);
  };

  const handleEditClick = () => { 
      // [FIX] Reset lại caption từ props mỗi khi mở form sửa
      setEditCaption(post.caption || ''); 
      setIsEditing(true); 
      setShowMenu(false); 
  };
  
  const handleSaveEdit = async () => {
    if (editCaption === post.caption) { 
        setIsEditing(false); 
        return; 
    }
    try { 
        setIsSaving(true); 
        
        // Gọi API
        await checkinService.updateCheckin(post.id, editCaption); 
        
        // [QUAN TRỌNG] Chỉ truyền chuỗi `editCaption` (đã là string) vào callback
        if (onUpdate) onUpdate(post.id, editCaption); 
        
        setIsEditing(false); 
        toast.success("Đã cập nhật");
    } catch (error) { 
        console.error(error); 
        toast.error("Lỗi cập nhật"); 
    } finally { 
        setIsSaving(false); 
    }
  };

  const handleCancelEdit = () => { 
      setEditCaption(post.caption || ''); 
      setIsEditing(false); 
  };

  const toggleMenu = (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowMenu(!showMenu);
  };

  return {
    isOwner,
    showMenu, setShowMenu, toggleMenu,
    showReportModal, setShowReportModal,
    isEditing,
    editCaption, setEditCaption,
    isSaving,
    handlers: {
        handleReport,
        handleDelete,
        handleEditClick,
        handleSaveEdit,
        handleCancelEdit
    }
  };
};