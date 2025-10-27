import React, { useState, useEffect } from 'react';

const TextType = ({
  text,
  typingSpeed = 100,
  pauseDuration = 1000,
  showCursor = true,
  cursorCharacter = '|',
}) => {
  const [currentText, setCurrentText] = useState('');
  const [textIndex, setTextIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentString = Array.isArray(text) ? text[textIndex] : text;

    const handleTyping = () => {
      if (isDeleting) {
        if (charIndex > 0) {
          setCurrentText(currentString.substring(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        } else {
          setIsDeleting(false);
          if (Array.isArray(text)) {
            setTextIndex((prev) => (prev + 1) % text.length);
          }
        }
      } else {
        if (charIndex < currentString.length) {
          setCurrentText(currentString.substring(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        } else {
          setTimeout(() => setIsDeleting(true), pauseDuration);
        }
      }
    };

    const typingTimeout = setTimeout(handleTyping, isDeleting ? typingSpeed / 2 : typingSpeed);

    return () => clearTimeout(typingTimeout);
  }, [charIndex, isDeleting, text, textIndex, typingSpeed, pauseDuration]);

  return (
    <span>
      {currentText}
      {showCursor && <span>{cursorCharacter}</span>}
    </span>
  );
};

export default TextType;
