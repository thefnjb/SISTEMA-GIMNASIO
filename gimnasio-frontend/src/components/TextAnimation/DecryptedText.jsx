import { useEffect, useState, useRef } from 'react';

export default function DecryptedText({
  text,
  speed = 50,
  maxIterations = 10,
  sequential = false,
  revealDirection = 'start',
  useOriginalCharsOnly = false,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()_+',
  className = '',
  parentClassName = '',
  encryptedClassName = '',
  animateOn = 'view',
  ...props
}) {
  const [displayText, setDisplayText] = useState(text);
  const [isHovering, setIsHovering] = useState(false);
  const [isScrambling, setIsScrambling] = useState(false);
  const [revealedIndices, setRevealedIndices] = useState(new Set());
  const [isClicked, setIsClicked] = useState(false); // Estado para controlar si se hizo clic
  const containerRef = useRef(null);

  useEffect(() => {
    let interval;
    let currentIteration = 0;

    const getNextIndex = revealedSet => {
      const textLength = text.length;
      switch (revealDirection) {
        case 'start':
          return revealedSet.size;
        case 'end':
          return textLength - 1 - revealedSet.size;
        case 'center': {
          const middle = Math.floor(textLength / 2);
          const offset = Math.floor(revealedSet.size / 2);
          const nextIndex = revealedSet.size % 2 === 0 ? middle + offset : middle - offset - 1;

          if (nextIndex >= 0 && nextIndex < textLength && !revealedSet.has(nextIndex)) {
            return nextIndex;
          }
          for (let i = 0; i < textLength; i++) {
            if (!revealedSet.has(i)) return i;
          }
          return 0;
        }
        default:
          return revealedSet.size;
      }
    };

    const availableChars = useOriginalCharsOnly
      ? Array.from(new Set(text.split(''))).filter(char => char !== ' ')
      : characters.split('');

    const shuffleText = (originalText, currentRevealed) => {
      if (useOriginalCharsOnly) {
        const positions = originalText.split('').map((char, i) => ({
          char,
          isSpace: char === ' ',
          index: i,
          isRevealed: currentRevealed.has(i)
        }));

        const nonSpaceChars = positions.filter(p => !p.isSpace && !p.isRevealed).map(p => p.char);

        for (let i = nonSpaceChars.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [nonSpaceChars[i], nonSpaceChars[j]] = [nonSpaceChars[j], nonSpaceChars[i]];
        }

        let charIndex = 0;
        return positions
          .map(p => {
            if (p.isSpace) return ' ';
            if (p.isRevealed) return originalText[p.index];
            return nonSpaceChars[charIndex++];
          })
          .join('');
      } else {
        return originalText
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            if (currentRevealed.has(i)) return originalText[i];
            return availableChars[Math.floor(Math.random() * availableChars.length)];
          })
          .join('');
      }
    };

    // Si se hizo clic, mostrar texto completo inmediatamente
    if (isClicked) {
      setDisplayText(text);
      setRevealedIndices(new Set(Array.from({ length: text.length }, (_, i) => i)));
      setIsScrambling(false);
      return;
    }

    if (isHovering || animateOn === 'view') {
      setIsScrambling(true);
      interval = setInterval(() => {
        setRevealedIndices(prevRevealed => {
          if (sequential) {
            if (prevRevealed.size < text.length) {
              const nextIndex = getNextIndex(prevRevealed);
              const newRevealed = new Set(prevRevealed);
              newRevealed.add(nextIndex);
              setDisplayText(shuffleText(text, newRevealed));
              return newRevealed;
            } else {
              clearInterval(interval);
              setIsScrambling(false);
              return prevRevealed;
            }
          } else {
            setDisplayText(shuffleText(text, prevRevealed));
            currentIteration++;
            if (currentIteration >= maxIterations) {
              clearInterval(interval);
              setIsScrambling(false);
              setDisplayText(text);
            }
            return prevRevealed;
          }
        });
      }, speed);
    } else {
      setDisplayText(text);
      setRevealedIndices(new Set());
      setIsScrambling(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isHovering, text, speed, maxIterations, sequential, revealDirection, characters, useOriginalCharsOnly, animateOn, isClicked]);

  useEffect(() => {
    if (animateOn === 'view' || animateOn === 'both') {
      // Resetear cuando el componente se monta o el texto cambia
      setIsHovering(false);
      setRevealedIndices(new Set());
      setDisplayText(text);
      setIsClicked(false); // Resetear el estado de clic cuando cambia el texto
      
      // Pequeño delay para asegurar que el componente está renderizado
      const timer = setTimeout(() => {
        setIsHovering(true);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [animateOn, text]);

  const hoverProps =
    animateOn === 'hover' || animateOn === 'both'
      ? {
          onMouseEnter: () => setIsHovering(true),
          onMouseLeave: () => setIsHovering(false)
        }
      : {};

  return (
    <div
      ref={containerRef}
      className={`relative w-full ${parentClassName}`}
      style={{ minHeight: '1.5em' }}
      {...hoverProps}
      {...props}
    >
      {/* Texto invisible para reservar el espacio */}
      <span 
        className="invisible whitespace-pre-wrap text-base md:text-lg text-center leading-relaxed font-medium"
        style={{ display: 'block', width: '100%' }}
        aria-hidden="true"
      >
        {text}
      </span>
      
      {/* Texto visible con animación */}
      <span 
        className="absolute top-0 left-0 w-full whitespace-pre-wrap text-base md:text-lg text-center leading-relaxed font-medium cursor-pointer"
        aria-hidden="true"
        onClick={() => setIsClicked(true)}
        style={{ cursor: isClicked ? 'default' : 'pointer' }}
      >
        {displayText.split('').map((char, index) => {
          const isRevealedOrDone = isClicked || revealedIndices.has(index) || !isScrambling || (!isHovering && animateOn === 'view');

          return (
            <span 
              key={index} 
              className={isRevealedOrDone ? className : encryptedClassName}
            >
              {char}
            </span>
          );
        })}
      </span>
      
      <span className="sr-only">{text}</span>
    </div>
  );
}

