import React from 'react';
import { ArrowRight } from 'lucide-react';
import { DiosesmonLogo } from '../atoms/DiosesmonLogo';
import { ServerRulesBanner } from '../molecules/ServerRulesBanner';

interface WelcomeScreenProps {
  /** Enters the planner. Passed in so this component owns no navigation state. */
  onStart: () => void;
}

/**
 * The presentation screen the application opens on.
 *
 * Reference: the *Selección de Cría* screen of the Stitch project
 * `354544052702975037`, which is where the emblem, the badges, the Sora heading and
 * the server-rules pill come from.
 *
 * Two things from that reference are deliberately NOT here, because copying them
 * would have meant inventing data: the global search box (`⌘K`, which the
 * application does not have) and the stat pills (`1,450,000 Pk$`, `24 Power Items`,
 * which nothing persists today). The rules pill is real: it is the
 * `ServerRulesBanner` that was already built, already tokenised in the slice 2 work,
 * and rendered nowhere until now.
 */
export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => (
  <section className="relative overflow-hidden rounded-3xl border border-brand/20 bg-surface px-6 py-12 sm:px-10 sm:py-16 flex flex-col items-center text-center gap-7">
    {/* Decorative only, and tokenised: this is the same dotted field that was
        verified compiling in the effects work. */}
    <div
      aria-hidden="true"
      className="absolute inset-0 opacity-[0.07] bg-[radial-gradient(var(--color-brand-soft)_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"
    />
    <div
      aria-hidden="true"
      className="absolute top-6 h-40 w-40 rounded-full bg-brand/25 blur-3xl pointer-events-none"
    />

    <div className="relative flex flex-col items-center gap-6">
      <div className="rounded-2xl border border-brand/30 bg-canvas p-4 shadow-[0_0_40px] shadow-brand/20">
        <DiosesmonLogo size={64} />
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2 font-mono text-[10px] uppercase tracking-wider">
        <span className="px-2.5 py-1 rounded-full border border-brand/30 bg-brand/15 text-brand-soft">
          Motor determinista
        </span>
        {/* Same injected release version as the footer, so the two cannot disagree. */}
        <span className="px-2.5 py-1 rounded-full border border-line bg-surface-sunken text-ink-faint">
          v{__APP_VERSION__}
        </span>
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="font-heading text-3xl sm:text-4xl font-black tracking-tight text-ink">
          Configuración de cría determinista
        </h2>
        <p className="mx-auto max-w-xl text-sm text-ink-muted">
          Motor genético de cálculo algorítmico. Diseña especímenes competitivos con 100% de
          predictibilidad y sin desperdicio de Pk$.
        </p>
      </div>

      {/*
        The gradient stops are measured, not eyeballed. The reference uses a violet to
        light-violet gradient under light text, and that fails AA at its light end:
        --color-ink on --color-brand-soft is 2.60 to 1. Keeping the gradient on the
        darker stops passes at both ends — 6.79 on brand-deep, 5.45 on brand — so the
        button keeps the look and the text stays readable. Hover stays inside the same
        two stops for the same reason.
      */}
      <button
        type="button"
        onClick={onStart}
        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-deep to-brand px-7 py-3.5 text-sm font-semibold text-ink shadow-[0_0_30px] shadow-brand/25 transition-all hover:from-brand hover:to-brand-deep hover:shadow-brand/40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-soft"
      >
        Comenzar a planificar
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </button>
    </div>

    <div className="relative w-full max-w-2xl">
      <ServerRulesBanner />
    </div>
  </section>
);

export default WelcomeScreen;
