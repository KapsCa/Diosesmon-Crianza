import React, { useId } from 'react';

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
  /*
   * The gradient id has to be unique per instance. A static id means a page
   * that renders the mark twice (header and footer, for example) has two
   * elements with the same id, and every `url(#...)` reference resolves to the
   * first one, so the second instance silently takes the first one's gradient.
   * `useId` is stable across renders, which a module-level counter would not be.
   */
  const gradientId = `diosesmon-shell-${useId().replace(/:/g, '')}`;

  /*
   * When `showText` renders the wordmark, the visible text already carries the
   * accessible name and the svg must stay out of the accessibility tree,
   * otherwise a screen reader announces "Diosesmon Crianza" twice. When it does
   * not, the svg is the only content and has to carry the name itself.
   */
  const svgA11y = showText
    ? ({ 'aria-hidden': true } as const)
    : ({ role: 'img', 'aria-label': 'Diosesmon Crianza' } as const);

  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 96 96"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        {...svgA11y}
      >
        <defs>
          <linearGradient id={gradientId} x1="48" y1="11" x2="48" y2="88" gradientUnits="userSpaceOnUse">
            <stop stopColor="var(--color-brand-soft)" />
            <stop offset="1" stopColor="var(--color-brand-deep)" />
          </linearGradient>
        </defs>
        {/* egg shell */}
        <path
          d="M48 13C32 13 19 32.25 19 56C19 72.57 32 86 48 86C64 86 77 72.57 77 56C77 32.25 64 13 48 13Z"
          stroke={`url(#${gradientId})`}
          strokeWidth="5.5"
          strokeLinejoin="round"
        />
        {/* crown peaks */}
        <path d="M30.5 56V44.5L38 54.5L48 41L58 54.5L65.5 44.5V56Z" fill="var(--color-brand)" />
        {/* crown band */}
        <rect x="27" y="57.5" width="42" height="7.5" rx="3.75" fill="var(--color-brand)" />
      </svg>

      {showText && (
        <div className="flex flex-col text-left">
          <span className="font-['Sora'] text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            Diosesmon <span className="text-brand-soft font-extrabold">Crianza</span>
          </span>
          {/*
           * `ink-muted` rather than `ink-faint`: the tagline is 12px, and
           * `ink-faint` only reaches a 4.06:1 contrast ratio against the canvas,
           * below the 4.5:1 this size needs. `ink-muted` reaches 7.53:1.
           */}
          <span className="text-xs text-ink-muted font-mono">
            TACTICAL BREEDING OPTIMIZER
          </span>
        </div>
      )}
    </div>
  );
};

export default DiosesmonLogo;
