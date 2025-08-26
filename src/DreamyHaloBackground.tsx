import React, { useEffect, useRef } from 'react';

interface DreamyHaloBackgroundProps {
  baseHue?: number;
  className?: string;
  blurOverlay?: boolean;
  overlayOpacity?: number;
}

const DreamyHaloBackground: React.FC<DreamyHaloBackgroundProps> = ({
  baseHue = 280,
  className = '',
  blurOverlay = true,
  overlayOpacity = 0.3,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const generateHalos = () => {
      const halos = [];
      for (let i = 0; i < 20; i++) {
        halos.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          r: Math.random() * 100 + 50,
          phase: Math.random() * Math.PI * 2,
        });
      }
      return halos;
    };

    const halos = generateHalos();

    const animate = () => {
      const time = Date.now() * 0.001;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      halos.forEach((halo, index) => {
        const pulse = Math.sin(time + halo.phase) * 20;
        const gradient = ctx.createRadialGradient(
          halo.x,
          halo.y,
          0,
          halo.x,
          halo.y,
          halo.r + pulse
        );

        const hueShift = (baseHue + index * 10 + time * 10) % 360;

        gradient.addColorStop(0, `hsla(${hueShift}, 100%, 85%, 0.25)`);
        gradient.addColorStop(1, `hsla(${hueShift}, 100%, 85%, 0)`);

        ctx.beginPath();
        ctx.fillStyle = gradient;
        ctx.arc(halo.x, halo.y, halo.r + pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [baseHue]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
        style={{ zIndex: 0 }}
      />
      {blurOverlay && (
        <div
          className="fixed top-0 left-0 w-full h-full backdrop-blur-md pointer-events-none"
          style={{ zIndex: 1, backgroundColor: `rgba(255,255,255,${overlayOpacity})` }}
        />
      )}
    </>
  );
};

export default DreamyHaloBackground;
