import React from "react";

interface CVRefineSectionBackgroundProps {
  className?: string;
  children: React.ReactNode;
}

export const CVRefineSectionBackground: React.FC<CVRefineSectionBackgroundProps> = ({ 
  className = '',
  children 
}) => {
  return (
    <div className={`relative py-16 bg-gradient-to-r from-blue-50 to-cyan-50 overflow-hidden ${className}`}>
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 800 400" 
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="sectionGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgba(59,130,246,0.1)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0.1)" />
          </linearGradient>
        </defs>
        
        <path 
          d="M0,100 Q200,50 400,100 T800,80 L800,200 Q600,250 400,200 T0,220 Z" 
          fill="url(#sectionGradient)"
        />
        
        <circle cx="150" cy="150" r="30" fill="rgba(59,130,246,0.1)" />
        <circle cx="650" cy="250" r="40" fill="rgba(6,182,212,0.1)" />
      </svg>
      
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};