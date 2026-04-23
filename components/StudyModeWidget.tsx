'use client';

import { useState, useEffect, useId } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';

export const STUDY_MODES = ['Lesson', 'Quiz', 'Flashcards'] as const;
export type StudyMode = typeof STUDY_MODES[number];

const TRACK_H  = 88;
const HANDLE_H = 13;
const HALF_H   = HANDLE_H / 2;
const DOT_Y    = [10, TRACK_H / 2, TRACK_H - 10] as const;

// ── Rotary intensity dial ────────────────────────────────────────────────────
function IntensityDial({ level, onChange }: { level: number; onChange: (n: number) => void }) {
  const uid = useId();
  const gradId = `dg-${uid.replace(/:/g, '')}`;

  const SIZE = 76;
  const cx = SIZE / 2, cy = SIZE / 2;
  const R_OUTER = 34, R_TRACK = 26;
  const MIN_DEG = -140, MAX_DEG = 140;

  const levelToDeg = (l: number) => MIN_DEG + (l - 1) * (MAX_DEG - MIN_DEG) / 4;
  const pointerDeg = level > 0 ? levelToDeg(level) : MIN_DEG - 16;

  const ticks = ([1, 2, 3, 4, 5] as const).map(l => {
    const rad = (levelToDeg(l) * Math.PI) / 180;
    return {
      x1: cx + (R_TRACK - 3) * Math.sin(rad),
      y1: cy - (R_TRACK - 3) * Math.cos(rad),
      x2: cx + (R_TRACK + 6) * Math.sin(rad),
      y2: cy - (R_TRACK + 6) * Math.cos(rad),
      active: level >= l,
    };
  });

  const activeArc = (() => {
    if (level <= 1) return null;
    const startRad = (MIN_DEG * Math.PI) / 180;
    const endRad   = (levelToDeg(level) * Math.PI) / 180;
    const sx = cx + R_TRACK * Math.sin(startRad);
    const sy = cy - R_TRACK * Math.cos(startRad);
    const ex = cx + R_TRACK * Math.sin(endRad);
    const ey = cy - R_TRACK * Math.cos(endRad);
    const span  = endRad - startRad;
    const large = Math.abs(span) > Math.PI ? 1 : 0;
    const sweep = span > 0 ? 1 : 0;
    return `M ${sx.toFixed(2)} ${sy.toFixed(2)} A ${R_TRACK} ${R_TRACK} 0 ${large} ${sweep} ${ex.toFixed(2)} ${ey.toFixed(2)}`;
  })();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontSize: 7, letterSpacing: '0.22em', fontFamily: 'monospace', color: '#555' }}>
        INTENSITY
      </div>
      <svg
        width={SIZE} height={SIZE}
        style={{ cursor: 'pointer', display: 'block', overflow: 'visible' }}
        onClick={() => onChange(level === 0 ? 1 : level === 5 ? 1 : level + 1)}
        aria-label="Click to increase intensity"
      >
        <defs>
          <radialGradient id={gradId} cx="38%" cy="30%">
            <stop offset="0%"   stopColor="#2c2c32" />
            <stop offset="100%" stopColor="#0e0e10" />
          </radialGradient>
        </defs>
        <circle cx={cx} cy={cy} r={R_OUTER}     fill={`url(#${gradId})`} stroke="#3a3a42" strokeWidth="1.5" />
        <circle cx={cx} cy={cy} r={R_OUTER - 5} fill="none" stroke="#1e1e22" strokeWidth="1" strokeDasharray="2.5 2" />
        {ticks.map((t, i) => (
          <line key={i} x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
            stroke={t.active ? '#fbbf24' : '#2a2a30'}
            strokeWidth={t.active ? 2 : 1.5} strokeLinecap="round"
          />
        ))}
        {activeArc && (
          <path d={activeArc} stroke="#f59e0b" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}
        <g style={{
          transform: `rotate(${pointerDeg}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
          transition: 'transform 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)',
        }}>
          <line x1={cx} y1={cy - 5} x2={cx} y2={cy - R_TRACK + 4}
            stroke={level > 0 ? '#fbbf24' : '#2a2a30'}
            strokeWidth="2.5" strokeLinecap="round"
          />
        </g>
        <circle cx={cx} cy={cy} r={11} fill="#0c0c0e" stroke="#252528" strokeWidth="1" />
        <text x={cx} y={cy + 4.5} textAnchor="middle"
          fill={level > 0 ? '#fbbf24' : '#333'}
          fontFamily='"Courier New", monospace' fontSize="13" fontWeight="700"
        >
          {level > 0 ? level : '–'}
        </text>
      </svg>
    </div>
  );
}

// ── 3-position draggable mode lever ─────────────────────────────────────────
function ModeLever({ mode, onChange }: { mode: StudyMode | null; onChange: (m: StudyMode) => void }) {
  const idx = mode !== null ? STUDY_MODES.indexOf(mode) : -1;
  const y   = useMotionValue(DOT_Y[0] - HALF_H);

  useEffect(() => {
    const target = idx >= 0 ? DOT_Y[idx] - HALF_H : DOT_Y[0] - HALF_H;
    animate(y, target, { type: 'spring', stiffness: 520, damping: 36 });
  }, [idx, y]);

  const snapOnRelease = () => {
    const center  = y.get() + HALF_H;
    const closest = (DOT_Y as readonly number[]).reduce((prev, curr) =>
      Math.abs(curr - center) < Math.abs(prev - center) ? curr : prev
    );
    animate(y, closest - HALF_H, { type: 'spring', stiffness: 520, damping: 36 });
    onChange(STUDY_MODES[(DOT_Y as readonly number[]).indexOf(closest)]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
      <div style={{ fontSize: 7, letterSpacing: '0.22em', fontFamily: 'monospace', color: '#555' }}>
        MODE
      </div>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* Track + handle */}
        <div style={{ position: 'relative', width: 20, height: TRACK_H, flexShrink: 0 }}>
          <div style={{
            position: 'absolute', left: '50%', top: 10, bottom: 10,
            width: 4, transform: 'translateX(-50%)',
            background: 'linear-gradient(to bottom, #1a1a1e, #2c2c30, #1a1a1e)',
            borderRadius: 2, border: '1px solid #252528',
          }} />
          {DOT_Y.map((dotY, i) => (
            <div key={i} style={{
              position: 'absolute', left: '50%', top: dotY,
              width: 10, height: 3,
              transform: 'translate(-50%, -50%)',
              background: idx === i ? '#fbbf24' : '#1e1e24',
              borderRadius: 1,
              boxShadow: idx === i ? '0 0 6px rgba(251,191,36,0.6)' : 'none',
              transition: 'background 0.2s, box-shadow 0.2s',
            }} />
          ))}
          <motion.div
            drag="y"
            dragConstraints={{ top: DOT_Y[0] - HALF_H, bottom: DOT_Y[2] - HALF_H }}
            dragElastic={0.05}
            dragMomentum={false}
            onDragEnd={snapOnRelease}
            style={{
              position: 'absolute',
              left: 'calc(50% - 10px)',
              top: 0, y,
              width: 20, height: HANDLE_H, borderRadius: 4,
              cursor: 'grab',
              background: idx >= 0
                ? 'linear-gradient(to bottom, #999, #ccc, #888)'
                : 'linear-gradient(to bottom, #303034, #404044, #303034)',
              border: `1px solid ${idx >= 0 ? '#bbb' : '#3a3a40'}`,
              boxShadow: idx >= 0
                ? '0 2px 6px rgba(0,0,0,0.7), 0 0 10px rgba(251,191,36,0.2)'
                : '0 2px 4px rgba(0,0,0,0.5)',
              backgroundImage: idx >= 0
                ? 'repeating-linear-gradient(to bottom, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 3px)'
                : 'none',
            }}
            whileDrag={{ cursor: 'grabbing', scale: 1.12 }}
          />
        </div>
        {/* Labels */}
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: TRACK_H }}>
          {STUDY_MODES.map((m) => (
            <motion.button
              key={m}
              whileTap={{ scale: 0.93 }}
              onClick={() => onChange(m)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '2px 6px 2px 4px',
                fontFamily: 'monospace', fontSize: 9, letterSpacing: '0.14em',
                color: mode === m ? '#fbbf24' : '#3a3a44',
                textShadow: mode === m ? '0 0 8px rgba(251,191,36,0.7)' : 'none',
                transition: 'color 0.18s', textAlign: 'left',
              }}
            >
              {m.toUpperCase()}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Exported widget ──────────────────────────────────────────────────────────
interface StudyModeWidgetProps {
  onStart: (mode: string, intensity: number) => void;
}

export default function StudyModeWidget({ onStart }: StudyModeWidgetProps) {
  const [intensity, setIntensity] = useState(0);
  const [studyMode, setStudyMode] = useState<StudyMode | null>(null);
  const readyToStart = intensity > 0 && studyMode !== null;

  return (
    <div>
      <div style={{
        fontSize: 7, letterSpacing: '0.28em', fontFamily: 'monospace',
        color: '#444', textAlign: 'center', marginBottom: 12,
      }}>
        STUDY MODE
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', gap: 28 }}>
        <IntensityDial level={intensity} onChange={setIntensity} />
        <ModeLever mode={studyMode} onChange={setStudyMode} />
      </div>
      <div style={{ minHeight: 44, marginTop: 14, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        {readyToStart && (
          <motion.button
            initial={{ opacity: 0, y: 8, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => onStart(studyMode!, intensity)}
            style={{
              background: 'linear-gradient(135deg, #d97706, #92400e)',
              border: 'none', borderRadius: 10, padding: '9px 24px',
              fontFamily: 'monospace', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.22em', color: '#fff', cursor: 'pointer',
              boxShadow: '0 0 18px rgba(217,119,6,0.4), 0 4px 14px rgba(0,0,0,0.4)',
            }}
          >
            ▶  START SESSION
          </motion.button>
        )}
      </div>
    </div>
  );
}
