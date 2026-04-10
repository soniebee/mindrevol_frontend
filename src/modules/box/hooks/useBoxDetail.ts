import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { boxService } from '../services/box.service';
import { journeyService } from '@/modules/journey/services/journey.service';
import { BoxDetailResponse } from '../types';
import { UserActiveJourneyResponse } from '@/modules/journey/types';

export const useBoxDetail = (boxId: string | undefined, currentUserId: string | undefined) => {
    const navigate = useNavigate();
    const [box, setBox] = useState<BoxDetailResponse | null>(null);
    const [journeys, setJourneys] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);

    // States giao diện
    const [viewMode, setViewMode] = useState<'grid' | 'timeline'>('grid');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    
    // States quản lý Modals
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [isCreateJourneyModalOpen, setIsCreateJourneyModalOpen] = useState(false);
    const [isUpdateBoxModalOpen, setIsUpdateBoxModalOpen] = useState(false);

    const fetchBoxData = useCallback(async (id: string) => {
        setLoading(true);
        try {
            // 1. Kéo thông tin Box
            const boxData = await boxService.getBoxDetails(id);
            setBox(boxData);
            
            // ĐÃ SỬA LỖI: Sử dụng myRole thay vì role
            setIsOwner(boxData.myRole === 'OWNER' || boxData.myRole === 'ADMIN');

            // 2. Kéo danh sách Hành trình trong Box (Data thô chưa có ảnh)
            const journeysData = await boxService.getBoxJourneys(id);
            let rawJourneys = journeysData.content || [];

            // 3. ĐỒNG BỘ ẢNH & ICON TỪ API ACTIVE JOURNEYS
            try {
                const activeList = await journeyService.getUserActiveJourneys("me");
                rawJourneys = rawJourneys.map((j: any) => {
                    const extraData = activeList.find((a: UserActiveJourneyResponse) => a.id === j.id);
                    
                    // Lọc ra các ảnh từ bài đăng (Checkins)
                    const checkinImages = extraData?.checkins
                        ?.filter((c: any) => c.imageUrl)
                        .map((c: any) => c.imageUrl) || [];

                    return {
                        ...j,
                        // Bổ sung Icon (Avatar) và Màu sắc
                        avatar: extraData?.avatar || j.avatar,
                        themeColor: extraData?.themeColor || j.themeColor,
                        // Bổ sung danh sách ảnh (Preview)
                        previewImages: checkinImages.length > 0 
                            ? checkinImages 
                            : (extraData?.thumbnailUrl ? [extraData.thumbnailUrl] : [])
                    };
                });
            } catch (e) {
                console.error("Lỗi đồng bộ dữ liệu ảnh Hành trình:", e);
            }

            setJourneys(rawJourneys);
        } catch (error) {
            console.error("Không thể tải chi tiết Box:", error);
            navigate('/boxes'); // Lỗi thì đá ra ngoài
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        if (boxId) fetchBoxData(boxId);
    }, [boxId, fetchBoxData]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleArchiveBox = async () => {
        toast.success("Tính năng lưu trữ Không gian đang được phát triển.");
        setIsMenuOpen(false);
    };

    const handleDisbandBox = async () => {
        if (!boxId) return;
        if (window.confirm("Bạn có chắc chắn muốn giải tán Không gian này? Mọi Hành trình và dữ liệu sẽ bị xóa vĩnh viễn.")) {
            try {
                await boxService.disbandBox(boxId);
                toast.success("Đã giải tán Không gian.");
                navigate('/boxes');
            } catch (error: any) {
                toast.error("Lỗi khi giải tán Không gian.");
            }
        }
        setIsMenuOpen(false);
    };

    return {
        box, 
        journeys, 
        loading, 
        isOwner, 
        navigate,
        viewMode, 
        setViewMode, 
        isMenuOpen, 
        setIsMenuOpen, 
        menuRef,
        isMembersModalOpen, 
        setIsMembersModalOpen,
        isCreateJourneyModalOpen, 
        setIsCreateJourneyModalOpen,
        isUpdateBoxModalOpen, 
        setIsUpdateBoxModalOpen,
        fetchBoxData, 
        handleArchiveBox, 
        handleDisbandBox
    };
};