'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

const BOX_W    = 80;
const BOX_H    = 52;
const ANCHOR_R = 100;
const ANCHOR_B = 24;
const MARGIN   = 28;   // gap between expanded panel and screen edge
const EASE     = [0.16, 1, 0.3, 1] as const;  // expo-out — buttery
const DURATION = 1.1;

function Screw({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14">
      <circle cx="7" cy="7" r="6"   fill="#1c1c20" stroke="#3a3a42" strokeWidth="1" />
      <circle cx="7" cy="7" r="3.2" fill="none"    stroke="#484852" strokeWidth="0.7" />
      <line x1="7" y1="4"  x2="7"  y2="10" stroke="#555" strokeWidth="1.1" strokeLinecap="round" />
      <line x1="4" y1="7"  x2="10" y2="7"  stroke="#555" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      style={{
        width: 40, height: 22, borderRadius: 11, padding: 2, cursor: 'pointer', border: 'none',
        background: value ? '#6366f1' : '#333338', transition: 'background 0.25s',
        display: 'flex', alignItems: 'center',
      }}
    >
      <motion.div
        animate={{ x: value ? 18 : 0 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        style={{ width: 18, height: 18, borderRadius: '50%', background: '#fff', flexShrink: 0 }}
      />
    </button>
  );
}

const SETTINGS_ROWS = [
  { key: 'notifs',   label: 'Notifications',    sub: 'Grade & deadline alerts'    },
  { key: 'sync',     label: 'Canvas Auto-Sync', sub: 'Pull data every 15 min'     },
  { key: 'cortisol', label: 'Stress Alerts',    sub: 'Alert when cortisol > 80 %' },
  { key: 'animate',  label: 'Animations',       sub: 'Elevator & door effects'    },
  { key: 'sounds',   label: 'Sound Effects',    sub: 'Button & transition sounds' },
];

// ─── tiny helpers for page background effect ─────────────────────────────────
function pageBlurIn() {
  const el = document.getElementById('page-zoom-wrapper');
  if (!el) return;
  el.style.transition = `transform ${DURATION}s cubic-bezier(${EASE}), filter ${DURATION}s ease`;
  el.style.transformOrigin = `calc(100% - ${ANCHOR_R + BOX_W / 2}px) calc(100% - ${ANCHOR_B + BOX_H / 2}px)`;
  el.style.transform = 'scale(1.055)';
  el.style.filter    = 'blur(5px) brightness(0.45)';
}

function pageBlurOut() {
  const el = document.getElementById('page-zoom-wrapper');
  if (!el) return;
  el.style.transition = `transform ${DURATION * 0.88}s cubic-bezier(0.4,0,0.2,1), filter ${DURATION * 0.88}s ease`;
  el.style.transform = 'scale(1)';
  el.style.filter    = '';
}

// ─── main component ───────────────────────────────────────────────────────────
export default function SettingsPanel() {
  const { isDark, toggle } = useTheme();
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    notifs: true, sync: true, cortisol: true, animate: true, sounds: false,
  });
  // Viewport dimensions — needed for start/end positions
  const [vp, setVp] = useState({ w: 1440, h: 900 });

  useEffect(() => {
    setMounted(true);
    const update = () => setVp({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const [coverDown, setCoverDown] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const after = (fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timers.current.push(id);
  };

  const flip = (k: string) => setToggles(p => ({ ...p, [k]: !p[k] }));

  const handleOpen = () => {
    setHovered(false);
    setCoverDown(false);   // cover starts closed
    setOpen(true);
    pageBlurIn();
    // slide cover down while zoom is happening
    after(() => setCoverDown(true), 180);
  };

  const handleClose = () => {
    // slide cover back up first, then zoom out
    setCoverDown(false);
    after(() => {
      setOpen(false);
      pageBlurOut();
    }, 420);
  };

  // Final panel dimensions — always rendered at this size
  const endW = vp.w - MARGIN * 2;
  const endH = vp.h - MARGIN * 2;

  // Uniform scale so the full-size panel appears as the small button (no reflow, no jumping)
  const initScale = Math.min(BOX_W / endW, BOX_H / endH);

  // Translation so the scaled-down panel sits exactly on top of the button
  const btnCx = vp.w - ANCHOR_R - BOX_W / 2;   // button center X
  const btnCy = vp.h - ANCHOR_B - BOX_H / 2;   // button center Y
  const panCx = MARGIN + endW / 2;              // panel center X
  const panCy = MARGIN + endH / 2;              // panel center Y
  const initX = btnCx - panCx;
  const initY = btnCy - panCy;

  // The overlay — rendered via portal so page blur never affects it
  const overlay = mounted && (
    <AnimatePresence>
      {open && (
        <motion.div
          key="settings-panel"
          // Panel is ALWAYS at full size. Transform moves+scales it to/from the button.
          // This means the content never reflows — it's like a frozen image scaling up.
          initial={{ x: initX, y: initY, scale: initScale, borderRadius: 8  }}
          animate={{ x: 0,     y: 0,     scale: 1,         borderRadius: 20 }}
          exit={{    x: initX, y: initY, scale: initScale, borderRadius: 8  }}
          transition={{ duration: DURATION, ease: EASE }}
          style={{
            position: 'fixed',
            left: MARGIN, top: MARGIN,
            width: endW,  height: endH,
            zIndex: 55,
            overflow: 'hidden',
            transformPerspective: 1400,
            transformOrigin: 'center center',
            background: isDark
              ? 'linear-gradient(160deg, #1a1a1e 0%, #141418 50%, #0f0f12 100%)'
              : 'linear-gradient(160deg, #f8f8fa 0%, #f0f0f4 100%)',
            border: `1px solid ${isDark ? '#2e2e38' : '#d4d4dc'}`,
            boxShadow: '0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04)',
          }}
        >
          {/* ── Screws — % positioned so they sit near corners at any size ── */}
          <div style={{ position: 'absolute', top: '3.5%', left:  '2%'  }}><Screw size={14} /></div>
          <div style={{ position: 'absolute', top: '3.5%', right: '2%'  }}><Screw size={14} /></div>
          <div style={{ position: 'absolute', bottom: '3.5%', left:  '2%' }}><Screw size={14} /></div>
          <div style={{ position: 'absolute', bottom: '3.5%', right: '2%' }}><Screw size={14} /></div>

          {/* ── Subtle inner vignette ── */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at 50% 100%, rgba(99,102,241,0.07) 0%, transparent 55%)',
          }} />

          {/* ── Rainbow top bar ── */}
          <div className="chat-glow-bar" style={{ position: 'absolute', top: 0, left: 0, right: 0 }} />

          {/* ── Settings content — always rendered, revealed by cover lifting ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.01, delay: 0.05 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              padding: '48px 32px',
              overflowY: 'auto',
            }}
          >
            <div style={{ width: '100%', maxWidth: 440 }}>

              {/* Header */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
                marginBottom: 32,
              }}>
                <div>
                  <div style={{
                    fontSize: 11, letterSpacing: '0.22em', fontFamily: 'monospace',
                    color: isDark ? '#3a3a46' : '#aaa', marginBottom: 6,
                  }}>
                    CANVOCADE  ·  v1.0
                  </div>
                  <div style={{
                    fontSize: 26, fontWeight: 700, letterSpacing: '-0.02em',
                    color: isDark ? '#f0f0f2' : '#111',
                  }}>
                    Settings
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  style={{
                    marginTop: 6,
                    width: 32, height: 32, borderRadius: 8,
                    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    border: `1px solid ${isDark ? '#2e2e38' : '#ddd'}`,
                    cursor: 'pointer', color: isDark ? '#666' : '#888',
                    fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Section: Appearance */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 9, letterSpacing: '0.2em', fontFamily: 'monospace',
                  color: isDark ? '#3a3a46' : '#bbb', marginBottom: 10,
                }}>
                  APPEARANCE
                </div>

                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 14,
                  border: `1px solid ${isDark ? '#242430' : '#e0e0e8'}`,
                  overflow: 'hidden',
                }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 18px',
                  }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e4e4e7' : '#333' }}>
                        Dark Mode
                      </div>
                      <div style={{ fontSize: 11, color: isDark ? '#444' : '#999', marginTop: 2 }}>
                        {isDark ? 'Currently dark' : 'Currently light'}
                      </div>
                    </div>
                    <Toggle value={isDark} onChange={toggle} />
                  </div>
                </div>
              </div>

              {/* Section: Notifications & Sync */}
              <div style={{ marginBottom: 24 }}>
                <div style={{
                  fontSize: 9, letterSpacing: '0.2em', fontFamily: 'monospace',
                  color: isDark ? '#3a3a46' : '#bbb', marginBottom: 10,
                }}>
                  NOTIFICATIONS & SYNC
                </div>
                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 14,
                  border: `1px solid ${isDark ? '#242430' : '#e0e0e8'}`,
                  overflow: 'hidden',
                }}>
                  {SETTINGS_ROWS.slice(0, 3).map((row, i) => (
                    <div
                      key={row.key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 18px',
                        borderTop: i > 0 ? `1px solid ${isDark ? '#1e1e26' : '#ebebf0'}` : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#d4d4d8' : '#333' }}>
                          {row.label}
                        </div>
                        <div style={{ fontSize: 11, color: isDark ? '#444' : '#999', marginTop: 2 }}>
                          {row.sub}
                        </div>
                      </div>
                      <Toggle value={toggles[row.key]} onChange={() => flip(row.key)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Section: Experience */}
              <div style={{ marginBottom: 28 }}>
                <div style={{
                  fontSize: 9, letterSpacing: '0.2em', fontFamily: 'monospace',
                  color: isDark ? '#3a3a46' : '#bbb', marginBottom: 10,
                }}>
                  EXPERIENCE
                </div>
                <div style={{
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
                  borderRadius: 14,
                  border: `1px solid ${isDark ? '#242430' : '#e0e0e8'}`,
                  overflow: 'hidden',
                }}>
                  {SETTINGS_ROWS.slice(3).map((row, i) => (
                    <div
                      key={row.key}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 18px',
                        borderTop: i > 0 ? `1px solid ${isDark ? '#1e1e26' : '#ebebf0'}` : 'none',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: isDark ? '#d4d4d8' : '#333' }}>
                          {row.label}
                        </div>
                        <div style={{ fontSize: 11, color: isDark ? '#444' : '#999', marginTop: 2 }}>
                          {row.sub}
                        </div>
                      </div>
                      <Toggle value={toggles[row.key]} onChange={() => flip(row.key)} />
                    </div>
                  ))}
                </div>
              </div>

              {/* Profile */}
              <div style={{
                borderRadius: 14,
                background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                border: `1px solid ${isDark ? '#242430' : '#e0e0e8'}`,
                padding: '14px 18px',
                display: 'flex', alignItems: 'center', gap: 14,
              }}>
                <div style={{
                  width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 700, color: '#fff',
                  boxShadow: '0 0 12px rgba(99,102,241,0.35)',
                }}>JD</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: isDark ? '#e4e4e7' : '#333' }}>
                    John Doe
                  </div>
                  <div style={{ fontSize: 11, color: isDark ? '#444' : '#999' }}>
                    john.doe@psu.edu · Spring 2025
                  </div>
                </div>
                <div style={{ marginLeft: 'auto', fontSize: 10, color: '#3a3a46', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                  PSU
                </div>
              </div>

            </div>
          </motion.div>

          {/* ── COVER — sits on top of settings content, slides down to expose, up to cover ── */}
          <motion.div
            animate={{ y: coverDown ? '100%' : '0%' }}
            transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
            style={{
              position: 'absolute', inset: 0,
              zIndex: 10,
              background: 'linear-gradient(170deg, #1e1e24 0%, #17171d 55%, #111116 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 'inherit',
            }}
          >
            {/* Screws on the cover face */}
            <div style={{ position: 'absolute', top: '3.5%', left:  '2%'  }}><Screw size={14} /></div>
            <div style={{ position: 'absolute', top: '3.5%', right: '2%'  }}><Screw size={14} /></div>
            <div style={{ position: 'absolute', bottom: '3.5%', left:  '2%' }}><Screw size={14} /></div>
            <div style={{ position: 'absolute', bottom: '3.5%', right: '2%' }}><Screw size={14} /></div>
            <span style={{
              fontSize: 13, letterSpacing: '0.28em', fontFamily: 'monospace',
              color: '#888', userSelect: 'none',
            }}>
              SETTINGS
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Portal: overlay outside the page zoom wrapper */}
      {mounted && createPortal(overlay, document.body)}

      {/* The button — inside the page, dims when overlay opens */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="btn"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1,  scale: 1    }}
            exit={{    opacity: 0,  scale: 0.88, transition: { duration: 0.14 } }}
            transition={{ duration: 0.24 }}
            onHoverStart={() => setHovered(true)}
            onHoverEnd={()   => setHovered(false)}
            onClick={handleOpen}
            style={{
              position: 'fixed', bottom: ANCHOR_B, right: ANCHOR_R,
              width: BOX_W, height: BOX_H, zIndex: 45,
              borderRadius: 8,
              background: hovered
                ? 'linear-gradient(160deg, #222228, #1c1c22)'
                : 'linear-gradient(160deg, #1a1a1e, #141416)',
              border: `1px solid ${hovered ? '#444' : '#2e2e34'}`,
              boxShadow: hovered
                ? '0 0 20px rgba(99,102,241,0.28), 0 4px 16px rgba(0,0,0,0.5)'
                : '0 4px 12px rgba(0,0,0,0.4)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
            }}
          >
            <div style={{ position: 'absolute', top: 5,    left:  5    }}><Screw /></div>
            <div style={{ position: 'absolute', top: 5,    right: 5    }}><Screw /></div>
            <div style={{ position: 'absolute', bottom: 5, left:  5    }}><Screw /></div>
            <div style={{ position: 'absolute', bottom: 5, right: 5    }}><Screw /></div>
            <span style={{
              fontSize: 7.5, letterSpacing: '0.22em', fontFamily: 'monospace',
              color: hovered ? '#888' : '#444', userSelect: 'none',
              transition: 'color 0.2s',
            }}>
              SETTINGS
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
