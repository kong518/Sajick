import React from 'react';

interface SuwonWelfareLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const SuwonWelfareLogo: React.FC<SuwonWelfareLogoProps> = ({
  className = '',
  size = 'md',
}) => {
  // Height presets (crisp & proportional)
  const heightMap = {
    sm: 'h-8',
    md: 'h-11',
    lg: 'h-14',
    xl: 'h-18',
  };

  return (
    <div
      className={`inline-flex items-center gap-3 select-none ${className}`}
      style={{
        imageRendering: 'crisp-edges',
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
      }}
    >
      {/* 
        High-precision Crisp Vector CI Emblem 
        Official Suwon Welfare Center for the Disabled Star Emblem
      */}
      <svg
        className={`${heightMap[size]} w-auto aspect-square shrink-0`}
        viewBox="0 0 160 160"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        shapeRendering="geometricPrecision"
      >
        <defs>
          <linearGradient id="suwonStarGradient" x1="25" y1="15" x2="135" y2="145" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0060b6" />
            <stop offset="50%" stopColor="#0077c8" />
            <stop offset="100%" stopColor="#0092db" />
          </linearGradient>
          <filter id="crispShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="0.5" stdDeviation="0.5" floodColor="#000000" floodOpacity="0.15" />
          </filter>
        </defs>

        {/* 5-pointed Rounded Organic Star Body with vibrant true blue */}
        <path
          d="M 80 12
             C 87 12, 97 39, 107 46
             C 117 53, 145 54, 148 63
             C 151 72, 129 93, 126 104
             C 123 115, 134 141, 126 147
             C 118 153, 93 136, 80 136
             C 67 136, 42 153, 34 147
             C 26 141, 37 115, 34 104
             C 31 93, 9 72, 12 63
             C 15 54, 43 53, 53 46
             C 63 39, 73 12, 80 12 Z"
          fill="url(#suwonStarGradient)"
        />

        {/* Top Sprouts: Crisp Green & Orange Petals */}
        {/* Left Green Sprout Leaf */}
        <path
          d="M 69 49 C 64 43 68 36 74 38 C 79 40 77 48 69 49 Z"
          fill="#6db31e"
        />
        {/* Right Orange Sprout Leaf */}
        <path
          d="M 82 49 C 87 43 83 36 77 38 C 72 40 74 48 82 49 Z"
          fill="#f26f21"
        />

        {/* White Silhouette: Two companion figures with wheelchair forming heart unity */}
        {/* Figure 1 (Left - Person using Wheelchair) Head */}
        <circle cx="58" cy="65" r="7.5" fill="#ffffff" />
        {/* Figure 1 Body & Arm reaching to center */}
        <path
          d="M 52 76 
             C 52 76, 60 76, 66 83 
             C 70 88, 74 95, 76 95
             C 74 97, 66 93, 60 88
             C 55 84, 52 81, 52 76 Z"
          fill="#ffffff"
        />
        {/* Crisp Wheelchair Wheel Arc */}
        <path
          d="M 43 92
             A 16 16 0 1 0 66 112"
          stroke="#ffffff"
          strokeWidth="4.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Figure 2 (Right - Standing Companion) Head */}
        <circle cx="95" cy="69" r="7.5" fill="#ffffff" />
        {/* Figure 2 Body & Arm reaching to center */}
        <path
          d="M 93 79 
             C 96 79, 103 86, 102 110 
             C 101 113, 96 113, 95 106
             C 94 97, 91 90, 85 86
             C 79 83, 76 95, 74 95
             C 76 90, 81 80, 93 79 Z"
          fill="#ffffff"
        />

        {/* Central Heart-Connecting Handhold */}
        <path
          d="M 66 83
             C 71 85, 75 90, 75 95
             C 75 90, 79 85, 85 86
             C 81 92, 76 98, 75 102
             C 74 98, 69 92, 66 83 Z"
          fill="#ffffff"
        />
      </svg>

      {/* 
        High-Contrast, Crisp Typography 
        Exact 3-line layout matching official institution identity 
      */}
      <div className="flex flex-col justify-center leading-none text-left tracking-tight">
        <span
          className="text-[#2b2b2b] font-sans font-medium mb-1 tracking-tight"
          style={{
            fontSize: size === 'sm' ? '9px' : size === 'md' ? '11px' : size === 'lg' ? '13px' : '15px',
            letterSpacing: '-0.02em',
          }}
        >
          사회복지법인 수원중앙복지재단
        </span>
        <span
          className="text-[#0d0d0d] font-sans font-black tracking-tight"
          style={{
            fontSize: size === 'sm' ? '15px' : size === 'md' ? '19.5px' : size === 'lg' ? '24px' : '29px',
            lineHeight: 1.15,
            letterSpacing: '-0.03em',
          }}
        >
          수원시장애인종합복지관
        </span>
        <span
          className="text-[#4b5563] font-sans font-normal mt-0.5"
          style={{
            fontSize: size === 'sm' ? '7.5px' : size === 'md' ? '9px' : size === 'lg' ? '10.5px' : '12.5px',
            letterSpacing: '0.01em',
          }}
        >
          Suwon welfare Center for the Disabled
        </span>
      </div>
    </div>
  );
};
