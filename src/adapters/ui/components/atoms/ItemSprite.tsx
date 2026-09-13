import React, { useState } from 'react';

export type ItemKey =
  | 'power_weight'
  | 'power_bracer'
  | 'power_belt'
  | 'power_lens'
  | 'power_band'
  | 'power_anklet'
  | 'everstone'
  | 'mirror_herb'
  | 'mint';

export interface ItemSpriteProps {
  item: ItemKey | string;
  size?: number;
  className?: string;
  showTooltip?: boolean;
}

export const ITEM_DATA_MAP: Record<
  string,
  {
    key: ItemKey;
    nameEs: string;
    nameEn: string;
    statName: string;
    color: string;
    effect: string;
    spriteUrl: string;
  }
> = {
  power_weight: {
    key: 'power_weight',
    nameEs: 'Pesa Recia',
    nameEn: 'Power Weight',
    statName: 'PS (HP)',
    color: '#22c55e',
    effect: '+4 HP / Pasa IV de PS al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-weight.png',
  },
  hp: {
    key: 'power_weight',
    nameEs: 'Pesa Recia',
    nameEn: 'Power Weight',
    statName: 'PS (HP)',
    color: '#22c55e',
    effect: '+4 HP / Pasa IV de PS al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-weight.png',
  },
  'pesa recia': {
    key: 'power_weight',
    nameEs: 'Pesa Recia',
    nameEn: 'Power Weight',
    statName: 'PS (HP)',
    color: '#22c55e',
    effect: '+4 HP / Pasa IV de PS al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-weight.png',
  },
  power_bracer: {
    key: 'power_bracer',
    nameEs: 'Brazal Recio',
    nameEn: 'Power Bracer',
    statName: 'Ataque (Atk)',
    color: '#ef4444',
    effect: '+4 Attack / Pasa IV de Ataque al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-bracer.png',
  },
  attack: {
    key: 'power_bracer',
    nameEs: 'Brazal Recio',
    nameEn: 'Power Bracer',
    statName: 'Ataque (Atk)',
    color: '#ef4444',
    effect: '+4 Attack / Pasa IV de Ataque al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-bracer.png',
  },
  'brazal recio': {
    key: 'power_bracer',
    nameEs: 'Brazal Recio',
    nameEn: 'Power Bracer',
    statName: 'Ataque (Atk)',
    color: '#ef4444',
    effect: '+4 Attack / Pasa IV de Ataque al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-bracer.png',
  },
  power_belt: {
    key: 'power_belt',
    nameEs: 'Cinto Recio',
    nameEn: 'Power Belt',
    statName: 'Defensa (Def)',
    color: '#f97316',
    effect: '+4 Defense / Pasa IV de Defensa al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-belt.png',
  },
  defense: {
    key: 'power_belt',
    nameEs: 'Cinto Recio',
    nameEn: 'Power Belt',
    statName: 'Defensa (Def)',
    color: '#f97316',
    effect: '+4 Defense / Pasa IV de Defensa al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-belt.png',
  },
  'cinto recio': {
    key: 'power_belt',
    nameEs: 'Cinto Recio',
    nameEn: 'Power Belt',
    statName: 'Defensa (Def)',
    color: '#f97316',
    effect: '+4 Defense / Pasa IV de Defensa al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-belt.png',
  },
  power_lens: {
    key: 'power_lens',
    nameEs: 'Lente Recia',
    nameEn: 'Power Lens',
    statName: 'At. Especial (SpA)',
    color: '#a855f7',
    effect: '+4 Sp. Att / Pasa IV de At. Especial al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-lens.png',
  },
  spatk: {
    key: 'power_lens',
    nameEs: 'Lente Recia',
    nameEn: 'Power Lens',
    statName: 'At. Especial (SpA)',
    color: '#a855f7',
    effect: '+4 Sp. Att / Pasa IV de At. Especial al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-lens.png',
  },
  'lente recia': {
    key: 'power_lens',
    nameEs: 'Lente Recia',
    nameEn: 'Power Lens',
    statName: 'At. Especial (SpA)',
    color: '#a855f7',
    effect: '+4 Sp. Att / Pasa IV de At. Especial al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-lens.png',
  },
  power_band: {
    key: 'power_band',
    nameEs: 'Banda Recia',
    nameEn: 'Power Band',
    statName: 'Def. Especial (SpD)',
    color: '#eab308',
    effect: '+4 Sp. Def / Pasa IV de Def. Especial al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-band.png',
  },
  spdef: {
    key: 'power_band',
    nameEs: 'Banda Recia',
    nameEn: 'Power Band',
    statName: 'Def. Especial (SpD)',
    color: '#eab308',
    effect: '+4 Sp. Def / Pasa IV de Def. Especial al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-band.png',
  },
  'banda recia': {
    key: 'power_band',
    nameEs: 'Banda Recia',
    nameEn: 'Power Band',
    statName: 'Def. Especial (SpD)',
    color: '#eab308',
    effect: '+4 Sp. Def / Pasa IV de Def. Especial al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-band.png',
  },
  power_anklet: {
    key: 'power_anklet',
    nameEs: 'Franja Recia',
    nameEn: 'Power Anklet',
    statName: 'Velocidad (Vel)',
    color: '#0ea5e9',
    effect: '+4 Speed / Pasa IV de Velocidad al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-anklet.png',
  },
  speed: {
    key: 'power_anklet',
    nameEs: 'Franja Recia',
    nameEn: 'Power Anklet',
    statName: 'Velocidad (Vel)',
    color: '#0ea5e9',
    effect: '+4 Speed / Pasa IV de Velocidad al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-anklet.png',
  },
  'franja recia': {
    key: 'power_anklet',
    nameEs: 'Franja Recia',
    nameEn: 'Power Anklet',
    statName: 'Velocidad (Vel)',
    color: '#0ea5e9',
    effect: '+4 Speed / Pasa IV de Velocidad al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-anklet.png',
  },
  everstone: {
    key: 'everstone',
    nameEs: 'Piedra Eterna',
    nameEn: 'Everstone',
    statName: 'Naturaleza',
    color: '#ffffff',
    effect: 'Transmite la Naturaleza del portador al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/everstone.png',
  },
  nature: {
    key: 'everstone',
    nameEs: 'Piedra Eterna',
    nameEn: 'Everstone',
    statName: 'Naturaleza',
    color: '#ffffff',
    effect: 'Transmite la Naturaleza del portador al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/everstone.png',
  },
  'piedra eterna': {
    key: 'everstone',
    nameEs: 'Piedra Eterna',
    nameEn: 'Everstone',
    statName: 'Naturaleza',
    color: '#ffffff',
    effect: 'Transmite la Naturaleza del portador al 100%',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/everstone.png',
  },
  mirror_herb: {
    key: 'mirror_herb',
    nameEs: 'Hierba Copia',
    nameEn: 'Mirror Herb',
    statName: 'Habilidad',
    color: '#10b981',
    effect: 'Transfiere la Habilidad del portador (estándar u oculta)',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mirror-herb.png',
  },
  'hierba copia': {
    key: 'mirror_herb',
    nameEs: 'Hierba Copia',
    nameEn: 'Mirror Herb',
    statName: 'Habilidad',
    color: '#10b981',
    effect: 'Transfiere la Habilidad del portador (estándar u oculta)',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mirror-herb.png',
  },
  mint: {
    key: 'mint',
    nameEs: 'Menta de Naturaleza',
    nameEn: 'Nature Mint',
    statName: 'Naturaleza',
    color: '#34d399',
    effect: 'Cambia los modificadores de estadísticas a la naturaleza indicada',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/adamant-mint.png',
  },
  menta: {
    key: 'mint',
    nameEs: 'Menta de Naturaleza',
    nameEn: 'Nature Mint',
    statName: 'Naturaleza',
    color: '#34d399',
    effect: 'Cambia los modificadores de estadísticas a la naturaleza indicada',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/adamant-mint.png',
  },
  nature_mint: {
    key: 'mint',
    nameEs: 'Menta de Naturaleza',
    nameEn: 'Nature Mint',
    statName: 'Naturaleza',
    color: '#34d399',
    effect: 'Cambia los modificadores de estadísticas a la naturaleza indicada',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/adamant-mint.png',
  },
};

export const ItemSprite: React.FC<ItemSpriteProps> = ({
  item,
  size = 24,
  className = '',
  showTooltip = false,
}) => {
  const [hasError, setHasError] = useState(false);
  const normalizedKey = (item || '').toLowerCase().trim();
  const info = ITEM_DATA_MAP[normalizedKey] || {
    key: 'power_bracer' as ItemKey,
    nameEs: item,
    nameEn: item,
    statName: '',
    color: '#94a3b8',
    effect: 'Objeto Recio de Crianza',
    spriteUrl: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/power-bracer.png',
  };

  const titleText = `${info.nameEs} (${info.nameEn}) • ${info.effect}`;

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 ${className}`}
      title={showTooltip ? titleText : undefined}
      style={{ width: size, height: size }}
    >
      {!hasError ? (
        <img
          src={info.spriteUrl}
          alt={info.nameEs}
          width={size}
          height={size}
          loading="lazy"
          className="object-contain drop-shadow"
          style={{
            imageRendering: 'pixelated',
            width: `${size}px`,
            height: `${size}px`,
          }}
          onError={() => setHasError(true)}
        />
      ) : (
        /* Fallback SVG representativo del brazal / piedra con los colores oficiales */
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="none"
          className="drop-shadow"
        >
          {info.key === 'everstone' ? (
            <g>
              <ellipse cx="12" cy="12" rx="9" ry="7" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
              <ellipse cx="11" cy="11" rx="6" ry="4" fill="#94a3b8" />
              <circle cx="14" cy="10" r="1.5" fill="#f8fafc" opacity="0.8" />
            </g>
          ) : info.key === 'mirror_herb' ? (
            <g>
              {/* Hoja / Hierba Copia */}
              <path d="M 6 18 C 6 12, 10 7, 16 6 C 15 12, 12 16, 6 18 Z" fill="#10b981" stroke="#065f46" strokeWidth="1.2" />
              <path d="M 10 18 C 10 13, 14 9, 19 8 C 18 13, 15 17, 10 18 Z" fill="#34d399" stroke="#065f46" strokeWidth="1" />
            </g>
          ) : (
            <g>
              {/* Aro / Brazal exterior */}
              <circle cx="12" cy="12" r="9" fill={info.color} stroke="#0f172a" strokeWidth="1.5" />
              {/* Orificio interior */}
              <circle cx="12" cy="12" r="4.5" fill="#0b0f19" stroke="#0f172a" strokeWidth="1" />
              {/* Brillo de gema / banda */}
              <path
                d="M 6 10 Q 12 5 18 10"
                stroke="#ffffff"
                strokeWidth="1.2"
                strokeLinecap="round"
                opacity="0.6"
              />
            </g>
          )}
        </svg>
      )}
    </span>
  );
};

export default ItemSprite;
