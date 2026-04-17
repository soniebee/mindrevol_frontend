import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import hook điều hướng
import MainLayout from '@/components/layout/MainLayout';
import { JourneyMap } from '@/modules/map/components/JourneyMap';
import { boxService } from '@/modules/box/services/box.service';
import { BoxResponse } from '@/modules/box/types';
import { JourneyResponse } from '@/modules/journey/types';
import { MapPin, ChevronDown, ChevronRight, Layers, Globe, Filter, X, SlidersHorizontal, ArrowLeft } from 'lucide-react'; // Thêm ArrowLeft
import { cn } from '@/lib/utils';

export const MapPage = () => {
    const navigate = useNavigate(); // Khởi tạo hook điều hướng
    
    const [boxes, setBoxes] = useState<BoxResponse[]>([]);
    const [boxJourneys, setBoxJourneys] = useState<Record<string, JourneyResponse[]>>({});
    const [expandedBox, setExpandedBox] = useState<string | null>(null);

    const [filterType, setFilterType] = useState<'me' | 'box' | 'journey'>('me');
    const [filterId, setFilterId] = useState<string>('');

    // State quản lý trạng thái Đóng/Mở Bảng điều khiển bộ lọc nổi
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    // =========================================================================
    // XỬ LÝ LỖI KHUYẾT BẢN ĐỒ KHI SIDEBAR TRÁI CO GIÃN
    // =========================================================================
    useEffect(() => {
        const triggerMapResize = () => {
            window.dispatchEvent(new Event('resize'));
        };

        const timer1 = setTimeout(triggerMapResize, 300);
        
        const mapContainer = document.getElementById('map-wrapper-container');
        let resizeObserver: ResizeObserver;
        
        if (mapContainer) {
            resizeObserver = new ResizeObserver(() => {
                setTimeout(triggerMapResize, 300); 
            });
            resizeObserver.observe(mapContainer);
        }

        return () => {
            clearTimeout(timer1);
            if (resizeObserver && mapContainer) {
                resizeObserver.unobserve(mapContainer);
            }
        };
    }, []);
    // =========================================================================

    useEffect(() => {
        const fetchBoxes = async () => {
            try {
                // [FIX LỖI TS] Truyền đầy đủ các tham số tab, search, page, size
                const res: any = await boxService.getMyBoxes('all', '', 0, 50);
                setBoxes(res.content || []);
            } catch (error) {
                console.error("Lỗi lấy danh sách Box:", error);
            }
        };
        fetchBoxes();
    }, []);

    const toggleBox = async (boxId: string) => {
        if (expandedBox === boxId) {
            setExpandedBox(null);
            return;
        }
        setExpandedBox(boxId);
        
        if (!boxJourneys[boxId]) {
            try {
                const jRes: any = await boxService.getBoxJourneys(boxId, 0, 50);
                setBoxJourneys(prev => ({ ...prev, [boxId]: jRes.content || [] }));
            } catch (error) {
                console.error("Lỗi lấy hành trình của box:", error);
            }
        }
    };

    const handleSelectMe = () => {
        setFilterType('me');
        setFilterId('');
    };

    const handleSelectBox = (boxId: string) => {
        setFilterType('box');
        setFilterId(boxId);
    };

    const handleSelectJourney = (journeyId: string) => {
        setFilterType('journey');
        setFilterId(journeyId);
    };

    return (
        <MainLayout>
            <div id="map-wrapper-container" className="relative w-full h-[100dvh] bg-[#121212] overflow-hidden text-white pt-16 md:pt-0">
                
                {/* --- LỚP NỀN: BẢN ĐỒ TRÀN VIỀN --- */}
                <div className="absolute inset-0 z-0">
                    <JourneyMap
                        userId={filterType === 'me' ? 'me' : undefined}
                        boxId={filterType === 'box' ? filterId : undefined}
                        journeyId={filterType === 'journey' ? filterId : undefined}
                        className="w-full h-full"
                    />
                </div>

                {/* --- NÚT QUAY LẠI TRÊN MOBILE --- */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-6 left-4 md:hidden z-10 bg-black/40 hover:bg-black/60 backdrop-blur-xl p-2.5 rounded-full shadow-2xl border border-white/10 text-white transition-all active:scale-95 flex items-center justify-center"
                >
                    <ArrowLeft size={20} />
                </button>

                {/* HUY HIỆU BỘ LỌC (Góc trên trái) */}
                {/* Trên mobile dời sang left-16 để tránh đè lên nút quay lại */}
                <div className="absolute top-6 left-16 md:left-6 z-10 bg-black/40 backdrop-blur-xl px-4 py-2.5 rounded-full shadow-2xl border border-white/10 flex items-center gap-2 pointer-events-none transition-all">
                    <Filter size={16} className="text-blue-400" />
                    <span className="text-sm font-bold text-white tracking-wide truncate max-w-[150px] md:max-w-none">
                        {filterType === 'me' && 'Tất cả kỷ niệm của tôi'}
                        {filterType === 'box' && 'Bản đồ theo Không gian'}
                        {filterType === 'journey' && 'Bản đồ Hành trình'}
                    </span>
                </div>

                {/* NÚT MỞ BỘ LỌC */}
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className={cn(
                        "absolute top-6 right-6 z-10 bg-black/60 hover:bg-black/80 backdrop-blur-xl p-3.5 rounded-2xl shadow-2xl border border-white/10 text-white transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] flex items-center gap-2 group",
                        isSidebarOpen ? "translate-x-20 opacity-0 invisible" : "translate-x-0 opacity-100 visible"
                    )}
                >
                    <SlidersHorizontal size={20} className="text-blue-400 group-hover:scale-110 transition-transform" />
                    <span className="font-bold text-sm hidden md:inline">Mở bộ lọc</span>
                </button>

                {/* --- ĐẢO NỔI: SIDEBAR KÍNH MỜ --- */}
                <div className={cn(
                    "absolute top-6 right-6 bottom-6 w-[320px] bg-[#0a0a0a]/60 backdrop-blur-2xl border border-white/10 rounded-3xl z-20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                    isSidebarOpen ? "translate-x-0 opacity-100 visible" : "translate-x-[120%] opacity-0 invisible"
                )}>
                    
                    {/* Header Sidebar */}
                    <div className="pt-6 pb-4 px-6 border-b border-white/5 shrink-0 flex justify-between items-start">
                        <div>
                            <h2 className="text-lg font-extrabold text-white flex items-center gap-2">
                                <Globe className="text-blue-500" size={22} /> Bộ lọc Bản đồ
                            </h2>
                            <p className="text-xs text-zinc-400 mt-1 font-medium">Khám phá lại dấu chân của bạn</p>
                        </div>
                        
                        {/* Nút Đóng */}
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 -mr-2 bg-white/5 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Body Sidebar */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-6">
                        
                        {/* Nút: Tất cả của tôi */}
                        <div>
                            <button 
                                 onClick={handleSelectMe}
                                 className={cn(
                                     "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm",
                                     filterType === 'me' 
                                         ? "bg-blue-600/90 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)] border border-blue-500/50" 
                                         : "bg-white/5 text-zinc-300 hover:bg-white/10 hover:text-white border border-transparent"
                                 )}
                            >
                                <MapPin size={18} className={filterType === 'me' ? "text-white" : "text-zinc-400"} /> 
                                Tất cả của tôi
                            </button>
                        </div>

                        {/* Danh sách Không gian */}
                        <div>
                            <h3 className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-3 px-2">
                                Bộ sưu tập Không gian
                            </h3>
                            
                            {boxes.length === 0 ? (
                                <p className="text-sm text-zinc-500 px-2 italic">Chưa tham gia không gian nào.</p>
                            ) : (
                                <div className="space-y-1">
                                    {boxes.map(box => (
                                        <div key={box.id} className="flex flex-col">
                                            {/* Tên Box */}
                                            <div className={cn(
                                                "flex items-center rounded-xl transition-colors",
                                                (filterType === 'box' && filterId === box.id) ? "bg-white/10" : "hover:bg-white/5"
                                            )}>
                                                <button 
                                                    onClick={() => toggleBox(box.id)}
                                                    className="p-3 text-zinc-400 hover:text-white transition-colors"
                                                >
                                                    {expandedBox === box.id ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                                                </button>
                                                
                                                <button 
                                                    onClick={() => handleSelectBox(box.id)}
                                                    className={cn(
                                                        "flex-1 text-left py-3 pr-4 font-bold text-[15px] transition-colors truncate",
                                                        (filterType === 'box' && filterId === box.id) ? "text-blue-400" : "text-zinc-200"
                                                    )}
                                                >
                                                    {box.name}
                                                </button>
                                            </div>

                                            {/* Danh sách Hành trình */}
                                            <div className={cn(
                                                "overflow-hidden transition-all duration-300 ease-in-out pl-4 pr-2",
                                                expandedBox === box.id ? "max-h-[500px] opacity-100 mt-1 mb-2" : "max-h-0 opacity-0"
                                            )}>
                                                <div className="border-l-2 border-white/10 ml-3 pl-2 py-1 space-y-1">
                                                    {boxJourneys[box.id] === undefined ? (
                                                        <p className="text-xs text-zinc-500 py-1 animate-pulse">Đang tải...</p>
                                                    ) : boxJourneys[box.id].length === 0 ? (
                                                        <p className="text-[11px] text-zinc-600 py-1 font-medium">Chưa có hành trình.</p>
                                                    ) : (
                                                        boxJourneys[box.id].map(journey => (
                                                            <button
                                                                key={journey.id}
                                                                onClick={() => handleSelectJourney(journey.id)}
                                                                className={cn(
                                                                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2.5",
                                                                    (filterType === 'journey' && filterId === journey.id) 
                                                                        ? "bg-blue-500/20 text-blue-400 font-bold" 
                                                                        : "text-zinc-400 hover:bg-white/10 hover:text-white font-medium"
                                                                )}
                                                            >
                                                                <Layers size={14} className={(filterType === 'journey' && filterId === journey.id) ? "text-blue-400" : "text-zinc-500"} />
                                                                <span className="truncate">{journey.name}</span>
                                                            </button>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
};