'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

const EDGE_ZONE = 140;   // px from left edge — wider activation zone
const ANCHORS   = [      // 12 strings along the left edge
  0.05, 0.13, 0.22, 0.31, 0.40, 0.50,
  0.59, 0.68, 0.77, 0.86, 0.92, 0.97,
];

interface Message { role: 'user' | 'cade'; text: string }

// Smiley face drawn with SVG + colorful glowing wires
function CadeSmiley() {
  return (
    <svg
      viewBox="0 0 200 200"
      width={180}
      height={180}
      style={{ position: 'absolute', bottom: 60, left: '50%', transform: 'translateX(-50%)', opacity: 0.07, pointerEvents: 'none' }}
    >
      <defs>
        <linearGradient id="sg1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stopColor="#a855f7" />
          <stop offset="50%"  stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
        <linearGradient id="sg2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#10b981" />
        </linearGradient>
        <filter id="sf">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {/* Face circle */}
      <circle cx="100" cy="100" r="78" stroke="url(#sg1)" strokeWidth="2.5" fill="none" filter="url(#sf)" />
      {/* Left eye */}
      <circle cx="72"  cy="84"  r="10" stroke="url(#sg2)" strokeWidth="2" fill="none" filter="url(#sf)" />
      <circle cx="72"  cy="84"  r="3"  fill="#a855f7" filter="url(#sf)" />
      {/* Right eye */}
      <circle cx="128" cy="84"  r="10" stroke="url(#sg1)" strokeWidth="2" fill="none" filter="url(#sf)" />
      <circle cx="128" cy="84"  r="3"  fill="#06b6d4" filter="url(#sf)" />
      {/* Smile */}
      <path d="M 66,118 C 72,140 128,140 134,118" stroke="url(#sg1)" strokeWidth="3" fill="none" strokeLinecap="round" filter="url(#sf)" />
      {/* Decorative wire loops */}
      <path d="M 30,60 C 20,80 40,100 30,120" stroke="#a855f7" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M 170,60 C 180,80 160,100 170,120" stroke="#06b6d4" strokeWidth="1.2" fill="none" opacity="0.6" />
      <path d="M 60,30 C 80,18 120,18 140,30" stroke="#ec4899" strokeWidth="1.2" fill="none" opacity="0.5" />
      <path d="M 60,170 C 80,182 120,182 140,170" stroke="#3b82f6" strokeWidth="1.2" fill="none" opacity="0.5" />
    </svg>
  );
}

export default function GlowEdgeChat() {
  const { isDark } = useTheme();
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const mouseRef   = useRef({ x: 9999, y: 0 });
  const frameRef   = useRef<number>(0);
  const timeRef    = useRef(0);
  const msgsEndRef = useRef<HTMLDivElement>(null);

  const [isNearEdge, setIsNearEdge] = useState(false);
  const [chatOpen,   setChatOpen]   = useState(false);
  const [messages,   setMessages]   = useState<Message[]>([
    { role: 'cade', text: 'Hey! I\'m Cade 👋 Ask me anything about your courses.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'cade', text: 'Ok got it' }]);
    }, 700);
  };

  // Auto-scroll messages
  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Canvas animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
      setIsNearEdge(e.clientX < EDGE_ZONE);
    };
    document.addEventListener('mousemove', onMouseMove);

    const draw = (ctx: CanvasRenderingContext2D) => {
      const { x: mx, y: my } = mouseRef.current;
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      const edgeIntensity = Math.max(0, 1 - mx / EDGE_ZONE);
      if (edgeIntensity <= 0) return;

      const t = timeRef.current;

      // Ambient left-edge glow bar
      const barGrad = ctx.createLinearGradient(0, 0, 0, h);
      ANCHORS.forEach((f, i) => {
        const hue = (210 + i * 28) % 360;
        barGrad.addColorStop(f, `hsla(${hue},95%,68%,${0.5 * edgeIntensity})`);
      });
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, h);
      ctx.strokeStyle = barGrad;
      ctx.lineWidth   = 3 * edgeIntensity;
      ctx.shadowColor = `hsla(270,90%,65%,0.9)`;
      ctx.shadowBlur  = 14 * edgeIntensity;
      ctx.globalAlpha = 1;
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Glowing strings — each anchor to cursor
      ANCHORS.forEach((frac, i) => {
        const ay = h * frac;
        const dy = Math.abs(ay - my);
        // Wider proximity: strings reach cursor from further up/down
        const proxWeight = Math.max(0, 1 - dy / (h * 0.55));
        const totalAlpha = edgeIntensity * proxWeight;
        if (totalAlpha < 0.015) return;

        const hue = (210 + i * 28 + t * 0.042) % 360;
        const color = `hsl(${hue},95%,68%)`;

        const wave1 = Math.sin(t * 0.007 + i * 1.3) * 80 * edgeIntensity;
        const wave2 = Math.cos(t * 0.005 + i * 0.8) * 55 * edgeIntensity;

        // Control points fan out from edge toward cursor
        const cp1x = mx * 0.12 + wave1;
        const cp1y = ay * 0.45 + my * 0.55 + wave2;
        const cp2x = mx * 0.62 - wave1 * 0.35;
        const cp2y = ay * 0.30 + my * 0.70 + wave2 * 0.5;

        // 4 glow passes
        const passes: { w: number; a: number; blur: number }[] = [
          { w: 14, a: 0.04, blur: 32 },
          { w:  6, a: 0.10, blur: 16 },
          { w:  2, a: 0.40, blur: 5  },
          { w:  1, a: 0.90, blur: 0  },
        ];

        passes.forEach(({ w, a, blur }) => {
          ctx.beginPath();
          ctx.moveTo(0, ay);
          ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, mx, my);
          ctx.strokeStyle = color;
          ctx.lineWidth   = w;
          ctx.globalAlpha = a * totalAlpha;
          ctx.shadowColor = color;
          ctx.shadowBlur  = blur;
          ctx.stroke();
        });

        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      });

      // Small glowing dot at cursor when near edge
      if (edgeIntensity > 0.1) {
        const dotHue = (t * 1.2) % 360;
        ctx.beginPath();
        ctx.arc(mx, my, 4 * edgeIntensity, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${dotHue},95%,75%)`;
        ctx.shadowColor = `hsl(${dotHue},95%,70%)`;
        ctx.shadowBlur  = 16;
        ctx.globalAlpha = 0.85 * edgeIntensity;
        ctx.fill();
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }
    };

    const loop = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) { timeRef.current++; draw(ctx); }
      frameRef.current = requestAnimationFrame(loop);
    };
    frameRef.current = requestAnimationFrame(loop);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <>
      {/* Full-screen canvas — pointer-events: none */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[38]"
        style={{ pointerEvents: 'none' }}
      />

      {/* Click-zone on left edge */}
      <div
        className="fixed left-0 top-0 bottom-0 z-[39]"
        style={{
          width: chatOpen ? 0 : EDGE_ZONE,
          pointerEvents: isNearEdge && !chatOpen ? 'auto' : 'none',
          cursor: isNearEdge && !chatOpen ? 'pointer' : 'default',
        }}
        onClick={() => setChatOpen(true)}
      />

      {/* ── Full-height Chatbox sidebar ── */}
      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: '-100%', opacity: 0   }}
            animate={{ x: '0%',    opacity: 1   }}
            exit={{    x: '-100%', opacity: 0   }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="fixed z-[48] flex flex-col overflow-hidden"
            style={{
              top: 0, bottom: 0, left: 0,
              width: 380,
              background: isDark
                ? 'rgba(6,6,10,0.97)'
                : 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(28px)',
              borderRight: '1px solid rgba(168,85,247,0.22)',
              boxShadow: '4px 0 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.08)',
            }}
          >
            {/* Animated rainbow top bar */}
            <div className="chat-glow-bar" />

            {/* Header */}
            <div
              style={{
                padding: '16px 18px 14px',
                borderBottom: '1px solid rgba(168,85,247,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {/* Pulsing orb */}
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 6px 2px rgba(168,85,247,0.8)',
                      '0 0 14px 5px rgba(6,182,212,0.9)',
                      '0 0 8px 3px rgba(236,72,153,0.8)',
                      '0 0 6px 2px rgba(168,85,247,0.8)',
                    ],
                  }}
                  transition={{ repeat: Infinity, duration: 2.8, ease: 'easeInOut' }}
                  style={{
                    width: 12, height: 12, borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
                  }}
                />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: isDark ? '#f4f4f5' : '#111', letterSpacing: '-0.01em' }}>
                    Cade
                  </div>
                  <div style={{ fontSize: 9, color: '#6b7280', letterSpacing: '0.14em', fontFamily: 'monospace' }}>
                    ACADEMIC AI  ·  CANVOCADE
                  </div>
                </div>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#555', fontSize: 20, lineHeight: 1, padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            {/* Messages area */}
            <div
              style={{
                flex: 1, overflowY: 'auto', padding: '16px 18px',
                display: 'flex', flexDirection: 'column', gap: 10,
                position: 'relative',
              }}
            >
              {/* Smiley background */}
              <CadeSmiley />

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    zIndex: 1, position: 'relative',
                  }}
                >
                  {msg.role === 'cade' && (
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: 'linear-gradient(135deg,#a855f7,#06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: '#fff', marginRight: 7, marginTop: 2,
                      boxShadow: '0 0 8px rgba(168,85,247,0.5)',
                    }}>
                      C
                    </div>
                  )}
                  <div style={{
                    maxWidth: '72%',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                      : isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                    color: msg.role === 'user'
                      ? '#fff'
                      : isDark ? '#e4e4e7' : '#222',
                    padding: '8px 12px',
                    borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    border: msg.role === 'cade' ? '1px solid rgba(168,85,247,0.15)' : 'none',
                    boxShadow: msg.role === 'user' ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
                  }}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Typing indicator */}
              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 7, zIndex: 1, position: 'relative' }}
                  >
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%',
                      background: 'linear-gradient(135deg,#a855f7,#06b6d4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 9, fontWeight: 700, color: '#fff', flexShrink: 0,
                    }}>C</div>
                    <div style={{
                      background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      borderRadius: '4px 14px 14px 14px',
                      border: '1px solid rgba(168,85,247,0.15)',
                      padding: '8px 14px',
                      display: 'flex', gap: 4, alignItems: 'center',
                    }}>
                      {[0, 0.18, 0.36].map(delay => (
                        <motion.span
                          key={delay}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay, ease: 'easeInOut' }}
                          style={{ width: 5, height: 5, borderRadius: '50%', background: '#a855f7', display: 'inline-block' }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={msgsEndRef} />
            </div>

            {/* Input row */}
            <div
              style={{
                padding: '12px 18px 16px',
                borderTop: '1px solid rgba(168,85,247,0.1)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  borderRadius: 14, padding: '9px 12px',
                  border: '1px solid rgba(168,85,247,0.16)',
                  boxShadow: '0 0 0 0 rgba(168,85,247,0)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                <input
                  autoFocus
                  className="flex-1 bg-transparent outline-none border-none text-sm placeholder:text-gray-500"
                  style={{ color: isDark ? '#f4f4f5' : '#111', fontSize: 13 }}
                  placeholder="Ask Cade anything…"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') send(); }}
                />
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={send}
                  style={{
                    width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                    background: input.trim()
                      ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                      : isDark ? '#1e1e24' : '#e5e7eb',
                    border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: input.trim() ? '#fff' : '#666',
                    fontSize: 14, fontWeight: 700,
                    boxShadow: input.trim() ? '0 0 12px rgba(168,85,247,0.4)' : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  ↑
                </motion.button>
              </div>
              <div style={{ textAlign: 'center', marginTop: 8, fontSize: 9, color: '#3a3a42', letterSpacing: '0.12em', fontFamily: 'monospace' }}>
                CADE  ·  POWERED BY CANVOCADE AI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
