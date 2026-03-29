'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

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

export default function SettingsPanel() {
  const { isDark, toggle } = useTheme();
  const [open,    setOpen]    = useState(false);
  const [hovered, setHovered] = useState(false);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    notifs: true, sync: true, cortisol: true, animate: true, sounds: false,
  });
  const zoomControls = useAnimation();

  const flip = (key: string) =>
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  const handleOpen = async () => {
    setOpen(true);
    // Camera rushes toward the vent, then settles into the open panel
    await zoomControls.start({
      scale: [1, 1.5, 1],
      transition: { duration: 0.55, times: [0, 0.3, 1], ease: 'easeInOut' },
    });
  };

  const handleClose = async () => {
    // Camera pulls back slightly, then vent shrinks away
    await zoomControls.start({
      scale: [1, 1.3, 1],
      transition: { duration: 0.45, times: [0, 0.25, 1], ease: 'easeInOut' },
    });
    setOpen(false);
  };

  return (
    // Outer wrapper: fixed position + zoom scale effect
    <motion.div
      className="fixed z-[45]"
      style={{ bottom: 24, right: 100, originX: 1, originY: 1 }}
      animate={zoomControls}
    >
    {/* Inner panel: handles width/height expansion (vent opening) */}
    <motion.div
      onHoverStart={() => !open && setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      animate={open
        ? { width: 320, height: 440, borderRadius: 16 }
        : { width: 80,  height: 52,  borderRadius: 8  }
      }
      transition={{ type: 'spring', stiffness: 240, damping: 28 }}
      style={{
        originX: 1, originY: 1,
        overflow: 'hidden',
        background: open
          ? (isDark ? '#0e0e12' : '#f9fafb')
          : hovered
            ? 'linear-gradient(160deg, #222228, #1c1c22)'
            : 'linear-gradient(160deg, #1a1a1e, #141416)',
        border: `1px solid ${open ? '#33333a' : hovered ? '#444' : '#2e2e34'}`,
        boxShadow: open
          ? '0 0 60px rgba(0,0,0,0.8), 0 0 20px rgba(99,102,241,0.1)'
          : hovered
            ? '0 0 20px rgba(99,102,241,0.25), 0 4px 16px rgba(0,0,0,0.5)'
            : '0 4px 12px rgba(0,0,0,0.4)',
        cursor: open ? 'default' : 'pointer',
        transition: 'background 0.2s, border-color 0.2s, box-shadow 0.2s',
      }}
      onClick={() => !open && handleOpen()}
    >
      {/* ── Closed face: screws + label ── */}
      <AnimatePresence>
        {!open && (
          <motion.div
            key="face"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.18, delay: 0.12 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
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

      {/* ── Open face: settings content ── */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="settings"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.2, delay: 0.18 }}
            style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            {/* Screws on open panel */}
            <div style={{ position: 'absolute', top: 10, left:  10 }}><Screw size={11} /></div>
            <div style={{ position: 'absolute', top: 10, right: 10 }}><Screw size={11} /></div>
            <div style={{ position: 'absolute', bottom: 10, left:  10 }}><Screw size={11} /></div>
            <div style={{ position: 'absolute', bottom: 10, right: 10 }}><Screw size={11} /></div>

            {/* Rainbow bar */}
            <div className="chat-glow-bar" />

            {/* Header */}
            <div style={{
              padding: '14px 20px 12px',
              borderBottom: '1px solid #1f1f26',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: isDark ? '#f4f4f5' : '#111', letterSpacing: '0.02em' }}>
                  Settings
                </div>
                <div style={{ fontSize: 9, color: '#555', letterSpacing: '0.18em', fontFamily: 'monospace', marginTop: 1 }}>
                  CANVOCADE  ·  v1.0
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#555', fontSize: 18, lineHeight: 1 }}
              >
                ✕
              </button>
            </div>

            {/* Dark mode row */}
            <div style={{ padding: '10px 20px', borderBottom: '1px solid #1a1a22' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#e4e4e7' : '#333' }}>Dark Mode</div>
                  <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{isDark ? 'Currently dark' : 'Currently light'}</div>
                </div>
                <Toggle value={isDark} onChange={toggle} />
              </div>
            </div>

            {/* Other toggles */}
            <div style={{ padding: '6px 0', flex: 1, overflowY: 'auto' }}>
              {SETTINGS_ROWS.map(row => (
                <div key={row.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 500, color: isDark ? '#d4d4d8' : '#444' }}>{row.label}</div>
                    <div style={{ fontSize: 10, color: '#555', marginTop: 1 }}>{row.sub}</div>
                  </div>
                  <Toggle value={toggles[row.key]} onChange={() => flip(row.key)} />
                </div>
              ))}
            </div>

            {/* Profile */}
            <div style={{
              margin: '0 20px 16px',
              borderRadius: 10,
              background: isDark ? '#141418' : '#f3f4f6',
              border: '1px solid #222228',
              padding: '10px 14px',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <div style={{
                width: 32, height: 32, borderRadius: '50%',
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 10, fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
                boxShadow: '0 0 8px rgba(99,102,241,0.4)', flexShrink: 0,
              }}>JD</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: isDark ? '#e4e4e7' : '#333' }}>John Doe</div>
                <div style={{ fontSize: 10, color: '#555' }}>john.doe@psu.edu  ·  Spring 2025</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
    </motion.div>
  );
}
