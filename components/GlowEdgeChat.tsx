'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

const EDGE_ZONE = 140;
const ANCHORS = [
  0.05, 0.13, 0.22, 0.31, 0.4, 0.5,
  0.59, 0.68, 0.77, 0.86, 0.92, 0.97,
];

interface Message {
  role: 'user' | 'cade';
  text: string;
}

interface GlowEdgeChatProps {
  triggerPrompt?: string | null;
  onPromptConsumed?: () => void;
  rightOffset?: number;
}

type SmileyMode = 'idle' | 'thinking' | 'answering';

function CadeSmiley({ mode }: { mode: SmileyMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef  = useRef<number>(0);
  const tRef      = useRef(0);
  const modeRef     = useRef(mode);
  const prevModeRef = useRef(mode);
  modeRef.current   = mode;

  // Lerped animation state — updated every frame toward target
  const s        = useRef({ mouthOpen: 1, eyeShiftY: 0, eyeScale: 1 });
  // Mouse in canvas-local coordinates (starts far away so no effect on load)
  const mouseCanvas = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const W  = canvas.width;
    const H  = canvas.height;
    const cx = W / 2;
    const cy = H / 2;
    const R  = 74;

    // Track mouse in canvas-local space
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseCanvas.current = {
        x: (e.clientX - rect.left) * (W / rect.width),
        y: (e.clientY - rect.top)  * (H / rect.height),
      };
    };
    const onMouseLeave = () => { mouseCanvas.current = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // Pull a point toward the cursor — same idea as the edge bezier tendrils
    const attract = (px: number, py: number, strength = 22, range = 100): [number, number] => {
      const { x: mx, y: my } = mouseCanvas.current;
      const dx = mx - px;
      const dy = my - py;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 0.1 || dist > range) return [px, py];
      const t = 1 - dist / range;
      const f = t * t * strength;          // quadratic fall-off, just like edge intensity
      return [px + (dx / dist) * f, py + (dy / dist) * f];
    };

    const glowShape = (
      ctx: CanvasRenderingContext2D,
      buildPath: () => void,
      hue: number,
    ) => {
      const col = `hsl(${hue % 360}, 95%, 68%)`;
      ([
        { lw: 12, a: 0.03, blur: 20 },
        { lw:  5, a: 0.10, blur: 10 },
        { lw:  2, a: 0.50, blur:  4 },
        { lw:  1, a: 1.00, blur:  0 },
      ] as { lw: number; a: number; blur: number }[]).forEach(({ lw, a, blur }) => {
        buildPath();
        ctx.strokeStyle = col;
        ctx.lineWidth   = lw;
        ctx.globalAlpha = a;
        ctx.shadowColor = col;
        ctx.shadowBlur  = blur;
        ctx.stroke();
      });
      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;
    };

    const loop = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) { frameRef.current = requestAnimationFrame(loop); return; }

      const T = tRef.current++;
      ctx.clearRect(0, 0, W, H);

      // ── Detect mode change and snap lerp values to kickstart ─────
      const m = modeRef.current;
      if (prevModeRef.current !== m) {
        const prev = prevModeRef.current;
        prevModeRef.current = m;
        // Leaving thinking: snap mouth open and eyes down immediately
        if (prev === 'thinking') {
          s.current.mouthOpen = 0.45;
          s.current.eyeShiftY = s.current.eyeShiftY * 0.3;
          s.current.eyeScale  = 0.95;
        }
        // Leaving answering: snap mouth toward idle
        if (prev === 'answering') {
          s.current.mouthOpen = Math.min(s.current.mouthOpen, 1.2);
        }
      }

      // ── Lerp toward mode targets ──────────────────────────────────
      const LS = 0.1;
      s.current.mouthOpen = lerp(s.current.mouthOpen, m === 'thinking' ? 0.08 : m === 'answering' ? 1.65 : 1, LS);
      s.current.eyeShiftY = lerp(s.current.eyeShiftY, m === 'thinking' ? -10 : 0, LS);
      s.current.eyeScale  = lerp(s.current.eyeScale,  m === 'thinking' ? 0.72 : m === 'answering' ? 1.22 : 1, LS);
      const mo = s.current.mouthOpen;

      // ── Face rings ────────────────────────────────────────────────
      const faceHue = (210 + T * 0.18) % 360;
      const drawFaceRing = (offset: number, phase: number) => {
        glowShape(ctx, () => {
          const N = 48;
          ctx.beginPath();
          for (let i = 0; i <= N; i++) {
            const a = (i / N) * Math.PI * 2;
            const w = Math.sin(a * 3 + T * 0.022 + phase) * 3.2 + Math.cos(a * 5 + T * 0.015 + phase) * 1.8;
            const r = R + offset + w;
            const [ax, ay] = attract(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
            i === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
          }
          ctx.closePath();
        }, faceHue);
      };
      drawFaceRing(-4, 0);
      drawFaceRing(+4, Math.PI);

      // ── Eyes (shift up when thinking, grow when answering) ────────
      const eyeHue = (270 + T * 0.26) % 360;
      const drawEye = (ex: number, ey: number, phase: number) => {
        const eRx = 11 * s.current.eyeScale;
        const eRy =  7 * s.current.eyeScale;
        glowShape(ctx, () => {
          const EN = 24;
          ctx.beginPath();
          for (let i = 0; i <= EN; i++) {
            const a = (i / EN) * Math.PI * 2;
            const w = Math.sin(a * 3 + T * 0.05 + phase) * 1.1;
            const [ax, ay] = attract(ex + Math.cos(a) * (eRx + w), ey + Math.sin(a) * (eRy + w * 0.5), 18, 80);
            i === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
          }
          ctx.closePath();
        }, eyeHue);
        glowShape(ctx, () => {
          const PN = 12;
          ctx.beginPath();
          for (let i = 0; i <= PN; i++) {
            const a = (i / PN) * Math.PI * 2;
            const w = Math.sin(a * 4 + T * 0.09 + phase) * 0.7;
            const [ax, ay] = attract(ex + Math.cos(a) * (3.2 + w), ey + Math.sin(a) * (3.2 + w), 18, 80);
            i === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
          }
          ctx.closePath();
        }, (eyeHue + 55) % 360);
      };
      const eyeY = cy - R * 0.27 + s.current.eyeShiftY;
      drawEye(cx - R * 0.36, eyeY, 0);
      drawEye(cx + R * 0.36, eyeY, Math.PI);

      // ── Mouth – scales with mouthOpen ─────────────────────────────
      const smileHue   = (160 + T * 0.22) % 360;
      const mHalfW     = R * (0.28 + 0.24 * Math.min(mo, 1));
      const mouthTopY  = cy + R * 0.24;
      const arcH       = R * (0.03 + 0.46 * mo);
      const topBow     = 11 * Math.min(mo, 1);

      // upper lip
      glowShape(ctx, () => {
        const SN = 28;
        ctx.beginPath();
        for (let i = 0; i < SN; i++) {
          const frac = i / (SN - 1);
          const wave = Math.sin(frac * Math.PI * 4 + T * 0.04) * 1.4;
          const [ax, ay] = attract(
            (cx - mHalfW) + frac * mHalfW * 2,
            mouthTopY + Math.sin(frac * Math.PI) * topBow + wave,
            16, 90,
          );
          i === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
        }
      }, smileHue);

      // lower arc
      glowShape(ctx, () => {
        const AN = 36;
        ctx.beginPath();
        for (let i = 0; i <= AN; i++) {
          const frac  = i / AN;
          const angle = frac * Math.PI;
          const wave  = Math.sin(frac * Math.PI * 5 + T * 0.038) * 1.5;
          const [ax, ay] = attract(
            cx + Math.cos(angle) * (mHalfW + wave * 0.3),
            mouthTopY + Math.sin(angle) * (arcH + wave * 0.5),
            16, 90,
          );
          i === 0 ? ctx.moveTo(ax, ay) : ctx.lineTo(ax, ay);
        }
      }, (smileHue + 30) % 360);

      // ── Thinking dots (fade in when mouthOpen → 0) ───────────────
      const dotAlpha = Math.max(0, 1 - mo * 5);
      if (dotAlpha > 0.01) {
        const dotY = mouthTopY + 6;
        ([-15, 0, 15] as number[]).forEach((dx, i) => {
          const pulse = 0.45 + 0.55 * Math.sin(T * 0.09 + i * 1.15);
          const dotHue = (eyeHue + i * 35) % 360;
          const col    = `hsl(${dotHue}, 95%, 68%)`;
          ctx.globalAlpha = dotAlpha * pulse * 0.9;
          ctx.shadowColor = col;
          ctx.shadowBlur  = 10;
          ctx.fillStyle   = col;
          ctx.beginPath();
          ctx.arc(cx + dx, dotY, Math.max(0, 3.5 * pulse), 0, Math.PI * 2);
          ctx.fill();
        });
        ctx.globalAlpha = 1;
        ctx.shadowBlur  = 0;
      }

      frameRef.current = requestAnimationFrame(loop);
    };

    frameRef.current = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={200}
      height={200}
      style={{
        position: 'absolute',
        bottom: 55,
        left: '50%',
        transform: 'translateX(-50%)',
        pointerEvents: 'none',
        opacity: 0.52,
      }}
    />
  );
}

export default function GlowEdgeChat({
  triggerPrompt,
  onPromptConsumed,
  rightOffset = 0,
}: GlowEdgeChatProps = {}) {
  const { isDark } = useTheme();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 9999, y: 0 });
  const frameRef = useRef<number>(0);
  const timeRef = useRef(0);
  const msgsEndRef = useRef<HTMLDivElement>(null);
  const rightOffsetRef = useRef(rightOffset);
  const onPromptConsumedRef = useRef(onPromptConsumed);

  rightOffsetRef.current = rightOffset;
  onPromptConsumedRef.current = onPromptConsumed;

  const [isNearEdge, setIsNearEdge] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSide, setChatSide] = useState<'left' | 'right'>('left');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'cade', text: "Hey! I'm Cade 👋 Ask me anything about your courses." },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!triggerPrompt) return;
    setChatSide(rightOffset > 0 ? 'right' : 'left');
    setChatOpen(true);
    setMessages(prev => [...prev, { role: 'cade', text: triggerPrompt }]);
    onPromptConsumedRef.current?.();
  }, [triggerPrompt, rightOffset]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;

    setInput('');
    const updatedMessages: Message[] = [...messages, { role: 'user', text }];
    setMessages(updatedMessages);
    setTyping(true);

    try {
      const history = updatedMessages
        .slice(0, -1)
        .filter(m => m.role === 'user' || m.role === 'cade')
        .map(m => ({ role: m.role === 'cade' ? 'assistant' : 'user', content: m.text }));

      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history }),
      });
      const data = await res.json();
      setTyping(false);
      setMessages(prev => [...prev, { role: 'cade', text: data.answer }]);
    } catch {
      setTyping(false);
      setMessages(prev => [...prev, { role: 'cade', text: "Sorry, I couldn't reach the server. Make sure the backend is running." }]);
    }
  };

  useEffect(() => {
    msgsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };

      const w = window.innerWidth;
      const wallX = w - rightOffsetRef.current;

      const nearLeft = e.clientX < EDGE_ZONE;
      const nearRight = e.clientX > wallX - EDGE_ZONE;

      setIsNearEdge(nearLeft || nearRight);
    };

    document.addEventListener('mousemove', onMouseMove);

    const draw = (ctx: CanvasRenderingContext2D) => {
      const { x: mx, y: my } = mouseRef.current;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      const t = timeRef.current;

      const edgeIntensity = Math.max(0, 1 - mx / EDGE_ZONE);

      if (edgeIntensity > 0) {
        const barGrad = ctx.createLinearGradient(0, 0, 0, h);
        ANCHORS.forEach((f, i) => {
          const hue = (210 + i * 28) % 360;
          barGrad.addColorStop(f, `hsla(${hue},95%,68%,${0.5 * edgeIntensity})`);
        });

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, h);
        ctx.strokeStyle = barGrad;
        ctx.lineWidth = 3 * edgeIntensity;
        ctx.shadowColor = 'hsla(270,90%,65%,0.9)';
        ctx.shadowBlur = 14 * edgeIntensity;
        ctx.globalAlpha = 1;
        ctx.stroke();
        ctx.shadowBlur = 0;

        ANCHORS.forEach((frac, i) => {
          const ay = h * frac;
          const dy = Math.abs(ay - my);
          const proxWeight = Math.max(0, 1 - dy / (h * 0.55));
          const totalAlpha = edgeIntensity * proxWeight;
          if (totalAlpha < 0.015) return;

          const hue = (210 + i * 28 + t * 0.042) % 360;
          const color = `hsl(${hue},95%,68%)`;

          const wave1 = Math.sin(t * 0.007 + i * 1.3) * 80 * edgeIntensity;
          const wave2 = Math.cos(t * 0.005 + i * 0.8) * 55 * edgeIntensity;

          const cp1x = mx * 0.12 + wave1;
          const cp1y = ay * 0.45 + my * 0.55 + wave2;
          const cp2x = mx * 0.62 - wave1 * 0.35;
          const cp2y = ay * 0.3 + my * 0.7 + wave2 * 0.5;

          const passes: { w: number; a: number; blur: number }[] = [
            { w: 14, a: 0.04, blur: 32 },
            { w: 6, a: 0.1, blur: 16 },
            { w: 2, a: 0.4, blur: 5 },
            { w: 1, a: 0.9, blur: 0 },
          ];

          passes.forEach(({ w: lw, a, blur }) => {
            ctx.beginPath();
            ctx.moveTo(0, ay);
            ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, mx, my);
            ctx.strokeStyle = color;
            ctx.lineWidth = lw;
            ctx.globalAlpha = a * totalAlpha;
            ctx.shadowColor = color;
            ctx.shadowBlur = blur;
            ctx.stroke();
          });

          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        });

        if (edgeIntensity > 0.1) {
          const dotHue = (t * 1.2) % 360;
          ctx.beginPath();
          ctx.arc(mx, my, 4 * edgeIntensity, 0, Math.PI * 2);
          ctx.fillStyle = `hsl(${dotHue},95%,75%)`;
          ctx.shadowColor = `hsl(${dotHue},95%,70%)`;
          ctx.shadowBlur = 16;
          ctx.globalAlpha = 0.85 * edgeIntensity;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.shadowBlur = 0;
        }
      }

      const rOffset = rightOffsetRef.current;
      {
        const wallX = w - rOffset;
        const rEdgeIntensity = Math.max(0, 1 - (wallX - mx) / EDGE_ZONE);

        if (rEdgeIntensity > 0) {
          const rBarGrad = ctx.createLinearGradient(0, 0, 0, h);
          ANCHORS.forEach((f, i) => {
            const hue = (30 + i * 28) % 360;
            rBarGrad.addColorStop(f, `hsla(${hue},95%,68%,${0.5 * rEdgeIntensity})`);
          });

          ctx.beginPath();
          ctx.moveTo(wallX, 0);
          ctx.lineTo(wallX, h);
          ctx.strokeStyle = rBarGrad;
          ctx.lineWidth = 3 * rEdgeIntensity;
          ctx.shadowColor = 'hsla(30,90%,65%,0.9)';
          ctx.shadowBlur = 14 * rEdgeIntensity;
          ctx.globalAlpha = 1;
          ctx.stroke();
          ctx.shadowBlur = 0;

          ANCHORS.forEach((frac, i) => {
            const ay = h * frac;
            const dy = Math.abs(ay - my);
            const proxWeight = Math.max(0, 1 - dy / (h * 0.55));
            const totalAlpha = rEdgeIntensity * proxWeight;
            if (totalAlpha < 0.015) return;

            const hue = (30 + i * 28 + t * 0.042) % 360;
            const color = `hsl(${hue},95%,68%)`;

            const wave1 = Math.sin(t * 0.007 + i * 1.3) * 80 * rEdgeIntensity;
            const wave2 = Math.cos(t * 0.005 + i * 0.8) * 55 * rEdgeIntensity;

            const distToWall = wallX - mx;
            const cp1x = wallX - distToWall * 0.12 + wave1;
            const cp1y = ay * 0.45 + my * 0.55 + wave2;
            const cp2x = wallX - distToWall * 0.62 - wave1 * 0.35;
            const cp2y = ay * 0.3 + my * 0.7 + wave2 * 0.5;

            const passes: { w: number; a: number; blur: number }[] = [
              { w: 14, a: 0.04, blur: 32 },
              { w: 6, a: 0.1, blur: 16 },
              { w: 2, a: 0.4, blur: 5 },
              { w: 1, a: 0.9, blur: 0 },
            ];

            passes.forEach(({ w: lw, a, blur }) => {
              ctx.beginPath();
              ctx.moveTo(wallX, ay);
              ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, mx, my);
              ctx.strokeStyle = color;
              ctx.lineWidth = lw;
              ctx.globalAlpha = a * totalAlpha;
              ctx.shadowColor = color;
              ctx.shadowBlur = blur;
              ctx.stroke();
            });

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          });

          if (rEdgeIntensity > 0.1) {
            const dotHue = (t * 1.2 + 180) % 360;
            ctx.beginPath();
            ctx.arc(mx, my, 4 * rEdgeIntensity, 0, Math.PI * 2);
            ctx.fillStyle = `hsl(${dotHue},95%,75%)`;
            ctx.shadowColor = `hsl(${dotHue},95%,70%)`;
            ctx.shadowBlur = 16;
            ctx.globalAlpha = 0.85 * rEdgeIntensity;
            ctx.fill();
            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
          }
        }
      }
    };

    const loop = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        timeRef.current++;
        draw(ctx);
      }
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
      <canvas
        ref={canvasRef}
        className="fixed inset-0 z-[38]"
        style={{ pointerEvents: 'none' }}
      />

      <div
        className="fixed left-0 top-0 bottom-0 z-[39]"
        style={{
          width: chatOpen ? 0 : EDGE_ZONE,
          pointerEvents: !chatOpen && isNearEdge ? 'auto' : 'none',
          cursor: !chatOpen && isNearEdge ? 'pointer' : 'default',
        }}
        onClick={() => {
          setChatSide('left');
          setChatOpen(true);
        }}
      />

      <div
        className="fixed top-0 bottom-0 z-[39]"
        style={{
          right: rightOffset,
          width: chatOpen ? 0 : EDGE_ZONE,
          pointerEvents: !chatOpen && isNearEdge ? 'auto' : 'none',
          cursor: !chatOpen && isNearEdge ? 'pointer' : 'default',
        }}
        onClick={() => {
          setChatSide('right');
          setChatOpen(true);
        }}
      />

      <AnimatePresence>
        {chatOpen && (
          <motion.div
            initial={{ x: chatSide === 'left' ? '-100%' : '100%', opacity: 0 }}
            animate={{ x: '0%', opacity: 1 }}
            exit={{ x: chatSide === 'left' ? '-100%' : '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 34 }}
            className="fixed z-[52] flex flex-col overflow-hidden"
            style={{
              top: 48,
              bottom: 0,
              left: chatSide === 'left' ? 0 : 'auto',
              right: chatSide === 'right' ? rightOffset : 'auto',
              width: 380,
              background: isDark ? 'rgba(6,6,10,0.97)' : 'rgba(255,255,255,0.98)',
              backdropFilter: 'blur(28px)',
              borderRight: chatSide === 'left' ? '1px solid rgba(168,85,247,0.22)' : 'none',
              borderLeft: chatSide === 'right' ? '1px solid rgba(168,85,247,0.22)' : 'none',
              boxShadow:
                chatSide === 'left'
                  ? '4px 0 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.08)'
                  : '-4px 0 60px rgba(0,0,0,0.6), 0 0 40px rgba(168,85,247,0.08)',
            }}
          >
            <div className="chat-glow-bar" />

            <div
              style={{
                padding: '16px 18px 14px',
                borderBottom: '1px solid rgba(168,85,247,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: 'linear-gradient(135deg, #a855f7, #06b6d4)',
                  }}
                />
                <div>
                  <div
                    style={{
                      fontSize: 15,
                      fontWeight: 700,
                      color: isDark ? '#f4f4f5' : '#111',
                      letterSpacing: '-0.01em',
                    }}
                  >
                    Cade
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      color: '#6b7280',
                      letterSpacing: '0.14em',
                      fontFamily: 'monospace',
                    }}
                  >
                    ACADEMIC AI  ·  CANVOCADE
                  </div>
                </div>
              </div>

              <button
                onClick={() => setChatOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#555',
                  fontSize: 20,
                  lineHeight: 1,
                  padding: 4,
                }}
              >
                ✕
              </button>
            </div>

            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 18px',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                position: 'relative',
              }}
            >
              <CadeSmiley mode={typing ? 'answering' : input.trim() ? 'thinking' : 'idle'} />

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    display: 'flex',
                    justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    zIndex: 1,
                    position: 'relative',
                  }}
                >
                  {msg.role === 'cade' && (
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        flexShrink: 0,
                        background: 'linear-gradient(135deg,#a855f7,#06b6d4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#fff',
                        marginRight: 7,
                        marginTop: 2,
                        boxShadow: '0 0 8px rgba(168,85,247,0.5)',
                      }}
                    >
                      C
                    </div>
                  )}

                  <div
                    style={{
                      maxWidth: '72%',
                      background:
                        msg.role === 'user'
                          ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                          : isDark
                            ? 'rgba(255,255,255,0.06)'
                            : 'rgba(0,0,0,0.05)',
                      color:
                        msg.role === 'user'
                          ? '#fff'
                          : isDark
                            ? '#e4e4e7'
                            : '#222',
                      padding: '8px 12px',
                      borderRadius: msg.role === 'user' ? '14px 14px 4px 14px' : '4px 14px 14px 14px',
                      fontSize: 13,
                      lineHeight: 1.5,
                      border: msg.role === 'cade' ? '1px solid rgba(168,85,247,0.15)' : 'none',
                      boxShadow: msg.role === 'user' ? '0 2px 12px rgba(99,102,241,0.3)' : 'none',
                    }}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              <AnimatePresence>
                {typing && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 7,
                      zIndex: 1,
                      position: 'relative',
                    }}
                  >
                    <div
                      style={{
                        width: 22,
                        height: 22,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg,#a855f7,#06b6d4)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 9,
                        fontWeight: 700,
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      C
                    </div>

                    <div
                      style={{
                        background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                        borderRadius: '4px 14px 14px 14px',
                        border: '1px solid rgba(168,85,247,0.15)',
                        padding: '8px 14px',
                        display: 'flex',
                        gap: 4,
                        alignItems: 'center',
                      }}
                    >
                      {[0, 0.18, 0.36].map(delay => (
                        <motion.span
                          key={delay}
                          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay, ease: 'easeInOut' }}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: '50%',
                            background: '#a855f7',
                            display: 'inline-block',
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={msgsEndRef} />
            </div>

            <div
              style={{
                padding: '12px 18px 16px',
                borderTop: '1px solid rgba(168,85,247,0.1)',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                  borderRadius: 14,
                  padding: '9px 12px',
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
                  onKeyDown={e => {
                    if (e.key === 'Enter') send();
                  }}
                />

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.08 }}
                  onClick={send}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: '50%',
                    flexShrink: 0,
                    background: input.trim()
                      ? 'linear-gradient(135deg, #a855f7, #6366f1)'
                      : isDark
                        ? '#1e1e24'
                        : '#e5e7eb',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: input.trim() ? '#fff' : '#666',
                    fontSize: 14,
                    fontWeight: 700,
                    boxShadow: input.trim() ? '0 0 12px rgba(168,85,247,0.4)' : 'none',
                    transition: 'background 0.2s, box-shadow 0.2s',
                  }}
                >
                  ↑
                </motion.button>
              </div>

              <div
                style={{
                  textAlign: 'center',
                  marginTop: 8,
                  fontSize: 9,
                  color: '#3a3a42',
                  letterSpacing: '0.12em',
                  fontFamily: 'monospace',
                }}
              >
                CADE  ·  POWERED BY CANVOCADE AI
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}