import React from 'react';

export default function TsukiFlowLogo({ 
  width = '100%', 
  height = '100%', 
  color = 'currentColor', 
  className = '' 
}) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 500 500" 
      width={width} 
      height={height} 
      className={className}
      fill="none"
    >
      <defs>
        <linearGradient id="tsukiGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity="0.9" />
          <stop offset="100%" stopColor={color} stopOpacity="0.4" />
        </linearGradient>
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>
      
      {/* Outer Hexagon / Cube representing manufacturing & stability */}
      <path 
        d="M250 40 L450 150 L450 350 L250 460 L50 350 L50 150 Z" 
        stroke="url(#tsukiGradient)" 
        strokeWidth="24" 
        strokeLinejoin="round"
      />
      
      {/* Dynamic Flow Lines representing workflow and routing */}
      <g stroke={color} strokeWidth="18" strokeLinecap="round" strokeLinejoin="round">
        {/* T-Shape / Core Pillar */}
        <path d="M160 150 L340 150" />
        <path d="M250 150 L250 350" />
        
        {/* Connection Nodes */}
        <circle cx="160" cy="150" r="12" fill={color} />
        <circle cx="340" cy="150" r="12" fill={color} />
        <circle cx="250" cy="350" r="12" fill={color} />
      </g>
      
      {/* Orbiting accent indicating continuous optimization */}
      <path 
        d="M50 250 A 200 100 0 0 1 450 250" 
        stroke={color} 
        strokeWidth="6" 
        strokeLinecap="round" 
        strokeDasharray="10 15"
        opacity="0.6"
      />
    </svg>
  );
}
