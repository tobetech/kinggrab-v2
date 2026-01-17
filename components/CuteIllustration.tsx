'use client'

interface CuteIllustrationProps {
  type?: 'login' | 'dashboard' | 'empty'
  className?: string
}

export default function CuteIllustration({ type = 'login', className = '' }: CuteIllustrationProps) {
  if (type === 'login') {
    return (
      <div className={`${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Cute cloud background */}
          <circle cx="50" cy="50" r="20" fill="#ffd6e8" opacity="0.6" />
          <circle cx="70" cy="50" r="25" fill="#ffe4ec" opacity="0.6" />
          <circle cx="150" cy="80" r="18" fill="#fff0f5" opacity="0.6" />
          <circle cx="170" cy="80" r="22" fill="#ffd6e8" opacity="0.6" />
          
          {/* Cute star */}
          <g transform="translate(100, 100)">
            <path
              d="M0,-30 L9,-9 L30,-9 L12,3 L18,24 L0,12 L-18,24 L-12,3 L-30,-9 L-9,-9 Z"
              fill="#f472b6"
              opacity="0.8"
            />
            <circle cx="0" cy="0" r="8" fill="#ffd6e8" />
          </g>
          
          {/* Cute heart */}
          <g transform="translate(160, 40)">
            <path
              d="M0,0 C0,-10 -10,-15 -15,-10 C-20,-5 -20,5 -15,10 L0,20 L15,10 C20,5 20,-5 15,-10 C10,-15 0,-10 0,0 Z"
              fill="#ec4899"
              opacity="0.7"
            />
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'dashboard') {
    return (
      <div className={`${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Cute chart illustration */}
          <rect x="30" y="120" width="20" height="50" fill="#f9a8d4" rx="4" />
          <rect x="60" y="100" width="20" height="70" fill="#f472b6" rx="4" />
          <rect x="90" y="80" width="20" height="90" fill="#ec4899" rx="4" />
          <rect x="120" y="110" width="20" height="60" fill="#db2777" rx="4" />
          
          {/* Cute face on top */}
          <circle cx="100" cy="40" r="25" fill="#ffe4ec" />
          <circle cx="92" cy="35" r="4" fill="#831843" />
          <circle cx="108" cy="35" r="4" fill="#831843" />
          <path
            d="M 92 48 Q 100 55 108 48"
            stroke="#831843"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Sparkles */}
          <g transform="translate(50, 30)">
            <path d="M0,0 L3,3 M3,0 L0,3" stroke="#f472b6" strokeWidth="2" />
          </g>
          <g transform="translate(150, 50)">
            <path d="M0,0 L3,3 M3,0 L0,3" stroke="#f472b6" strokeWidth="2" />
          </g>
        </svg>
      </div>
    )
  }

  if (type === 'empty') {
    return (
      <div className={`${className}`}>
        <svg viewBox="0 0 200 200" className="w-full h-full">
          {/* Cute sad face */}
          <circle cx="100" cy="100" r="50" fill="#ffe4ec" />
          <circle cx="85" cy="90" r="6" fill="#831843" />
          <circle cx="115" cy="90" r="6" fill="#831843" />
          <path
            d="M 85 120 Q 100 110 115 120"
            stroke="#831843"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
          />
        </svg>
      </div>
    )
  }

  return null
}
