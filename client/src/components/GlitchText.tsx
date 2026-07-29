import { useState } from 'react';

interface GlitchTextProps {
  children: string;
  className?: string;
  triggerOnHover?: boolean;
}

/**
 * GlitchText Component
 * 
 * Renders text with a glitch effect that can be triggered on hover or continuously.
 * Perfect for the Elian Skye futuristic aesthetic.
 */
export default function GlitchText({ 
  children, 
  className = '', 
  triggerOnHover = true 
}: GlitchTextProps) {
  const [isGlitching, setIsGlitching] = useState(false);

  const handleMouseEnter = () => {
    if (triggerOnHover) {
      setIsGlitching(true);
      setTimeout(() => setIsGlitching(false), 300);
    }
  };

  return (
    <div
      className={`relative inline-block cursor-pointer ${className}`}
      onMouseEnter={handleMouseEnter}
    >
      {/* Original text */}
      <span className="relative z-10 block">{children}</span>

      {/* Glitch layers */}
      {isGlitching && (
        <>
          <span
            className="absolute top-0 left-0 z-20 text-cyan-500 opacity-80"
            style={{
              animation: 'glitch 0.3s infinite',
              textShadow: '2px 0 #ff00ff, -2px 0 #00ffff',
            }}
          >
            {children}
          </span>
          <span
            className="absolute top-0 left-0 z-20 text-magenta-500 opacity-60"
            style={{
              animation: 'glitch 0.3s infinite reverse',
              textShadow: '-2px 0 #ff00ff, 2px 0 #00ffff',
            }}
          >
            {children}
          </span>
        </>
      )}
    </div>
  );
}
