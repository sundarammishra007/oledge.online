import React from 'react';
import { cn } from '../lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
  tagline?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export default function Logo({ className, showText = true, tagline, size = 'md' }: LogoProps) {
  const symbolSizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-36 h-36',
  };

  const textSizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-5xl',
    xl: 'text-6xl',
  };

  const taglineSizeClasses = {
    sm: 'text-[6px]',
    md: 'text-[10px]',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  return (
    <div className={cn("flex items-center gap-4", className)}>
      {/* "og" Symbol Mark */}
      <div className={cn("relative shrink-0 flex items-center justify-center", symbolSizeClasses[size])}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-2xl"
        >
          {/* Custom Stylized "og" Mark - High Fidelity Version */}
          <g filter="url(#glow)">
            {/* Lowercase 'o' */}
            <path
              d="M45 50 C 45 61, 36 70, 25 70 C 14 70, 5 61, 5 50 C 5 39, 14 30, 25 30 C 36 30, 45 39, 45 50 Z"
              stroke="url(#blueGradient)"
              strokeWidth="14"
              fill="none"
            />
            {/* Lowercase 'g' */}
            <path
              d="M85 30 L 85 70 C 85 85, 70 95, 50 95 C 35 95, 25 90, 25 90 M 85 50 C 85 61, 76 70, 65 70 C 54 70, 45 61, 45 50 C 45 39, 54 30, 65 30 C 76 30, 85 39, 85 50 Z"
              stroke="url(#blueGradient)"
              strokeWidth="14"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </g>

          <defs>
            <linearGradient id="blueGradient" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#60a5fa" />
              <stop offset="0.4" stopColor="#3b82f6" />
              <stop offset="0.6" stopColor="#2563eb" />
              <stop offset="1" stopColor="#1d4ed8" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col items-start text-left">
          <h1 className={cn(
            "font-black tracking-tight flex leading-[0.85] uppercase",
            textSizeClasses[size]
          )}>
            <span className="text-slate-900 dark:text-white">OL</span>
            <span className="text-[#3b82f6]">EDGE</span>
          </h1>
          {tagline && (
            <p className={cn(
              "font-light tracking-[0.05em] text-slate-500 dark:text-slate-400 mt-1.5",
              taglineSizeClasses[size]
            )}>
              {tagline}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
