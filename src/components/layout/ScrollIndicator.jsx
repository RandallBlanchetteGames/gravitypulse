import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';

export function ScrollIndicator() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;

      // Check if the page is scrollable
      const isScrollable = scrollHeight > clientHeight + 10;
      
      // Check if we are near the bottom (within 50px)
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 50;

      // Show indicator if scrollable and not at bottom
      // Also, we typically only want this on mobile where stacking occurs
      const isMobile = window.innerWidth < 768;

      setIsVisible(isMobile && isScrollable && !isAtBottom);
    };

    // Initial check
    checkScroll();

    // Listeners
    window.addEventListener('scroll', checkScroll, { passive: true });
    window.addEventListener('resize', checkScroll, { passive: true });

    // Re-check periodically in case dynamic content changes height without firing resize
    const interval = setInterval(checkScroll, 1000);

    return () => {
      window.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`scroll-indicator-wrapper ${!isVisible ? 'hidden' : ''}`}>
      <ChevronDown className="gravity-wave-chevron" size={24} />
      <ChevronDown className="gravity-wave-chevron" size={24} />
      <ChevronDown className="gravity-wave-chevron" size={24} />
    </div>
  );
}
