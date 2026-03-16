import { useState, useRef, useEffect, useCallback } from 'react';

// [FIX] Thêm tham số dependency vào đây
export const useDraggableScroll = (dependency: any = null) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  // ... (Giữ nguyên các hàm onMouseDown, onMouseUp, onMouseMove) ...
  const onMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeft.current = scrollRef.current.scrollLeft;
  };

  const onMouseLeave = () => { setIsDragging(false); };
  const onMouseUp = () => { setIsDragging(false); };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 2;
    scrollRef.current.scrollLeft = scrollLeft.current - walk;
  };

  // Logic tính Active Index
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    
    const container = scrollRef.current;
    const containerCenter = container.getBoundingClientRect().left + container.offsetWidth / 2;
    
    const postCards = container.querySelectorAll('.post-card-wrapper');
    if (postCards.length === 0) return; // Không có bài thì thôi

    let closestIndex = 0;
    let minDistance = Number.MAX_VALUE;

    postCards.forEach((card, index) => {
        const rect = card.getBoundingClientRect();
        const cardCenter = rect.left + rect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);

        if (distance < minDistance) {
            minDistance = distance;
            closestIndex = index; 
        }
    });

    setActiveIndex((prev) => (prev !== closestIndex ? closestIndex : prev));
  }, []);

  // [FIX] useEffect lắng nghe sự thay đổi của dependency (dữ liệu load xong)
  useEffect(() => {
      const container = scrollRef.current;
      if (!container) return;

      container.addEventListener('scroll', handleScroll, { passive: true });
      
      // Delay nhẹ 100ms để đảm bảo DOM đã render xong khi data vừa về
      const timeoutId = setTimeout(() => {
          handleScroll();
      }, 100);

      return () => {
          container.removeEventListener('scroll', handleScroll);
          clearTimeout(timeoutId);
      };
  }, [handleScroll, dependency]); // [QUAN TRỌNG] Chạy lại khi dependency thay đổi

  // ... (Giữ nguyên hàm scrollToItem) ...
  const scrollToItem = (index: number) => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const postCards = container.querySelectorAll('.post-card-wrapper');
      
      if (postCards[index]) {
          const card = postCards[index] as HTMLElement;
          const cardLeft = card.offsetLeft;
          const cardWidth = card.offsetWidth;
          const containerWidth = container.offsetWidth;
          const centerPosition = cardLeft + cardWidth / 2 - containerWidth / 2;
          
          container.scrollTo({ left: centerPosition, behavior: 'smooth' });
      }
  };

  return {
    scrollRef,
    activeIndex,
    setActiveIndex,
    isDragging,
    handlers: { onMouseDown, onMouseLeave, onMouseUp, onMouseMove },
    scrollToItem
  };
};