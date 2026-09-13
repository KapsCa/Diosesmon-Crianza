import React from 'react';

interface DiosesmonLogoProps {
  size?: number;
  className?: string;
  showText?: boolean;
}

export const DiosesmonLogo: React.FC<DiosesmonLogoProps> = ({
  size = 40,
  className = '',
  showText = false,
}) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      {/* Brand literals (#A78BFA, #7C3AED) are deliberate; a later palette PR will replace them with design tokens. */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        role="img"
        aria-label="Diosesmon Crianza"
      >
        <defs>
          <linearGradient id="diosesmonShell" x1="48" y1="11" x2="48" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="#A78BFA" />
            <stop offset="1" stopColor="#6D28D9" />
          </linearGradient>
        </defs>
        {/* egg shell */}
        <path
          d="M48 13C32 13 19 32.25 19 56C19 72.57 32 86 48 86C64 86 77 72.57 77 56C77 32.25 64 13 48 13Z"
          stroke="url(#diosesmonShell)"
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        {/* crown peaks */}
        <path d="M30.5 56V44.5L38 54.5L48 41L58 54.5L65.5 44.5V56Z" fill="#7C3AED" />
        {/* crown band */}
        <rect x="27" y="57.5" width="42" height="7.5" rx="3.75" fill="#7C3AED" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          {/* #A78BFA and #88929B below are brand literals; a later palette PR will replace them with design tokens. */}
          <span className="font-['Sora'] text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Diosesmon <span className="text-[#A78BFA] font-extrabold">Crianza</span>
          </span>
          <span className="text-xs text-[#88929B] font-mono">
            TACTICAL BREEDING OPTIMIZER
          </span>
        </div>
      )}
    </div>
  );
};

export default DiosesmonLogo;
