import React from 'react';
import { Sparkles, Zap, Shield, Heart, Sword, Gauge, Wand2 } from 'lucide-react';
import { ItemSprite } from '../atoms/ItemSprite';

export interface IVTargetConfig {
  hp: number; // 31 | 0 | -1 (X / irrelevant)
  attack: number;
  defense: number;
  spatk: number;
  spdef: number;
  speed: number;
  nature: string;
  useEverstone: boolean;
  hasHiddenAbility: boolean;
}

interface IVProfileBuilderProps {
  config: IVTargetConfig;
  onChange: (newConfig: IVTargetConfig) => void;
}

export const COMMON_NATURES = [
  { name: 'Adamant', es: 'Firme', plus: 'Ataque', minus: 'At. Esp.' },
  { name: 'Jolly', es: 'Alegre', plus: 'Velocidad', minus: 'At. Esp.' },
  { name: 'Modest', es: 'Modesta', plus: 'At. Esp.', minus: 'Ataque' },
  { name: 'Timid', es: 'Miedosa', plus: 'Velocidad', minus: 'Ataque' },
  { name: 'Bold', es: 'Osada', plus: 'Defensa', minus: 'Ataque' },
  { name: 'Calm', es: 'Serena', plus: 'Def. Esp.', minus: 'Ataque' },
  { name: 'Impish', es: 'Agitada', plus: 'Defensa', minus: 'At. Esp.' },
  { name: 'Careful', es: 'Cauta', plus: 'Def. Esp.', minus: 'At. Esp.' },
  { name: 'Hasty', es: 'Activa', plus: 'Velocidad', minus: 'Defensa' },
  { name: 'Naive', es: 'Ingenua', plus: 'Velocidad', minus: 'Def. Esp.' },
  { name: 'Brave', es: 'Audaz', plus: 'Ataque', minus: 'Velocidad' },
  { name: 'Quiet', es: 'Mansa', plus: 'At. Esp.', minus: 'Velocidad' },
  { name: 'Relaxed', es: 'Plácida', plus: 'Defensa', minus: 'Velocidad' },
  { name: 'Sassy', es: 'Grosera', plus: 'Def. Esp.', minus: 'Velocidad' },
];

export const IVProfileBuilder: React.FC<IVProfileBuilderProps> = ({ config, onChange }) => {
  // Preset handlers
  const applyPreset = (
    preset:
      | '5x31_physical'
      | '5x31_special'
      | '6x31_absolute'
      | 'trick_room'
      | 'trick_room_special'
  ) => {
    switch (preset) {
      case '5x31_physical':
        onChange({
          ...config,
          hp: 31,
          attack: 31,
          defense: 31,
          spatk: -1, // X / irrelevante
          spdef: 31,
          speed: 31,
          nature: config.nature || 'Adamant',
        });
        break;
      case '5x31_special':
        onChange({
          ...config,
          hp: 31,
          attack: 0, // 0 Atk for minimum Foul Play / confusion (or irrelevant)
          defense: 31,
          spatk: 31,
          spdef: 31,
          speed: 31,
          nature: config.nature || 'Modest',
        });
        break;
      case 'trick_room':
        // Trick Room Físico: 0 IVs Velocidad, naturaleza -Velocidad (Audaz), SpAtk irrelevante (X)
        onChange({
          ...config,
          hp: 31,
          attack: 31,
          defense: 31,
          spatk: -1, // Irrelevante
          spdef: 31,
          speed: 0, // Estrictamente 0 IVs en Velocidad
          nature: 'Brave', // +Ataque, -Velocidad
          useEverstone: true,
        });
        break;
      case 'trick_room_special':
        // Trick Room Especial: 0 IVs Velocidad, naturaleza -Velocidad (Mansa), Ataque 0/irrelevante
        onChange({
          ...config,
          hp: 31,
          attack: 0, // 0 Atk o irrelevante
          defense: 31,
          spatk: 31,
          spdef: 31,
          speed: 0, // Estrictamente 0 IVs en Velocidad
          nature: 'Quiet', // +At. Esp., -Velocidad
          useEverstone: true,
        });
        break;
      case '6x31_absolute':
        onChange({
          ...config,
          hp: 31,
          attack: 31,
          defense: 31,
          spatk: 31,
          spdef: 31,
          speed: 31,
        });
        break;
    }
  };

  const statItems: {
    key: keyof Omit<IVTargetConfig, 'nature' | 'useEverstone' | 'hasHiddenAbility'>;
    label: string;
    icon: React.ReactNode;
  }[] = [
    { key: 'hp', label: 'PS (HP)', icon: <Heart className="w-3.5 h-3.5" /> },
    { key: 'attack', label: 'Ataque', icon: <Sword className="w-3.5 h-3.5" /> },
    { key: 'defense', label: 'Defensa', icon: <Shield className="w-3.5 h-3.5" /> },
    { key: 'spatk', label: 'At. Esp.', icon: <Wand2 className="w-3.5 h-3.5" /> },
    { key: 'spdef', label: 'Def. Esp.', icon: <Shield className="w-3.5 h-3.5" /> },
    { key: 'speed', label: 'Velocidad', icon: <Gauge className="w-3.5 h-3.5" /> },
  ];

  const handleStatToggle = (statKey: keyof Omit<IVTargetConfig, 'nature' | 'useEverstone' | 'hasHiddenAbility'>) => {
    const current = config[statKey];
    let next = 31;
    if (current === 31) next = -1; // toggle to X (irrelevante)
    else if (current === -1) next = 0; // toggle to 0 (Trick Room o Foul Play)
    else next = 31; // toggle back to 31
    onChange({ ...config, [statKey]: next });
  };

  return (
    <div className="flex flex-col gap-4 p-4 rounded-xl bg-surface border border-line">
      {/* Header explicativo sin botones prematuros */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-line pb-3">
        <div>
          <span className="text-sm font-semibold text-white flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-brand-soft" />
            Constructor de Perfil de IVs
          </span>
          <p className="text-xs text-ink-muted">
            Haz clic en cualquier atributo para alternar entre 31 (Máximo), X (Irrelevante) y 0 (Mínimo).
          </p>
        </div>
      </div>

      {/* 6 Stats Selector Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {statItems.map(({ key, label, icon }) => {
          const val = config[key];
          const is31 = val === 31;
          const is0 = val === 0;

          return (
            <div
              key={key}
              onClick={() => handleStatToggle(key)}
              className={`p-2.5 rounded-lg border flex flex-col items-center justify-between cursor-pointer transition-all select-none ${
                is31
                  ? 'bg-success/10 border-success/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
                  : is0
                  ? 'bg-warning/10 border-warning/50 shadow-[0_0_12px_rgba(245,158,11,0.15)]'
                  : 'bg-surface-sunken/60 border-line opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-ink">
                <span className="text-ink-faint">{icon}</span>
                <span>{label}</span>
              </div>

              <div className="my-1.5 flex items-center justify-center">
                <span
                  className={`text-xl font-bold font-mono ${
                    is31
                      ? 'text-success'
                      : is0
                      ? 'text-warning'
                      : 'text-ink-faint'
                  }`}
                >
                  {is31 ? '31' : is0 ? '0' : 'X'}
                </span>
              </div>

              <span className="text-[10px] text-ink-muted font-mono">
                {is31 ? '31 (Máximo)' : is0 ? '0 (Mínimo)' : 'X (Irrelevante)'}
              </span>
            </div>
          );
        })}
      </div>

      {/* Presets Rápidos: ubicados AL FINAL de elegir stats */}
      <div className="p-3 rounded-lg bg-surface-sunken/40 border border-line/80 flex flex-col gap-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
          <span className="text-xs font-semibold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-brand-soft" />
            Presets rápidos recomendados (aplicar luego de revisar stats):
          </span>
          <span className="text-[11px] text-ink-muted">
            En 5x31 el 6º IV es irrelevante (X) salvo en Trick Room (0 IVs en Vel).
          </span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => applyPreset('5x31_physical')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-brand/10 text-brand-soft border border-brand/30 hover:bg-brand/20 hover:border-brand transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>⚔️ 5x31 Físico (-SpA Irrelevante)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('5x31_special')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-brand/10 text-brand-soft border border-brand/30 hover:bg-brand/20 hover:border-brand transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🔮 5x31 Especial (0 Atk / Irrelevante)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('trick_room')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-warning/10 text-warning border border-warning/40 hover:bg-warning/20 hover:border-warning transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🌀 Trick Room (0 Vel • Audaz)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('trick_room_special')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-warning/10 text-warning border border-warning/30 hover:bg-warning/20 hover:border-warning transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>🌀 Trick Room Esp. (0 Vel • Mansa)</span>
          </button>
          <button
            type="button"
            onClick={() => applyPreset('6x31_absolute')}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-success/10 text-success border border-success/30 hover:bg-success/20 hover:border-success transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>💎 6x31 Absoluto (Todos 31)</span>
          </button>
        </div>
      </div>

      {/* Unified Nature & Ability Controls */}
      {(() => {
        const selectedNatureObj = COMMON_NATURES.find((nat) => nat.name === config.nature) || {
          name: config.nature || 'Adamant',
          es: config.nature || 'Firme',
          plus: 'Stat',
          minus: 'Stat',
        };

        return (
          <div className="p-3 rounded-xl bg-surface-sunken/60 border border-line flex flex-col gap-2.5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Naturaleza & Piedra Eterna */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
                  <Zap className="w-3.5 h-3.5 text-brand-soft" />
                  <span>Naturaleza:</span>
                </div>

                <select
                  value={config.nature}
                  onChange={(e) => onChange({ ...config, nature: e.target.value })}
                  className="text-xs px-2.5 py-1.5 rounded-lg bg-canvas border border-line-strong text-white focus:border-brand focus:outline-none"
                >
                  {COMMON_NATURES.map((nat) => (
                    <option key={nat.name} value={nat.name}>
                      {nat.es} ({nat.name}) — +{nat.plus}, -{nat.minus}
                    </option>
                  ))}
                </select>

                <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer select-none ml-1">
                  <input
                    type="checkbox"
                    checked={config.useEverstone}
                    onChange={(e) => onChange({ ...config, useEverstone: e.target.checked })}
                    className="rounded border-line-strong text-brand-soft focus:ring-brand bg-surface-raised cursor-pointer"
                  />
                  <span className={config.useEverstone ? 'text-brand-soft font-medium' : 'text-ink-muted'}>
                    Usar Piedra Eterna
                  </span>
                </label>
              </div>

              {/* Habilidad (Hierba Copia) */}
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-ink cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={config.hasHiddenAbility}
                    onChange={(e) => onChange({ ...config, hasHiddenAbility: e.target.checked })}
                    className="rounded border-line-strong text-success focus:ring-success bg-surface-raised cursor-pointer"
                  />
                  <Sparkles className="w-3.5 h-3.5 text-success" />
                  <span className={config.hasHiddenAbility ? 'text-success font-medium' : 'text-ink-muted'}>
                    Habilidad (Hierba Copia)
                  </span>
                </label>
              </div>
            </div>

            {/* Micro-indicadores informativos en una sola línea compacta */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-line/60 text-[11px]">
              {config.useEverstone ? (
                <div className="flex items-center gap-1.5 text-brand-soft">
                  <ItemSprite item="everstone" size={15} />
                  <span>
                    <strong>Piedra Eterna:</strong> Hereda {selectedNatureObj.es} directamente si un progenitor la posee (rama trazada en el árbol).
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-success">
                  <ItemSprite item="mint" size={15} />
                  <span>
                    <strong>Menta recomendada:</strong> Menta {selectedNatureObj.es} (+{selectedNatureObj.plus}, -{selectedNatureObj.minus}) al eclosionar. Ahorra 50% de cruces.
                  </span>
                </div>
              )}

              {config.hasHiddenAbility && (
                <div className="flex items-center gap-1.5 text-success">
                  <ItemSprite item="hierba copia" size={15} />
                  <span>
                    <strong>Hierba Copia:</strong> Solo se transfiere si uno de los progenitores ya la posee.
                  </span>
                </div>
              )}
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default IVProfileBuilder;
