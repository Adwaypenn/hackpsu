'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Page } from '@/types';

interface CenterPanelProps {
  onNavigate: (page: Page) => void;
}

const FLOORS: { id: Page; label: string; sublabel: string; desc: string; color: string }[] = [
  { id: 'professor', label: 'PH', sublabel: 'PENTHOUSE', desc: 'Professor Profiles',      color: '#a78bfa' },
  { id: 'engl202',   label: '3',  sublabel: 'ENGL 202',  desc: 'Technical Writing',        color: '#f59e0b' },
  { id: 'math251',   label: '2',  sublabel: 'MATH 251',  desc: 'Calculus III',             color: '#22c55e' },
  { id: 'cmpsc473',  label: '1',  sublabel: 'CMPSC 473', desc: 'Operating Systems Design', color: '#6366f1' },
  { id: 'dashboard', label: 'G',  sublabel: 'GROUND',    desc: 'Dashboard & Overview',     color: '#fbbf24' },
];

const QUICK_STATS = [
  { label: 'GPA',           value: '3.7'  },
  { label: 'Due This Week', value: '4'    },
  { label: 'Next Exam',     value: '3 d'  },
  { label: 'Readiness',     value: '82 %' },
];

// Phillips screw head
function Screw({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6" fill="#1a1a1e" stroke="#3a3a42" strokeWidth="1" />
      <circle cx="7" cy="7" r="3.5" fill="none" stroke="#4a4a54" strokeWidth="0.8" />
      <line x1="7" y1="3.8" x2="7" y2="10.2" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="3.8" y1="7" x2="10.2" y2="7" stroke="#555" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

export default function CenterPanel({ onNavigate }: CenterPanelProps) {
  const [hovered,  setHovered]  = useState<Page | null>(null);
  const [selected, setSelected] = useState<Page | null>(null);

  const handleSelect = (id: Page) => {
    setSelected(id);
    setTimeout(() => onNavigate(id), 140);
  };

  return (
    <motion.div
      className="fixed inset-0 z-30 flex items-center justify-center"
      style={{ pointerEvents: 'none' }}
    >
      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 48, scale: 0.9 }}
        animate={{ opacity: 1, y: 0,  scale: 1   }}
        transition={{ type: 'spring', stiffness: 160, damping: 22, delay: 1.3 }}
        style={{
          pointerEvents: 'auto',
          width: 320,
          background: 'linear-gradient(170deg, #1a1a1e 0%, #242428 40%, #1e1e22 100%)',
          border: '1px solid #33333a',
          borderRadius: 20,
          boxShadow: '0 0 80px rgba(0,0,0,0.9), 0 0 30px rgba(251,191,36,0.05), inset 0 1px 0 rgba(255,255,255,0.04)',
          padding: '20px 18px 24px',
          position: 'relative',
        }}
      >
        {/* Corner screws */}
        <div style={{ position: 'absolute', top: 10, left:  10 }}><Screw /></div>
        <div style={{ position: 'absolute', top: 10, right: 10 }}><Screw /></div>
        <div style={{ position: 'absolute', bottom: 10, left:  10 }}><Screw /></div>
        <div style={{ position: 'absolute', bottom: 10, right: 10 }}><Screw /></div>

        {/* Header */}
        <div className="flex flex-col items-center mb-5">
          <div style={{
            fontSize: 8, color: '#444', letterSpacing: '0.3em', fontFamily: 'monospace', marginBottom: 6,
          }}>
            SELECT FLOOR
          </div>

          {/* LED floor display */}
          <div style={{
            background: '#0a0a0c',
            border: '1px solid #2a2a2e',
            borderRadius: 8,
            padding: '6px 18px',
            minWidth: 80,
            textAlign: 'center',
            boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.8)',
          }}>
            <motion.span
              key={hovered ?? 'none'}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              style={{
                fontFamily: '"Courier New", monospace',
                fontSize: 28,
                fontWeight: 700,
                color: hovered ? (FLOORS.find(f => f.id === hovered)?.color ?? '#fbbf24') : '#fbbf24',
                textShadow: hovered
                  ? `0 0 8px ${FLOORS.find(f => f.id === hovered)?.color ?? '#fbbf24'}, 0 0 20px ${FLOORS.find(f => f.id === hovered)?.color ?? '#fbbf24'}88`
                  : '0 0 8px rgba(251,191,36,0.8), 0 0 20px rgba(251,191,36,0.4)',
                lineHeight: 1.1,
                display: 'block',
              }}
            >
              {hovered ? FLOORS.find(f => f.id === hovered)?.label : '--'}
            </motion.span>
            <div style={{
              fontSize: 7, letterSpacing: '0.2em', fontFamily: 'monospace', marginTop: 2,
              color: hovered ? (FLOORS.find(f => f.id === hovered)?.color ?? '#fbbf24') + '88' : '#333',
            }}>
              {hovered ? FLOORS.find(f => f.id === hovered)?.sublabel : '------'}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #2e2e34, transparent)', marginBottom: 14 }} />

        {/* Floor buttons */}
        <div className="flex flex-col gap-2">
          {FLOORS.map((floor, i) => {
            const isHovered  = hovered   === floor.id;
            const isSelected = selected  === floor.id;
            return (
              <motion.div
                key={floor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.5 + i * 0.07, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <motion.button
                  onClick={() => handleSelect(floor.id)}
                  onHoverStart={() => setHovered(floor.id)}
                  onHoverEnd={() => setHovered(null)}
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center gap-3"
                  style={{
                    background: isHovered
                      ? `radial-gradient(ellipse at left, ${floor.color}18 0%, transparent 70%)`
                      : 'transparent',
                    border: `1px solid ${isHovered ? floor.color + '44' : '#2a2a2e'}`,
                    borderRadius: 10,
                    padding: '9px 12px',
                    cursor: 'pointer',
                    transition: 'background 0.2s, border-color 0.2s',
                    textAlign: 'left',
                  }}
                >
                  {/* Button disc */}
                  <motion.div
                    animate={isSelected ? {
                      boxShadow: [`0 0 0px 0px ${floor.color}00`, `0 0 16px 5px ${floor.color}99`],
                    } : {}}
                    transition={{ duration: 0.25 }}
                    style={{
                      width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: `2px solid ${isHovered ? floor.color : '#383840'}`,
                      background: isHovered
                        ? `radial-gradient(circle at 38% 32%, ${floor.color}33, #0a0a0c)`
                        : 'radial-gradient(circle at 38% 32%, #2c2c30, #19191c)',
                      boxShadow: isHovered
                        ? `0 0 12px 3px ${floor.color}55`
                        : 'inset 0 2px 4px rgba(0,0,0,0.6)',
                      transition: 'all 0.2s',
                      fontSize: floor.label.length > 1 ? 11 : 14,
                      fontWeight: 800,
                      fontFamily: '"Courier New", monospace',
                      color: isHovered ? floor.color : '#555',
                    }}
                  >
                    {floor.label}
                  </motion.div>

                  {/* Label */}
                  <div>
                    <div style={{
                      fontSize: 11, fontWeight: 600, fontFamily: 'monospace',
                      color: isHovered ? floor.color : '#555',
                      letterSpacing: '0.1em', transition: 'color 0.2s',
                    }}>
                      {floor.sublabel}
                    </div>
                    <div style={{ fontSize: 9, color: '#3a3a42', letterSpacing: '0.06em', marginTop: 1 }}>
                      {floor.desc}
                    </div>
                  </div>

                  {/* Arrow on hover */}
                  <motion.span
                    animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -6 }}
                    transition={{ duration: 0.15 }}
                    style={{ marginLeft: 'auto', fontSize: 12, color: floor.color }}
                  >
                    →
                  </motion.span>
                </motion.button>
              </motion.div>
            );
          })}
        </div>

        {/* Quick stats — shown at bottom always */}
        <div style={{ height: 1, background: 'linear-gradient(to right, transparent, #2e2e34, transparent)', margin: '14px 0 12px' }} />
        <div className="grid grid-cols-4 gap-1">
          {QUICK_STATS.map(s => (
            <div key={s.label} style={{
              background: '#0f0f12', borderRadius: 7,
              border: '1px solid #222226', padding: '5px 4px', textAlign: 'center',
            }}>
              <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'monospace', color: '#fbbf24' }}>{s.value}</div>
              <div style={{ fontSize: 6.5, color: '#444', letterSpacing: '0.1em', marginTop: 1 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Bottom label */}
        <div style={{ textAlign: 'center', marginTop: 14, fontSize: 8, color: '#2a2a2e', letterSpacing: '0.25em', fontFamily: 'monospace' }}>
          CANVOCADE  ·  ACADEMIC NAVIGATOR
        </div>
      </motion.div>
    </motion.div>
  );
}
