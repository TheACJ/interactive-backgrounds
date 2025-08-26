import React, { useEffect, useRef } from 'react';

interface StarParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  pulse?: number;
  trail?: { x: number; y: number }[];
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
}

interface ConstellationName {
  x: number;
  y: number;
  name: string;
  opacity: number;
}

interface MousePosition {
  x: number;
  y: number;
}

interface ConstellationFieldProps {
  particleColor?: string;
  connectionColor?: string;
  particleCount?: number;
  maxDistance?: number;
  className?: string;
  constfill?: string;
}

const NAMES = ['TheACJ', 'Agbai', 'Chisom', 'Joshua', 'ACJ', 'TheACJ Labs'];

const ConstellationFieldBackground: React.FC<ConstellationFieldProps> = ({
  particleColor = 'rgba(255, 255, 255, 0.7)',
  connectionColor = 'rgba(255, 255, 255, 0.2)',
  particleCount = 120,
  maxDistance = 120,
  className = '',
  constfill = 'white',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<StarParticle[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const constellationNamesRef = useRef<ConstellationName[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });
  const draggingRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      createParticles();
    };

    const createParticles = () => {
      const width = canvas.width;
      const height = canvas.height;
      particlesRef.current = [];

      for (let i = 0; i < particleCount; i++) {
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.6,
          vy: (Math.random() - 0.5) * 0.6,
          radius: Math.random() * 1.2 + 0.5,
          pulse: Math.random() * 1.5 + 0.5,
          trail: [],
        });
      }
    };

    const updateParticles = () => {
      const width = canvas.width;
      const height = canvas.height;

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;

        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 80) {
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * 0.1;
          p.vy += Math.sin(angle) * 0.1;
        }

        if (draggingRef.current) {
          p.trail?.push({ x: p.x, y: p.y });
          if (p.trail.length > 20) p.trail.shift();
        } else {
          p.trail = [];
        }
      });
    };

    const updateShootingStars = () => {
      if (Math.random() < 0.01) {
        shootingStarsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.5,
          vx: -Math.random() * 4 - 2,
          vy: Math.random() * 2,
          length: Math.random() * 60 + 40,
          life: 1,
        });
      }
      shootingStarsRef.current = shootingStarsRef.current.filter((s) => s.life > 0);
      shootingStarsRef.current.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.life -= 0.01;
      });
    };

    const updateConstellationNames = () => {
      if (Math.random() < 0.002) {
        constellationNamesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height * 0.8 + 50,
          name: NAMES[Math.floor(Math.random() * NAMES.length)],
          opacity: 1,
        });
      }
      constellationNamesRef.current = constellationNamesRef.current.filter((n) => n.opacity > 0);
      constellationNamesRef.current.forEach((n) => {
        n.opacity -= 0.003;
      });
    };

    const drawParticles = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p) => {
        const pulseRadius = p.radius + Math.sin(time + p.pulse!) * 0.5;

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor;
        ctx.fill();

        if (p.trail && p.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(p.trail[0].x, p.trail[0].y);
          for (let i = 1; i < p.trail.length; i++) {
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
          }
          ctx.strokeStyle = particleColor.replace(/\d?\.\d+(?=\))/, '0.1');
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    };

    const drawConnections = () => {
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            const opacity = (maxDistance - distance) / maxDistance;
            ctx.strokeStyle = connectionColor.replace(/\d?\.\d+(?=\))/, opacity.toFixed(2));
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };

    const drawShootingStars = () => {
      shootingStarsRef.current.forEach((s) => {
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x + s.length, s.y + s.length * 0.2);
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    const drawConstellationNames = () => {
      ctx.font = '19px Space Grotesk';
      ctx.textAlign = 'center';
      ctx.fillStyle = constfill;
      constellationNamesRef.current.forEach((n) => {
        ctx.globalAlpha = n.opacity;
        ctx.fillText(n.name, n.x, n.y);
      });
      ctx.globalAlpha = 1;
    };

    const animate = () => {
      const time = Date.now() * 0.002;
      updateParticles();
      updateShootingStars();
      updateConstellationNames();
      drawParticles(time);
      drawConnections();
      drawShootingStars();
      drawConstellationNames();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleMouseDown = () => {
      draggingRef.current = true;
    };

    const handleMouseUp = () => {
      draggingRef.current = false;
    };

    resize();
    animate();

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [particleColor, connectionColor, particleCount, maxDistance]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default ConstellationFieldBackground;