import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { boxService } from '../services/box.service';
import { BoxDetailResponse } from '../types';
import { toast } from 'react-hot-toast';

export const useBoxDetail = (boxId: string | undefined, currentUserId: string | undefined) => {
    const navigate = useNavigate();

    // --- STATES DỮ LIỆU ---
    const [box, setBox] = useState<BoxDetailResponse | null>(null);
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
            
            // Gọi API, vì file box.service.ts đã sửa type trả về nên không cần "as BoxDetailResponse" nữa
            const boxRes = await boxService.getBoxDetails(id);
            setBox(boxRes);
            
            // Lấy journeys có sẵn từ BE
            const allJourneys = [...(boxRes.ongoingJourneys || []), ...(boxRes.endedJourneys || [])];
            
            // Sắp xếp hành trình từ mới đến cũ
            const sortedJourneys = allJourneys.sort((a: any, b: any) => 
                new Date(b.createdAt || b.startDate || Date.now()).getTime() - new Date(a.createdAt || a.startDate || Date.now()).getTime()
            );
            setJourneys(sortedJourneys);
            
        } catch (error) {
            console.error("Error loading Box details:", error);
            toast.error("Failed to load Box info");
        } finally {
            setLoading(false);
        }
    };

    // --- LOGIC: Các hành động của Box ---
    const handleArchiveBox = async () => {
        if (!box || !window.confirm("Are you sure you want to archive this Box? It will be hidden from the main list.")) return;
        try {
            // Đã comment dòng gọi API, chỉ thông báo UI
            // await boxService.archiveBox(box.id);
            toast.success("Archive feature is in development!");
        } catch (error) {
            toast.error("Failed to archive");
        }
    };

    const handleDisbandBox = async () => {
        if (!box || !window.confirm("WARNING: This action cannot be undone! All data in this Box will be permanently deleted. Are you sure?")) return;
        try {
            await boxService.disbandBox(box.id);
            toast.success("Box disbanded");
            navigate('/box');
        } catch (error) {
            toast.error("Failed to disband");
        }
    };

    // --- HELPER QUYỀN TRUY CẬP ---
    const isOwner = box?.myRole === 'ADMIN';

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