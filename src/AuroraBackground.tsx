import React, { useEffect, useRef } from 'react';

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
}

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  mouseRadius = 150,
  rippleColor = 'rgba(255, 255, 255, 0.2)',
  className = '',
}) => {
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
      const layers = 5;

      for (let layer = 0; layer < layers; layer++) {
        ctx.beginPath();
        const waveHeight = 30 + layer * 10;
        const waveOffset = time * 0.5 + layer * 50;
        const alpha = 0.05 + layer * 0.05;
        const hue = (time * 10 + layer * 50) % 360;

        ctx.strokeStyle = `hsla(${hue}, 100%, 70%, ${alpha})`;
        ctx.lineWidth = 2 + layer * 1.5;

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
          ripple.radius += 3;
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
        ctx.lineWidth = 2;
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
        maxRadius: 120,
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
  }, [mouseRadius, rippleColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default AuroraBackground;