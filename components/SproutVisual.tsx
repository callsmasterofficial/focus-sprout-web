'use client';

import React from 'react';
import { Palette } from '@/constants';

interface SproutVisualProps {
  level: number; // 1 to 6
  size?: number;
  className?: string;
  isFocusing?: boolean;
}

export function SproutVisual({ level = 2, size = 120, className = '' }: SproutVisualProps) {
  const renderContent = () => {
    switch (level) {
      case 1:
        // Dormant Seed in soil mound
        return (
          <g>
            <ellipse cx="60" cy="98" rx="42" ry="14" fill="#6B4C35" />
            <ellipse cx="60" cy="95" rx="36" ry="10" fill="#8A6246" />
            <ellipse cx="60" cy="88" rx="8" ry="12" fill="#DDA15E" transform="rotate(-15, 60, 88)" />
            <path d="M 60 76 Q 63 88 60 98" stroke="#BC6C25" strokeWidth="2" fill="none" />
            <path d="M 60 76 Q 63 68 67 65" stroke={Palette.sproutFresh} strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="67" cy="65" r="3" fill={Palette.sproutFresh} />
          </g>
        );

      case 2:
        // Tiny Sprout (Two fresh green leaves)
        return (
          <g>
            <ellipse cx="60" cy="100" rx="38" ry="12" fill="#6B4C35" />
            <ellipse cx="60" cy="97" rx="32" ry="8" fill="#8A6246" />
            <path d="M 60 96 Q 59 75 60 55" stroke={Palette.sproutFresh} strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 60 68 C 45 68 35 52 40 42 C 55 42 60 58 60 68 Z" fill={Palette.sproutFresh} />
            <path d="M 60 62 C 75 60 85 46 80 36 C 65 38 60 52 60 62 Z" fill={Palette.forestSprout} />
            <circle cx="44" cy="46" r="2.5" fill="#A7E8BD" />
          </g>
        );

      case 3:
        // Lush Foliage
        return (
          <g>
            <ellipse cx="60" cy="102" rx="38" ry="10" fill="#6B4C35" />
            <path d="M 60 100 Q 58 70 60 40" stroke={Palette.forestSprout} strokeWidth="5" fill="none" strokeLinecap="round" />
            <path d="M 60 80 C 35 80 25 65 32 55 C 48 55 58 70 60 80 Z" fill={Palette.sproutFresh} />
            <path d="M 60 75 C 85 75 95 60 88 50 C 72 50 62 65 60 75 Z" fill={Palette.forestMid} />
            <path d="M 60 55 C 40 48 38 32 48 24 C 58 28 60 44 60 55 Z" fill={Palette.sproutLight} />
            <path d="M 60 50 C 80 44 82 28 72 20 C 62 24 60 40 60 50 Z" fill={Palette.sproutFresh} />
            <path d="M 60 40 C 53 25 60 14 60 14 C 60 14 67 25 60 40 Z" fill={Palette.forestDeep} />
          </g>
        );

      case 4:
        // Young Sapling
        return (
          <g>
            <path d="M 57 104 L 59 55 L 61 55 L 63 104 Z" fill="#6B4C35" />
            <path d="M 59 70 Q 48 62 42 66" stroke="#6B4C35" strokeWidth="3" fill="none" strokeLinecap="round" />
            <path d="M 61 65 Q 72 58 78 62" stroke="#6B4C35" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="42" cy="62" r="14" fill={Palette.sproutFresh} />
            <circle cx="78" cy="58" r="14" fill={Palette.forestSprout} />
            <circle cx="60" cy="42" r="22" fill={Palette.forestMid} />
            <circle cx="50" cy="36" r="16" fill={Palette.sproutFresh} />
            <circle cx="70" cy="38" r="15" fill={Palette.sproutLight} />
            <ellipse cx="60" cy="104" rx="36" ry="8" fill="#583E2D" />
          </g>
        );

      case 5:
        // Thriving Tree
        return (
          <g>
            <ellipse cx="60" cy="106" rx="42" ry="7" fill="rgba(0,0,0,0.15)" />
            <path d="M 54 104 Q 57 75 58 52 L 62 52 Q 63 75 66 104 Z" fill="#583E2D" />
            <path d="M 58 68 Q 44 60 38 65" stroke="#583E2D" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 62 64 Q 76 56 82 62" stroke="#583E2D" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="60" cy="42" r="30" fill={Palette.forestDeep} />
            <circle cx="40" cy="50" r="19" fill={Palette.forestMid} />
            <circle cx="80" cy="48" r="19" fill={Palette.forestSprout} />
            <circle cx="48" cy="32" r="18" fill={Palette.sproutFresh} />
            <circle cx="72" cy="30" r="18" fill={Palette.sproutLight} />
            <circle cx="60" cy="24" r="15" fill={Palette.forestSprout} />
          </g>
        );

      case 6:
      default:
        // Blooming Evergreen
        return (
          <g>
            <ellipse cx="60" cy="106" rx="44" ry="7" fill="rgba(0,0,0,0.18)" />
            <path d="M 53 104 Q 57 72 58 50 L 62 50 Q 63 72 67 104 Z" fill="#4B3526" />
            <path d="M 58 66 Q 42 56 36 62" stroke="#4B3526" strokeWidth="4" fill="none" strokeLinecap="round" />
            <path d="M 62 62 Q 78 52 84 58" stroke="#4B3526" strokeWidth="4" fill="none" strokeLinecap="round" />
            <circle cx="60" cy="40" r="32" fill={Palette.forestDeep} />
            <circle cx="38" cy="48" r="20" fill={Palette.forestMid} />
            <circle cx="82" cy="46" r="20" fill={Palette.forestSprout} />
            <circle cx="46" cy="28" r="20" fill={Palette.sproutFresh} />
            <circle cx="74" cy="26" r="20" fill={Palette.sproutLight} />
            <circle cx="60" cy="20" r="16" fill={Palette.forestSprout} />
            {/* Blossoms */}
            <circle cx="40" cy="34" r="5" fill="#FFB703" />
            <circle cx="40" cy="34" r="2" fill="#FFFFFF" />
            <circle cx="78" cy="32" r="5" fill="#FB8500" />
            <circle cx="78" cy="32" r="2" fill="#FFFFFF" />
            <circle cx="60" cy="16" r="5" fill="#FFB703" />
            <circle cx="60" cy="16" r="2" fill="#FFFFFF" />
            <circle cx="52" cy="48" r="5" fill="#F72585" />
            <circle cx="68" cy="48" r="5" fill="#F72585" />
            <circle cx="60" cy="40" r="36" stroke="#95D5B2" strokeWidth="1" strokeDasharray="4 4" fill="none" />
          </g>
        );
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center transition-transform duration-300 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox="0 0 120 120">
        {renderContent()}
      </svg>
    </div>
  );
}

