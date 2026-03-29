'use client';

import { useState } from 'react';
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

  const [activePage,     setActivePage]     = useState<Page>('dashboard');
  const [pendingPage,    setPendingPage]     = useState<Page | null>(null);
  const [doorsOpen,      setDoorsOpen]       = useState(true);   // ElevatorDoors manages its own entrance
  const [isNavigating,   setIsNavigating]    = useState(false);
  const [hasNavigated,   setHasNavigated]    = useState(false);  // false = center panel visible
  const [contentVisible, setContentVisible]  = useState(false);  // true only after doors fully open

  const navigateTo = (page: Page) => {
    if ((page === activePage && hasNavigated) || isNavigating) return;

    if (!hasNavigated) {
      // First navigation: full elevator door animation
      setHasNavigated(true);
      setContentVisible(false);
      setIsNavigating(true);
      setPendingPage(page);
      setDoorsOpen(false);
    } else {
      // Subsequent navigations: smooth fade only, doors stay open
      setIsNavigating(true);
      setContentVisible(false);
      setTimeout(() => {
        setActivePage(page);
        setContentVisible(true);
        setIsNavigating(false);
      }, 220);
    }
  };

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
      className="min-h-screen bg-gray-50 dark:bg-gray-950"
      style={{ paddingRight: hasNavigated ? 80 : 0 }}
    >
      {/* ── Top bar ── */}
      <header
        className="fixed top-0 left-0 z-30 flex items-center justify-between px-6"
        style={{
          right: hasNavigated ? 80 : 0,
          height: 48,
          background: isDark ? 'rgba(9,9,11,0.92)' : 'rgba(249,250,251,0.92)',
          borderBottom: isDark ? '1px solid #27272a' : '1px solid #e5e7eb',
          backdropFilter: 'blur(12px)',
        }}
      >
        <span className="text-base font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Canvocade
        </span>
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
              {activePage === 'dashboard' && <DashboardPage setActivePage={navigateTo} />}
              {activePage === 'cmpsc473'  && <CoursePage courseId="course_001" />}
              {activePage === 'math251'   && <CoursePage courseId="course_002" />}
              {activePage === 'engl202'   && <CoursePage courseId="course_003" />}
              {activePage === 'professor' && <ProfessorPage />}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* ── Center panel — shown before first navigation ── */}
      <AnimatePresence>
        {!hasNavigated && (
          <CenterPanel onNavigate={navigateTo} />
        )}
      </AnimatePresence>

      {/* ── Glow edge chat (left wall) ── */}
      <GlowEdgeChat />

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
