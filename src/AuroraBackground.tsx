import React, { useEffect, useRef } from 'react';
import { useColorMode } from './useColorMode';

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  growing: boolean;
}

interface MousePosition {
  x: number;
  y: number;
}

interface AuroraBackgroundProps {
  mouseRadius?: number;
  rippleColor?: string;
  className?: string;
  // Wave controls
  layers?: number; // default 5
  baseWaveHeight?: number; // default 30
  waveSpacing?: number; // default 10
  waveSpeed?: number; // default 0.5
  lineWidthBase?: number; // default 2
  // Ripple controls
  rippleMaxRadius?: number; // default 120
  rippleGrowthRate?: number; // default 3 (px per frame)
  rippleLineWidth?: number; // default 2
}

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  mouseRadius = 150,
  rippleColor: propRippleColor,
  className = '',
  layers = 5,
  baseWaveHeight = 30,
  waveSpacing = 10,
  waveSpeed = 0.5,
  lineWidthBase = 2,
  rippleMaxRadius = 120,
  rippleGrowthRate = 3,
  rippleLineWidth = 2
}) => {
  const mode = useColorMode();
  const rippleColor = propRippleColor || (mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.08)');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const drawAuroraWave = (time: number) => {
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      for (let layer = 0; layer < layers; layer++) {
        ctx.beginPath();
        const waveHeight = baseWaveHeight + layer * waveSpacing;
        const waveOffset = time * waveSpeed + layer * 50;
        const alpha = 0.05 + layer * 0.05;
        const hue = (time * 10 + layer * 50) % 360;

        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
        ctx.lineWidth = lineWidthBase + layer * 1.5;

        for (let x = 0; x <= width; x += 10) {
          const y =
            height / 2 +
            Math.sin(x * 0.01 + waveOffset) * waveHeight +
            (Math.sin(x * 0.02 + waveOffset * 1.3) * waveHeight) / 2;

          const dx = mouseRef.current.x - x;
          const dy = mouseRef.current.y - y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const distort = dist < mouseRadius ? (mouseRadius - dist) / mouseRadius * 20 : 0;

          ctx.lineTo(x, y - distort);
        }

        ctx.stroke();
      }
    };

    const drawRipples = () => {
      ripplesRef.current = ripplesRef.current.filter((ripple) => {
        if (ripple.growing) {
          ripple.radius += rippleGrowthRate;
          ripple.opacity = 1 - ripple.radius / ripple.maxRadius;
          if (ripple.radius >= ripple.maxRadius) ripple.growing = false;
          return true;
        }
        return false;
      });

      ripplesRef.current.forEach((ripple) => {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rippleColor.replace(/[\d.]+(?=\))/, (ripple.opacity * 0.8).toString());
        ctx.lineWidth = rippleLineWidth;
        ctx.stroke();
      });
    };

    const animate = () => {
      const time = Date.now() * 0.001;
      drawAuroraWave(time);
      drawRipples();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: rippleMaxRadius,
        opacity: 1,
        growing: true,
      });
    };

    // Initialize
    resize();
    animate();

    // Listeners
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    // Cleanup
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [mouseRadius, rippleColor, layers, baseWaveHeight, waveSpacing, waveSpeed, lineWidthBase, rippleMaxRadius, rippleGrowthRate, rippleLineWidth]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default AuroraBackground;