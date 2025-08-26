import React, { useEffect, useRef } from 'react';

interface FluidParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface MousePosition {
  x: number;
  y: number;
}

interface FluidSmokeFlowProps {
  particleColor?: string;
  lineWidth?: number;
  className?: string;
}

const FluidSmokeFlowBackground: React.FC<FluidSmokeFlowProps> = ({
  particleColor = 'rgba(255, 255, 255, 0.15)',
  lineWidth = 1,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<FluidParticle[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    const createParticles = (): void => {
      const count = 300;
      const width = canvas.width;
      const height = canvas.height;
      particlesRef.current = [];

      for (let i = 0; i < count; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
        });
      }
    };

    const drawParticles = (): void => {
      const { width, height } = canvas;

      // Fading trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = lineWidth;
      ctx.strokeStyle = particleColor;

      particlesRef.current.forEach((p) => {
        const dx = mouseRef.current.x - p.x;
        const dy = mouseRef.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          const force = (100 - dist) / 100;
          const angle = Math.atan2(dy, dx);
          p.vx -= Math.cos(angle) * force * 0.3;
          p.vy -= Math.sin(angle) * force * 0.3;
        }

        // Friction
        p.vx *= 0.96;
        p.vy *= 0.96;

        const prevX = p.x;
        const prevY = p.y;

        p.x += p.vx;
        p.y += p.vy;

        // Wrap around edges
        if (p.x < 0) p.x = width;
        if (p.y < 0) p.y = height;
        if (p.x > width) p.x = 0;
        if (p.y > height) p.y = 0;

        // Draw trail
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      });
    };

    const animate = (): void => {
      drawParticles();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent): void => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    // Initialize
    resize();
    animate();

    // Event listeners
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);

    // Cleanup
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [particleColor, lineWidth]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default FluidSmokeFlowBackground;