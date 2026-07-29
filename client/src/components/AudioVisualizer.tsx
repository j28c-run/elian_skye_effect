import { useEffect, useRef } from 'react';

interface AudioVisualizerProps {
  isActive?: boolean;
  barCount?: number;
}

/**
 * AudioVisualizer Component
 * 
 * Renders an animated audio visualizer with reactive bars that respond to
 * user interaction and simulate audio frequency data. Perfect for the Elian Skye
 * cinematic effect with dynamic, glitch-inspired animations.
 */
export default function AudioVisualizer({ isActive = true, barCount = 32 }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const barsRef = useRef<number[]>(Array(barCount).fill(0));
  const targetBarsRef = useRef<number[]>(Array(barCount).fill(0));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;
    canvas.width = width;
    canvas.height = height;

    // Simulate audio data with random peaks
    const generateAudioData = () => {
      return Array(barCount)
        .fill(0)
        .map(() => Math.random() * 0.7 + 0.3);
    };

    const animate = () => {
      // Update target bars with random audio data
      if (Math.random() > 0.95) {
        targetBarsRef.current = generateAudioData();
      }

      // Smoothly interpolate bars to target values
      barsRef.current = barsRef.current.map((bar, i) => {
        const target = targetBarsRef.current[i];
        return bar + (target - bar) * 0.15;
      });

      // Clear canvas with semi-transparent background for trail effect
      ctx.fillStyle = 'rgba(10, 14, 39, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Draw bars
      const barWidth = width / barCount;
      const centerY = height / 2;

      barsRef.current.forEach((bar, i) => {
        const x = i * barWidth;
        const barHeight = bar * height * 0.6;

        // Create gradient for each bar
        const gradient = ctx.createLinearGradient(x, centerY - barHeight, x, centerY + barHeight);
        gradient.addColorStop(0, 'rgba(0, 212, 255, 0)');
        gradient.addColorStop(0.5, 'rgba(0, 212, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');

        // Draw top bar
        ctx.fillStyle = gradient;
        ctx.fillRect(x + 1, centerY - barHeight, barWidth - 2, barHeight);

        // Draw bottom bar (mirrored)
        ctx.fillRect(x + 1, centerY, barWidth - 2, barHeight);

        // Add glow effect
        ctx.strokeStyle = `rgba(0, 212, 255, ${0.3 * bar})`;
        ctx.lineWidth = 2;
        ctx.strokeRect(x + 1, centerY - barHeight, barWidth - 2, barHeight);
        ctx.strokeRect(x + 1, centerY, barWidth - 2, barHeight);
      });

      // Draw center line
      ctx.strokeStyle = 'rgba(0, 212, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      animationRef.current = requestAnimationFrame(animate);
    };

    if (isActive) {
      animationRef.current = requestAnimationFrame(animate);
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isActive, barCount]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-32 bg-gradient-to-b from-transparent via-blue-900/10 to-transparent rounded-lg border border-cyan-500/20"
    />
  );
}
