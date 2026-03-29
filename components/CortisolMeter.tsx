'use client';

import { useTheme } from '@/contexts/ThemeContext';

interface Props {
  level: number;      // 0 = low/green, 1 = high/red
  label?: string;
}

function levelColor(l: number) {
  if (l < 0.33) return '#22c55e';
  if (l < 0.66) return '#eab308';
  return '#ef4444';
}

function levelLabel(l: number) {
  if (l < 0.33) return 'Low';
  if (l < 0.66) return 'Moderate';
  return 'High';
}

// Arc geometry: center (100,100), radius 72
// Left endpoint (level=0, green): angle=π → (28, 100)
// Right endpoint (level=1, red):  angle=0 → (172, 100)
// Top of arc (level=0.5):         angle=π/2 → (100, 28)
// Formula: angle = π*(1-level)
//   ex = 100 + 72*cos(angle)
//   ey = 100 - 72*sin(angle)   ← minus because SVG y-axis is flipped
function fillArcPath(level: number) {
  if (level <= 0.005) return '';
  const angle = Math.PI * (1 - level);
  const ex = 100 + 72 * Math.cos(angle);
  const ey = 100 - 72 * Math.sin(angle);
  const largeArc = level > 0.5 ? 1 : 0;
  return `M 28,100 A 72,72 0 ${largeArc} 0 ${ex.toFixed(2)},${ey.toFixed(2)}`;
}

function needleCoords(level: number) {
  const angle = Math.PI * (1 - level);
  return {
    x: 100 + 58 * Math.cos(angle),
    y: 100 - 58 * Math.sin(angle),
  };
}

const TICK_LEVELS = [0, 0.25, 0.5, 0.75, 1];

export default function CortisolMeter({ level, label = 'CORTISOL LEVEL' }: Props) {
  const { isDark } = useTheme();
  const color       = levelColor(level);
  const trackColor  = isDark ? '#27272a' : '#e5e7eb';
  const tickColor   = isDark ? '#3f3f46' : '#d1d5db';
  const labelColor  = isDark ? '#71717a' : '#9ca3af';
  const pivotInner  = isDark ? '#18181b' : '#ffffff';
  const needle      = needleCoords(level);

  return (
    <div className="flex flex-col items-center">
      {/* Section label */}
      <p style={{ fontSize: 9, letterSpacing: '0.2em', color: labelColor, marginBottom: 2, fontFamily: 'monospace' }}>
        {label}
      </p>

      <svg width="200" height="118" viewBox="0 0 200 118">
        <defs>
          {/* Gradient mapped exactly across the arc's x-span */}
          <linearGradient id="cort-fill" x1="28" y1="100" x2="172" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#22c55e" />
            <stop offset="35%"  stopColor="#84cc16" />
            <stop offset="55%"  stopColor="#eab308" />
            <stop offset="75%"  stopColor="#f97316" />
            <stop offset="100%" stopColor="#ef4444" />
          </linearGradient>

          {/* Soft glow filter for the fill arc */}
          <filter id="arc-glow" x="-20%" y="-40%" width="140%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* ── Background track (full 180° arc) ── */}
        <path
          d="M 28,100 A 72,72 0 0 0 172,100"
          fill="none"
          stroke={trackColor}
          strokeWidth="13"
          strokeLinecap="round"
        />

        {/* ── Coloured fill arc ── */}
        {level > 0.005 && (
          <path
            d={fillArcPath(level)}
            fill="none"
            stroke="url(#cort-fill)"
            strokeWidth="13"
            strokeLinecap="round"
            filter="url(#arc-glow)"
          />
        )}

        {/* ── Tick marks ── */}
        {TICK_LEVELS.map(t => {
          const a  = Math.PI * (1 - t);
          const x1 = 100 + 78  * Math.cos(a);
          const y1 = 100 - 78  * Math.sin(a);
          const x2 = 100 + 86  * Math.cos(a);
          const y2 = 100 - 86  * Math.sin(a);
          return (
            <line key={t}
              x1={x1.toFixed(2)} y1={y1.toFixed(2)}
              x2={x2.toFixed(2)} y2={y2.toFixed(2)}
              stroke={tickColor} strokeWidth="1.5"
            />
          );
        })}

        {/* ── Needle ── */}
        <line
          x1="100" y1="100"
          x2={needle.x.toFixed(2)} y2={needle.y.toFixed(2)}
          stroke={color} strokeWidth="2.5" strokeLinecap="round"
        />
        {/* Pivot outer */}
        <circle cx="100" cy="100" r="6" fill={color} />
        {/* Pivot inner */}
        <circle cx="100" cy="100" r="3" fill={pivotInner} />

        {/* ── Corner labels ── */}
        <text x="22"  y="115" fontSize="8" fill={labelColor} textAnchor="middle" fontFamily="monospace">LOW</text>
        <text x="178" y="115" fontSize="8" fill={labelColor} textAnchor="middle" fontFamily="monospace">HIGH</text>

        {/* ── Centre value ── */}
        <text x="100" y="80" fontSize="24" fontWeight="700" fill={color}
          textAnchor="middle" fontFamily="Courier New, monospace">
          {Math.round(level * 100)}%
        </text>
        <text x="100" y="93" fontSize="9" fill={labelColor}
          textAnchor="middle" fontFamily="monospace" letterSpacing="0.12em">
          {levelLabel(level).toUpperCase()}
        </text>
      </svg>
    </div>
  );
}
