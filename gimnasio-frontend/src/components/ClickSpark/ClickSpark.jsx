import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const sparkleAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  50% {
    transform: scale(1.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const Sparkle = styled.div`
  position: absolute;
  width: ${(props) => props.size}px;
  height: ${(props) => props.size}px;
  background-color: ${(props) => props.color};
  border-radius: 50%;
  pointer-events: none;
  animation: ${sparkleAnimation} ${(props) => props.duration}ms ease-out forwards;
  transform-origin: center;
`;

const ClickSpark = ({
  children,
  sparkColor,
  sparkSize,
  sparkRadius = 10,
  sparkCount = 1,
  // duration in ms
  duration = 500,
  // backward compatibility
  color: colorProp,
  size: sizeProp,
}) => {
  // resolve props with fallbacks to previous names
  const color = sparkColor || colorProp || 'gold';
  const size = sparkSize || sizeProp || 10;

  const [sparkles, setSparkles] = useState([]);
  const containerRef = useRef(null);
  const timeoutsRef = useRef([]);

  useEffect(() => {
    return () => {
      // limpiar timeouts al desmontar
      timeoutsRef.current.forEach((t) => clearTimeout(t));
      timeoutsRef.current = [];
    };
  }, []);

  const handleClick = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const clickX = e.clientX;
    const clickY = e.clientY;

    // generate multiple sparkles distributed around the click point
    const created = [];
    for (let i = 0; i < Math.max(0, Math.floor(sparkCount)); i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = sparkRadius * Math.random();
      const dx = Math.cos(angle) * dist;
      const dy = Math.sin(angle) * dist;

      const x = Math.round(clickX - rect.left - size / 2 + dx);
      const y = Math.round(clickY - rect.top - size / 2 + dy);

      const newSparkle = { id: Date.now() + Math.random() + i, x, y };
      created.push(newSparkle);
    }

    if (created.length === 0) return;

    setSparkles((prev) => [...prev, ...created]);

    const t = setTimeout(() => {
      const ids = new Set(created.map((c) => c.id));
      setSparkles((current) => current.filter((s) => !ids.has(s.id)));
    }, duration + 50);

    timeoutsRef.current.push(t);
  };

  return (
    <div
      ref={containerRef}
      onClick={handleClick}
      style={{ position: 'relative', display: 'inline-block', width: '100%' }}
    >
      {children}
      {sparkles.map((sparkle) => (
        <Sparkle
          key={sparkle.id}
          size={size}
          color={color}
          duration={duration}
          style={{ left: sparkle.x + 'px', top: sparkle.y + 'px' }}
        />
      ))}
    </div>
  );
};

export default ClickSpark;