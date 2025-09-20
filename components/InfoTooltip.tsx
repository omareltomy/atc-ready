"use client";

import { useState, useEffect } from 'react';

interface InfoTooltipProps {
  content: string;
}

export default function InfoTooltip({ content }: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="ml-2 w-5 h-5 rounded-full border-2 border-gray-400 bg-white text-gray-600 hover:bg-[#5E6C84] hover:border-[#5E6C84] hover:text-white transition-all duration-200 flex items-center justify-center text-sm font-medium"
        title="More information"
      >
        ?
      </button>
      
      {showTooltip && (
        <div className={`absolute mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 ${
          isMobile 
            ? 'right-0 w-72 max-w-[90vw]' 
            : 'left-1/2 transform -translate-x-1/2 w-80'
        }`}>
          <div className="text-sm text-gray-800 whitespace-pre-line">
            {content}
          </div>
          {/* Arrow pointing up */}
          <div className={`absolute bottom-full w-0 h-0 border-l-[6px] border-r-[6px] border-b-[6px] border-l-transparent border-r-transparent border-b-white ${
            isMobile 
              ? 'right-6' 
              : 'left-1/2 transform -translate-x-1/2'
          }`}></div>
          <div className={`absolute bottom-full w-0 h-0 border-l-[7px] border-r-[7px] border-b-[7px] border-l-transparent border-r-transparent border-b-gray-200 mb-[-1px] ${
            isMobile 
              ? 'right-[23px]' 
              : 'left-1/2 transform -translate-x-1/2'
          }`}></div>
        </div>
      )}
    </div>
  );
}
