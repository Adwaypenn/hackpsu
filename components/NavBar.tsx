'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Page } from '@/types';

interface NavBarProps {
  activePage: Page;
  onNavigate: (page: Page) => void;
  disabled?: boolean;
}

// Ordered top-to-bottom as they appear on a real elevator panel (highest floor at top)
const FLOORS: { id: Page; label: string; sublabel: string }[] = [
  { id: 'professor', label: 'PH', sublabel: 'PROFS'  },
  { id: 'engl202',   label: '3',  sublabel: 'ENGL'   },
  { id: 'math251',   label: '2',  sublabel: 'MATH'   },
  { id: 'cmpsc473',  label: '1',  sublabel: 'CSCI'   },
  { id: 'dashboard', label: 'G',  sublabel: 'LOBBY'  },
];

const FLOOR_LABEL: Record<Page, string> = {
  professor: 'PH',
  engl202:   '3',
  math251:   '2',
  cmpsc473:  '1',
  dashboard: 'G',
};

export default function NavBar({ activePage, onNavigate, disabled }: NavBarProps) {
  const [hovered, setHovered] = useState<Page | null>(null);

  return (
    <aside
      className="fixed right-0 top-0 bottom-0 z-40 flex flex-col items-center"
      style={{
        width: 80,
        background: 'linear-gradient(180deg, #161618 0%, #242428 50%, #161618 100%)',
        borderLeft: '1px solid #2e2e32',
        boxShadow: '-6px 0 24px rgba(0,0,0,0.6)',
      }}
    >
      {/* ── Floor display ── */}
      <div
        className="w-full flex flex-col items-center pt-5 pb-4"
        style={{ borderBottom: '1px solid #2e2e32' }}
      >
        <div style={{ fontSize: 9, color: '#444', letterSpacing: '0.18em', fontFamily: 'monospace', marginBottom: 4 }}>
          FLOOR
        </div>
        {/* Amber LED-style readout — restored original animation */}
        <motion.div
          key={activePage}
          initial={false}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: 'backOut' }}
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: 30,
            fontWeight: 700,
            color: '#fbbf24',
            lineHeight: 1,
            textShadow:
              '0 0 8px rgba(251,191,36,1), 0 0 20px rgba(251,191,36,0.7), 0 0 40px rgba(251,191,36,0.35)',
          }}
        >
          {FLOOR_LABEL[activePage]}
        </motion.div>
        <div
          style={{
            marginTop: 6,
            width: 24,
            height: 1,
            background: 'linear-gradient(to right, transparent, rgba(251,191,36,0.5), transparent)',
          }}
        />
      </div>

      {/* ── Elevator buttons ── */}
      <div className="flex flex-col items-center gap-3 py-5 flex-1 justify-center">
        {FLOORS.map((floor) => {
          const isActive  = activePage === floor.id;
          const isHovered = hovered    === floor.id;

          return (
            <div key={floor.id} className="flex flex-col items-center" style={{ gap: 3 }}>
              {/* Outer bezel ring */}
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive
                    ? 'radial-gradient(circle at 50% 50%, rgba(251,191,36,0.15), transparent 70%)'
                    : 'transparent',
                  transition: 'background 0.3s',
                }}
              >
                <motion.button
                  disabled={disabled || isActive}
                  onClick={() => onNavigate(floor.id)}
                  onHoverStart={() => !disabled && setHovered(floor.id)}
                  onHoverEnd={() => setHovered(null)}
                  whileTap={!isActive && !disabled ? { scale: 0.88 } : {}}
                  animate={
                    isActive
                      ? {
                          boxShadow: [
                            '0 0 10px 3px rgba(251,191,36,0.55), inset 0 1px 2px rgba(255,255,255,0.15)',
                            '0 0 18px 7px rgba(251,191,36,0.80), inset 0 1px 2px rgba(255,255,255,0.20)',
                            '0 0 10px 3px rgba(251,191,36,0.55), inset 0 1px 2px rgba(255,255,255,0.15)',
                          ],
                        }
                      : {}
                  }
                  transition={
                    isActive
                      ? { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
                      : { duration: 0.2 }
                  }
                  className="relative flex items-center justify-center rounded-full"
                  style={{
                    width: 44,
                    height: 44,
                    cursor: isActive ? 'default' : disabled ? 'not-allowed' : 'pointer',
                    border: '2px solid',
                    borderColor: isActive
                      ? '#f59e0b'
                      : isHovered
                      ? '#a16207'
                      : '#383840',
                    background: isActive
                      ? 'radial-gradient(circle at 38% 32%, #fde68a 0%, #f59e0b 55%, #b45309 100%)'
                      : isHovered
                      ? 'radial-gradient(circle at 38% 32%, #2d2200, #1a1400)'
                      : 'radial-gradient(circle at 38% 32%, #2c2c30, #19191c)',
                    boxShadow: isHovered && !isActive
                      ? '0 0 14px 5px rgba(251,191,36,0.45)'
                      : 'inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 1px rgba(255,255,255,0.04)',
                    transition: 'border-color 0.2s, background 0.2s, box-shadow 0.2s',
                    fontSize: floor.label.length > 1 ? 11 : 14,
                    fontWeight: 800,
                    fontFamily: '"Courier New", monospace',
                    letterSpacing: '-0.03em',
                    color: isActive
                      ? '#3d1a00'
                      : isHovered
                      ? '#fbbf24'
                      : '#666',
                    userSelect: 'none',
                  }}
                >
                  {floor.label}
                </motion.button>
              </div>

              {/* Sublabel */}
              <span
                style={{
                  fontSize: 6.5,
                  color: isActive ? '#f59e0b' : isHovered ? '#777' : '#3a3a40',
                  letterSpacing: '0.12em',
                  fontFamily: 'monospace',
                  transition: 'color 0.2s',
                  userSelect: 'none',
                }}
              >
                {floor.sublabel}
              </span>
            </div>
          );
        })}
      </div>

      {/* ── User avatar ── */}
      <div
        className="w-full flex flex-col items-center pb-5 pt-4"
        style={{ borderTop: '1px solid #2e2e32' }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold select-none"
          style={{
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            color: '#fff',
            boxShadow: '0 0 10px rgba(99,102,241,0.45)',
            fontSize: 11,
            letterSpacing: '0.04em',
          }}
        >
          JD
        </div>
        <span style={{ fontSize: 6.5, color: '#383840', letterSpacing: '0.14em', fontFamily: 'monospace', marginTop: 4 }}>
          USER
        </span>
      </div>
    </aside>
  );
}
