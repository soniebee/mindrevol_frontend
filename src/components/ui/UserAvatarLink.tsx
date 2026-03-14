import React from 'react';
import { Link } from 'react-router-dom';
// Đảm bảo bạn đã có file avatar.tsx ở bước trước
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface UserAvatarLinkProps {
  userId: string;
  avatarUrl?: string;
  fullname?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl'; 
}

export const UserAvatarLink: React.FC<UserAvatarLinkProps> = ({
  userId,
  avatarUrl,
  fullname,
  className = "",
  size = "md"
}) => {
  
  // Mapping size sang class của Tailwind
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-16 w-16",
    xl: "h-32 w-32"
  };

  const handleClick = (e: React.MouseEvent) => {
    // Ngăn sự kiện click lan ra ngoài (ví dụ bấm avatar trong bài post không mở bài post)
    e.stopPropagation(); 
  };

  // Nếu không có userId thì chỉ hiển thị Avatar thường (không bấm được)
  if (!userId) {
     return (
        <Avatar className={`${sizeClasses[size]} ${className}`}>
          <AvatarImage src={avatarUrl} alt={fullname} />
          <AvatarFallback>{fullname?.charAt(0)?.toUpperCase()}</AvatarFallback>
        </Avatar>
     );
  }

  return (
    <Link 
      to={`/profile/${userId}`} 
      onClick={handleClick} 
      className={`inline-block transition-opacity hover:opacity-90 ${className}`}
    >
      <Avatar className={`${sizeClasses[size]} w-full h-full`}>
        <AvatarImage src={avatarUrl} alt={fullname} />
        <AvatarFallback>{fullname?.charAt(0)?.toUpperCase()}</AvatarFallback>
      </Avatar>
    </Link>
  );
};