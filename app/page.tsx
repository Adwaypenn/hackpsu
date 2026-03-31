'use client';

import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Page } from '@/types';
import { useTheme }    from '@/contexts/ThemeContext';
import NavBar          from '@/components/NavBar';
import ElevatorDoors   from '@/components/ElevatorDoors';
import GlowEdgeChat    from '@/components/GlowEdgeChat';
import CenterPanel     from '@/components/CenterPanel';
import SettingsPanel   from '@/components/SettingsPanel';
import DashboardPage   from '@/components/pages/DashboardPage';
import CoursePage      from '@/components/pages/CoursePage';
import ProfessorPage   from '@/components/pages/ProfessorPage';

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1"  x2="12" y2="3"  />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22"  y1="4.22"  x2="5.64"  y2="5.64"  />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1"  y1="12" x2="3"  y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22"  y1="19.78" x2="5.64"  y2="18.36" />
      <line x1="18.36" y1="5.64"  x2="19.78" y2="4.22"  />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}

export default function Home() {
  const { isDark, toggle } = useTheme();

  const [activePage,        setActivePage]        = useState<Page>('dashboard');
  const [pendingPage,       setPendingPage]        = useState<Page | null>(null);
  const [doorsOpen,         setDoorsOpen]          = useState(true);
  const [isNavigating,      setIsNavigating]       = useState(false);
  const [hasNavigated,      setHasNavigated]       = useState(false);
  const [firstLoad,         setFirstLoad]          = useState(true);
  const [contentVisible,    setContentVisible]     = useState(false);
  const [chatTriggerPrompt, setChatTriggerPrompt]  = useState<string | null>(null);

  // Keep a ref to latest nav state so keyboard handler never goes stale
  const navRef = useRef({ hasNavigated, isNavigating, activePage });
  navRef.current = { hasNavigated, isNavigating, activePage };

  const handleStartStudy = (mode: string, intensity: number) => {
    const prompt = `Are you ready for the ${mode} at the intensity ${intensity}? For which course and for which test are you preparing for?`;
    setChatTriggerPrompt(prompt);
  };

  const navigateTo = (page: Page) => {
    if ((page === activePage && hasNavigated) || isNavigating) return;
    if (!hasNavigated) { setHasNavigated(true); setFirstLoad(false); }
    setContentVisible(false);
    setIsNavigating(true);
    setPendingPage(page);
    setDoorsOpen(false);
  };

  // Keyboard shortcuts: 1 → CMPSC 473, 2 → MATH 251, 3 → ENGL 202
  const navigateRef = useRef(navigateTo);
  navigateRef.current = navigateTo;

  useEffect(() => {
    const KEY_MAP: Record<string, Page> = {
      '1': 'cmpsc473', '2': 'math251', '3': 'engl202',
    };
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;
      const { hasNavigated, isNavigating } = navRef.current;
      if (!hasNavigated || isNavigating) return;
      const page = KEY_MAP[e.key];
      if (page) navigateRef.current(page);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleDoorsClosed = () => {
    if (pendingPage) {
      setActivePage(pendingPage);
      setPendingPage(null);
      setTimeout(() => setDoorsOpen(true), 180);
    }
  };

  const handleDoorsOpened = () => {
    setIsNavigating(false);
    setContentVisible(true);    // reveal content only after doors are fully open
  };

  return (
    <div
      id="page-zoom-wrapper"
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
      style={{ paddingRight: hasNavigated ? 80 : 0 }}
    >
      {/* ── Top bar ── */}
      <header
        className="fixed top-0 left-0 z-[50] flex items-center justify-between px-6"
        style={{
          right: hasNavigated ? 80 : 0,
          height: 48,
          background: isDark ? 'rgba(9,9,11,0.92)' : 'rgba(249,250,251,0.92)',
          borderBottom: isDark ? '1px solid #27272a' : '1px solid #e5e7eb',
          backdropFilter: 'blur(12px)',
        }}
      >
        <button
          onClick={() => { if (!isNavigating) { setHasNavigated(false); setContentVisible(false); setFirstLoad(false); } }}
          style={{ background: 'none', border: 'none', cursor: isNavigating ? 'default' : 'pointer', padding: 0 }}
          className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity"
          title="Back to home"
        >
          Canvocade
        </button>
        <button
          onClick={toggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-all"
          style={{
            background: isDark ? '#27272a' : '#f3f4f6',
            color: isDark ? '#a1a1aa' : '#6b7280',
            border: isDark ? '1px solid #3f3f46' : '1px solid #e5e7eb',
          }}
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <SunIcon /> : <MoonIcon />}
          <span style={{ fontSize: 11, letterSpacing: '0.04em', fontFamily: 'monospace' }}>
            {isDark ? 'LIGHT' : 'DARK'}
          </span>
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="max-w-5xl mx-auto" style={{ paddingTop: 48 }}>
        <AnimatePresence mode="wait">
          {hasNavigated && contentVisible && (
            <motion.div
              key={activePage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {activePage === 'dashboard' && <DashboardPage setActivePage={navigateTo} onStartStudy={handleStartStudy} />}
              {activePage === 'cmpsc473'  && <CoursePage courseId="course_001" />}
              {activePage === 'math251'   && <CoursePage courseId="course_002" />}
              {activePage === 'engl202'   && <CoursePage courseId="course_003" />}
              {activePage === 'professor' && <ProfessorPage />}
              {activePage === 'basement'  && (
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  justifyContent: 'center', minHeight: '60vh',
                }}>
                  <div style={{ fontSize: 13, letterSpacing: '0.22em', fontFamily: 'monospace', color: '#555' }}>
                    BASEMENT  ·  B
                  </div>
                  <div style={{ fontSize: 11, color: '#2a2a2e', marginTop: 8, letterSpacing: '0.1em', fontFamily: 'monospace' }}>
                    Study sessions coming soon
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Center panel — shown before first navigation ── */}
      <AnimatePresence>
        {!hasNavigated && (
          <CenterPanel onNavigate={navigateTo} onStartStudy={handleStartStudy} firstLoad={firstLoad} />
        )}
      </AnimatePresence>

      {/* ── Glow edge chat (left wall) + right wall mirror ── */}
      <GlowEdgeChat
        triggerPrompt={chatTriggerPrompt}
        onPromptConsumed={() => setChatTriggerPrompt(null)}
        rightOffset={hasNavigated ? 80 : 0}
      />

      {/* ── Right elevator button panel — shown after first navigation ── */}
      <AnimatePresence>
        {hasNavigated && (
          <motion.div
            initial={{ x: 80, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.1 }}
          >
            <NavBar activePage={activePage} onNavigate={navigateTo} disabled={isNavigating} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings panel ── */}
      <SettingsPanel />

      {/* ── Elevator doors overlay ── */}
      <ElevatorDoors
        isOpen={doorsOpen}
        onClosed={handleDoorsClosed}
        onOpened={handleDoorsOpened}
      />
    </div>
  );
}
