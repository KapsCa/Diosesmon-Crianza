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
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0 drop-shadow-[0_0_12px_rgba(168,85,247,0.45)]"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e1338" />
            <stop offset="50%" stopColor="#13172c" />
            <stop offset="100%" stopColor="#0a0e1a" />
          </linearGradient>
          <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>
          <linearGradient id="dnaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#a855f7" />
          </linearGradient>
          <linearGradient id="dnaGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
          <linearGradient id="crownGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>

        {/* Outer mystic shield */}
        <path
          d="M50 8L86 22V52C86 73 70.5 90 50 96C29.5 90 14 73 14 52V22L50 8Z"
          fill="url(#shieldGrad)"
          stroke="url(#borderGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Crown upper detail */}
        <path
          d="M38 20L44 26L50 16L56 26L62 20L60 28H40L38 20Z"
          fill="url(#crownGrad)"
        />

        {/* DNA Strand 1 (Sine wave) */}
        <path
          d="M35 34C43 40 47 46 50 51C53 56 57 62 65 68"
          stroke="url(#dnaGrad1)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        {/* DNA Strand 2 (Opposite Sine wave) */}
        <path
          d="M65 34C57 40 53 46 50 51C47 56 43 62 35 68"
          stroke="url(#dnaGrad2)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* DNA Hydrogen Base rungs */}
        <line x1="40" y1="38" x2="60" y2="38" stroke="#a855f7" strokeWidth="2" strokeDasharray="2 2" />
        <line x1="45" y1="46" x2="55" y2="46" stroke="#c084fc" strokeWidth="2.5" />
        <line x1="45" y1="56" x2="55" y2="56" stroke="#38bdf8" strokeWidth="2.5" />
        <line x1="40" y1="64" x2="60" y2="64" stroke="#06b6d4" strokeWidth="2" strokeDasharray="2 2" />

        {/* Divine Lightning bolt central overlay */}
        <path
          d="M53 32L42 52H51L47 70L62 48H52L56 32H53Z"
          fill="url(#lightningGrad)"
          stroke="#ca8a04"
          strokeWidth="1"
          opacity="0.95"
          className="drop-shadow-[0_0_6px_rgba(250,204,21,0.6)]"
        />

        {/* Nucleotide node dots */}
        <circle cx="35" cy="34" r="3" fill="#c084fc" />
        <circle cx="65" cy="34" r="3" fill="#38bdf8" />
        <circle cx="50" cy="51" r="2.5" fill="#facc15" />
        <circle cx="35" cy="68" r="3" fill="#38bdf8" />
        <circle cx="65" cy="68" r="3" fill="#c084fc" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-['Sora'] text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Diosesmon <span className="text-purple-400 font-extrabold">Crianza</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono border border-purple-500/40 uppercase tracking-wider">
              PRO
            </span>
          </span>
          <span className="text-xs text-slate-400 font-mono">
            Tactical Breeding Optimizer • Diosesmon Server Rules
          </span>
        </div>
      )}
    </div>
  );
};

export default DiosesmonLogo;
