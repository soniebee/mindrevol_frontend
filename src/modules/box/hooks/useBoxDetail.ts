import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { boxService } from '../services/box.service';
import { BoxResponse } from '../types';
import { toast } from 'react-hot-toast';

export const useBoxDetail = (boxId: string | undefined, currentUserId: string | undefined) => {
    const navigate = useNavigate();

    // --- STATES DỮ LIỆU ---
    const [box, setBox] = useState<BoxResponse | null>(null);
    const [journeys, setJourneys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // --- STATES GIAO DIỆN (UI) ---
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('timeline');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    
    // --- STATES MODALS ---
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [isCreateJourneyModalOpen, setIsCreateJourneyModalOpen] = useState(false); 
    const [isUpdateBoxModalOpen, setIsUpdateBoxModalOpen] = useState(false); 

    const menuRef = useRef<HTMLDivElement>(null);

    // --- EFFECT: Xử lý click ra ngoài menu ---
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // --- EFFECT: Load dữ liệu khi vào trang ---
    useEffect(() => {
        if (boxId) fetchBoxData(boxId);
    }, [boxId]);

    // --- LOGIC: Gọi API lấy dữ liệu Box và Journey ---
    const fetchBoxData = async (id: string) => {
        try {
            setLoading(true);
            const [boxRes, journeysRes] = await Promise.all([
                boxService.getBoxDetails(id),
                boxService.getBoxJourneys(id, 0, 50) 
            ]);
            setBox(boxRes);
            
            // Sắp xếp hành trình từ mới đến cũ
            const sortedJourneys = (journeysRes.content || []).sort((a: any, b: any) => 
                new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime()
            );
            setJourneys(sortedJourneys);
            
        } catch (error) {
            console.error("Lỗi khi tải chi tiết Không gian:", error);
            toast.error("Không thể tải thông tin Không gian");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: Các hành động của Box ---
    const handleArchiveBox = async () => {
        if (!box || !window.confirm("Bạn có chắc chắn muốn lưu trữ Không gian này? Nó sẽ bị ẩn khỏi danh sách chính.")) return;
        try {
            await boxService.archiveBox(box.id);
            toast.success("Đã lưu trữ Không gian");
            navigate('/box');
        } catch (error) {
            toast.error("Lỗi khi lưu trữ");
        }
    };

    const handleDisbandBox = async () => {
        if (!box || !window.confirm("CẢNH BÁO: Hành động này không thể hoàn tác! Toàn bộ dữ liệu trong Box sẽ bị xóa vĩnh viễn. Bạn có chắc chắn không?")) return;
        try {
            await boxService.disbandBox(box.id);
            toast.success("Đã giải tán Không gian");
            navigate('/box');
        } catch (error) {
            toast.error("Lỗi khi giải tán");
        }
    };

    // --- HELPER QUYỀN TRUY CẬP ---
    const isOwner = currentUserId === box?.ownerId;

    return {
        // Data
        box,
        journeys,
        loading,
        isOwner,
        
        // UI States
        viewMode, setViewMode,
        isMenuOpen, setIsMenuOpen, menuRef,
        
        // Modal States
        isMembersModalOpen, setIsMembersModalOpen,
        isCreateJourneyModalOpen, setIsCreateJourneyModalOpen,
        isUpdateBoxModalOpen, setIsUpdateBoxModalOpen,
        
        // Actions
        fetchBoxData,
        handleArchiveBox,
        handleDisbandBox,
        navigate
    };
};