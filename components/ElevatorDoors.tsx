'use client';

import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';

interface ElevatorDoorsProps {
  isOpen: boolean;      // controlled by navigation (true = navigate-open)
  onClosed?: () => void;
  onOpened?: () => void;
}

const TRANSITION = {
  duration: 0.9,
  ease: [0.76, 0, 0.24, 1] as const,
};

function DoorSurface({ side }: { side: 'left' | 'right' }) {
  const isLeft = side === 'left';
  return (
    <div
      className="absolute inset-0 overflow-hidden"
      style={{
        background: isLeft
          ? 'linear-gradient(105deg, #888 0%, #d8d8d8 25%, #f0f0f0 45%, #e2e2e2 65%, #b8b8b8 85%, #999 100%)'
          : 'linear-gradient(255deg, #888 0%, #d8d8d8 25%, #f0f0f0 45%, #e2e2e2 65%, #b8b8b8 85%, #999 100%)',
      }}
    >
      {[24, 49, 74].map((p) => (
        <div key={p} style={{
          position: 'absolute', top: '4%', bottom: '4%', left: `${p}%`, width: 2,
          background: 'linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.08) 15%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.08) 85%, transparent 100%)',
        }} />
      ))}
      {[12, 37, 62, 87].map((p) => (
        <div key={p} style={{
          position: 'absolute', top: '4%', bottom: '4%', left: `${p}%`, width: 10,
          background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.18), transparent)',
        }} />
      ))}
      <div style={{
        position: 'absolute', top: '42%', left: '5%', right: '5%', height: 1,
        background: 'linear-gradient(to right, transparent, rgba(0,0,0,0.22) 30%, rgba(0,0,0,0.22) 70%, transparent)',
      }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        left: isLeft ? '28%' : '42%', width: '20%',
        background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.28), transparent)',
        pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', top: 0, bottom: 0,
        [isLeft ? 'right' : 'left']: 0, width: 10,
        background: isLeft
          ? 'linear-gradient(to left, rgba(0,0,0,0.45), transparent)'
          : 'linear-gradient(to right, rgba(0,0,0,0.45), transparent)',
      }} />
    </div>
  );
}

export default function ElevatorDoors({ isOpen, onClosed, onOpened }: ElevatorDoorsProps) {
  // ── Entrance animation: independent of navigation prop ──────────
  // Starts false (doors closed), opens after 500 ms on first mount.
  const [entryOpen, setEntryOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setEntryOpen(true), 500);
    return () => clearTimeout(t);
  }, []);

  // Visual open state: need BOTH entry done AND navigation says open
  const visualOpen = entryOpen && isOpen;

  // Ref so the onAnimationComplete closure always reads the latest value
  const visualOpenRef = useRef(visualOpen);
  visualOpenRef.current = visualOpen;

  return (
    <div
      className="fixed inset-0 z-50 flex"
      style={{ pointerEvents: visualOpen ? 'none' : 'auto' }}
    >
      {/* ── Left door ── */}
      <motion.div
        className="relative w-1/2 h-full"
        initial={false}
        animate={{ x: visualOpen ? '-100%' : '0%' }}
        transition={TRANSITION}
      >
        <DoorSurface side="left" />
        <div style={{
          position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
          fontFamily: '"Courier New", monospace', fontSize: 13, letterSpacing: '0.3em',
          color: 'rgba(70,70,70,0.45)', fontWeight: 400, userSelect: 'none',
        }}>
          ACAD
        </div>
      </motion.div>

      {/* ── Right door ── */}
      <motion.div
        className="relative w-1/2 h-full"
        initial={false}
        animate={{ x: visualOpen ? '100%' : '0%' }}
        transition={TRANSITION}
        onAnimationComplete={() => {
          // Use ref so we always read the post-animation value
          if (visualOpenRef.current) onOpened?.();
          else onClosed?.();
        }}
      >
        <DoorSurface side="right" />
        <div style={{
          position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
          fontFamily: '"Courier New", monospace', fontSize: 13, letterSpacing: '0.3em',
          color: 'rgba(70,70,70,0.45)', fontWeight: 400, userSelect: 'none',
        }}>
          IQ
        </div>
      </motion.div>
    </div>
  );
}
