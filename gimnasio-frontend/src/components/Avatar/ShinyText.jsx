import React, { useEffect, useRef } from 'react';

const ShinyText = ({ text = '', disabled = false, speed = 3, className = '' }) => {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || disabled) return;
    const el = ref.current;
    const duration = Math.max(4, 8 / Math.max(1, speed)); // más duración = más suave
    el.style.setProperty('--shine-duration', `${duration}s`);
  }, [disabled, speed]);

  return (
    <span ref={ref} className={`relative inline-block ${className}`}>
      {disabled ? (
        <span className="relative z-10">{text}</span>
      ) : (
        <span
          className="relative z-10 inline-block"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.6) 45%, rgba(255,255,255,0.9) 50%, rgba(255,255,255,0.6) 55%, rgba(255,255,255,0) 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            animation: 'shiny-bg var(--shine-duration) ease-in-out infinite',
          }}
        >
          {text}
        </span>
      )}

      <style>{`
        @keyframes shiny-bg {
          0% { background-position: -150% 0; }
          50% { background-position: 150% 0; }
          100% { background-position: -150% 0; }
        }
      `}</style>
    </span>
  );
};

export default ShinyText;
