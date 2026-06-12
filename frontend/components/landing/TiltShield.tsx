// TiltShield.tsx
'use client';

import React, { useEffect, useRef } from 'react';

type TiltShieldProps = {
  /** CSS width/height классы для контейнера (Tailwind) */
  className?: string;
  /** aria-label для доступности */
  ariaLabel?: string;
  /** максимальный угол поворота по X (deg) */
  maxRotateX?: number;
  /** максимальный угол поворота по Y (deg) */
  maxRotateY?: number;
  /** мягкое масштабирование при наведении */
  hoverScale?: number;
};

export default function TiltShield({
  className = '',
  ariaLabel = 'Shield icon representing security and compliance',
  maxRotateX = 12,
  maxRotateY = 18,
  hoverScale = 1.02,
}: TiltShieldProps) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const innerRef = useRef<HTMLDivElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef({ rx: 0, ry: 0, tx: 0, ty: 0 });

  useEffect(() => {
    const root = rootRef.current;
    const inner = innerRef.current;
    if (!root || !inner) return;

    const getRect = () => root.getBoundingClientRect();

    const schedule = () => {
      if (rafRef.current) return;
      rafRef.current = requestAnimationFrame(() => {
        const { rx, ry, tx, ty } = stateRef.current;
        inner.style.transform = `perspective(900px) translate3d(${tx}px, ${ty}px, 0px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(${hoverScale}, ${hoverScale}, ${hoverScale})`;
        rafRef.current = null;
      });
    };

    const onMove = (e: MouseEvent) => {
      const r = getRect();
      const px = (e.clientX - r.left) / r.width; // 0..1
      const py = (e.clientY - r.top) / r.height; // 0..1

      const ry = (px - 0.5) * maxRotateY; // rotateY
      const rx = (0.5 - py) * maxRotateX; // rotateX
      const tx = (px - 0.5) * 6; // subtle translate
      const ty = (py - 0.5) * 6;

      stateRef.current = { rx, ry, tx, ty };
      schedule();
    };

    const onLeave = () => {
      stateRef.current = { rx: 0, ry: 0, tx: 0, ty: 0 };
      schedule();
    };

    const onFocus = () => {
      // keyboard focus: subtle tilt
      stateRef.current = { rx: -6, ry: 6, tx: 2, ty: -2 };
      schedule();
    };

    const onBlur = () => {
      stateRef.current = { rx: 0, ry: 0, tx: 0, ty: 0 };
      schedule();
    };

    // Touch fallback: small scale on touchstart
    const onTouchStart = () => {
      inner.style.transition = 'transform 220ms cubic-bezier(.2,.9,.2,1)';
      inner.style.transform = `perspective(900px) scale3d(${hoverScale},${hoverScale},${hoverScale})`;
    };
    const onTouchEnd = () => {
      inner.style.transition = 'transform 420ms cubic-bezier(.2,.9,.2,1)';
      stateRef.current = { rx: 0, ry: 0, tx: 0, ty: 0 };
      schedule();
    };

    root.addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('focus', onFocus);
    root.addEventListener('blur', onBlur);
    root.addEventListener('touchstart', onTouchStart, { passive: true });
    root.addEventListener('touchend', onTouchEnd);

    // ensure smooth transitions when leaving/focusing via keyboard
    const cleanup = () => {
      root.removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('focus', onFocus);
      root.removeEventListener('blur', onBlur);
      root.removeEventListener('touchstart', onTouchStart);
      root.removeEventListener('touchend', onTouchEnd);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };

    return cleanup;
  }, [maxRotateX, maxRotateY, hoverScale]);

  return (
    <div
      ref={rootRef}
      role="img"
      aria-label={ariaLabel}
      tabIndex={0}
      className={`relative inline-flex items-center justify-center ${className}`}
      // keyboard users rely on focus styles; keep outline for accessibility
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {/* subtle glow / shadow layer behind the shield */}
      <div
        aria-hidden
        className="absolute inset-0 rounded-[28px] pointer-events-none"
        style={{
          boxShadow: '0 20px 40px rgba(0,123,255,0.12)',
          filter: 'blur(18px)',
          transform: 'scale(1.06)',
          zIndex: 0,
        }}
      />

      {/* inner wrapper that will be transformed */}
      <div
        ref={innerRef}
        data-tilt-inner
        className="relative z-10 flex items-center justify-center rounded-[20px] select-none"
        style={{
          transition: 'transform 420ms cubic-bezier(.2,.9,.2,1)',
          willChange: 'transform',
        }}
      >
        {/* SVG shield */}
        <svg
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
          className="block w-40 h-40 md:w-56 md:h-56"
          xmlns="http://www.w3.org/2000/svg"
          role="presentation"
          focusable="false"
        >
          <defs>
            <linearGradient id="ts_shield_grad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#6fb8ff" />
              <stop offset="50%" stopColor="#0096df" />
              <stop offset="100%" stopColor="#005fcc" />
            </linearGradient>
            <linearGradient id="ts_shield_high" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.0)" />
            </linearGradient>
            <filter id="ts_inner_shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="8" stdDeviation="18" floodColor="#005fcc" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* main shield shape */}
          <path
            d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"
            fill="url(#ts_shield_grad)"
            stroke="#004f9e"
            strokeWidth="1.2"
            style={{ filter: 'url(#ts_inner_shadow)' }}
          />

          {/* subtle highlight */}
          <path
            d="M6 6c2-1 4-1.6 6-1.6s4 .6 6 1.6v6.5c0 3.2-4 6.2-6 7-2-0.8-6-3.8-6-7V6z"
            fill="url(#ts_shield_high)"
            opacity="0.9"
          />
        </svg>
      </div>
    </div>
  );
}
