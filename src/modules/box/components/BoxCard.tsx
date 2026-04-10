import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Package } from 'lucide-react';
import { BoxResponse } from '../types';

interface BoxCardProps {
    box: BoxResponse;
}

export const BoxCard: React.FC<BoxCardProps> = ({ box }) => {
    // Kiểm tra xem avatar có phải là URL không hay là Emoji
    const isAvatarUrl = box.avatar?.includes('/') || box.avatar?.startsWith('http') || box.avatar?.startsWith('blob:');

    // Tính toán số lượng thành viên còn lại (nếu nhiều hơn số avatar preview)
    const remainingMembers = box.previewMemberAvatars && box.memberCount > box.previewMemberAvatars.length 
        ? box.memberCount - box.previewMemberAvatars.length 
        : 0;

    return (
        <Link 
            to={`/box/${box.id}`} 
            className="block group h-full"
        >
            <div className="w-full h-full bg-white dark:bg-[#18181b] rounded-[24px] border border-zinc-200 dark:border-zinc-800 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/50 hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden relative">
                
                {/* 1. Banner (Theme) */}
                <div className="w-full h-[105px] relative bg-zinc-200 dark:bg-zinc-800 shrink-0 overflow-hidden">
                    {box.themeSlug ? (
                        <img 
                            src={box.themeSlug} 
                            alt={`${box.name} banner`} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 opacity-50"></div>
                    )}
                    {/* Lớp phủ tối mờ nhẹ */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/30"></div>
                </div>

                {/* 2. Organic Squircle Notch (Khối liền mạch Avatar & Tên) */}
                <div className="relative -mt-12 mx-4 flex items-end z-10">
                    
                    {/* Phần Avatar */}
                    <div className="relative bg-white dark:bg-[#18181b] p-1.5 rounded-[22px] rounded-br-none z-20 -mr-[1px]">
                        <div className="w-14 h-14 rounded-[16px] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center overflow-hidden">
                            {isAvatarUrl ? (
                                <img 
                                    src={box.avatar} 
                                    className="w-full h-full object-cover" 
                                    alt="Box Avatar" 
                                />
                            ) : (
                                <div className="w-full h-full bg-zinc-100 dark:bg-zinc-700 flex items-center justify-center">
                                    {box.avatar === '📦' ? (
                                        <Package className="text-zinc-400 w-6 h-6" />
                                    ) : (
                                        <span className="text-2xl">{box.avatar}</span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Phần Tên */}
                    <div className="relative bg-white dark:bg-[#18181b] pr-5 pl-[7px] h-[46px] flex items-center rounded-r-[20px] rounded-bl-none z-10">
                        <svg 
                            className="absolute -top-[20px] -left-[5px] w-[21px] h-[21px] text-white dark:text-[#18181b] z-30" 
                            viewBox="0 0 20 20" 
                            fill="none" 
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path 
                                d="M0 20V0C0 11.0457 8.9543 20 20 20H0Z" 
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1"
                                strokeLinejoin="round"
                                shapeRendering="geometricPrecision"
                            />
                        </svg>
                        
                        <h3 className="font-bold text-[16px] text-zinc-900 dark:text-zinc-100 line-clamp-1 mt-1">
                            {box.name}
                        </h3>
                    </div>
                </div>

                {/* 3. Nội dung Body */}
                <div className="px-5 pb-5 pt-3 flex flex-col flex-1 justify-between gap-5">
                    {box.description && (
                        <p className="text-[13px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-medium">
                            {box.description}
                        </p>
                    )}

                    {/* 4. Footer - Member Stats */}
                    <div className="flex items-center gap-3 mt-auto pt-1">
                        <div className="flex items-center">
                            {box.previewMemberAvatars && box.previewMemberAvatars.length > 0 ? (
                                <div className="flex -space-x-2">
                                    {box.previewMemberAvatars.slice(0, 5).map((url, i) => (
                                        <img 
                                            key={i} 
                                            src={url} 
                                            alt="member" 
                                            className="w-6 h-6 rounded-full border-2 border-white dark:border-[#18181b] object-cover bg-zinc-200 dark:bg-zinc-700" 
                                        />
                                    ))}
                                    {remainingMembers > 0 && (
                                        <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#18181b] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-600 dark:text-zinc-300 z-10">
                                            +{remainingMembers}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="w-6 h-6 rounded-full border-2 border-white dark:border-[#18181b] bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                    <Users size={12} className="text-zinc-500 dark:text-zinc-400" />
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-1.5 text-[12px] font-semibold text-zinc-500 dark:text-zinc-400">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            {box.memberCount.toLocaleString()} Members
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
};