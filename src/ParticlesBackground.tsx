import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  opacity: number;
  randomSpeed: number;
  randomDirection: number;
  randomOffset: number;
  baseX: number;
  baseY: number;
  shooting?: boolean;
}

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

interface ParticlesBackgroundProps {
  particleCount?: number;
  mouseRadius?: number;
  particleColor?: string;
  connectionColor?: string;
  rippleColor?: string;
  className?: string;
}

const ParticlesBackground: React.FC<ParticlesBackgroundProps> = ({
  particleCount = null,
  mouseRadius = 150,
  particleColor = 'rgba(255, 255, 255, 0.8)',
  connectionColor = 'rgba(255, 255, 255, 0.1)',
  rippleColor = 'rgba(255, 255, 255, 0.8)',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const backgroundRef = useRef<Particle[]>([]);
  const ripplesRef = useRef<Ripple[]>([]);
  const mouseRef = useRef<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const createParticles = (): void => {
      const count = particleCount || Math.floor((canvas.width * canvas.height) / 8000);
      particlesRef.current = [];
      backgroundRef.current = [];

      for (let i = 0; i < count; i++) {
        const isShooter = Math.random() < 0.05;
        const radius = isShooter ? 0.5 : Math.random() * 2 + 1;
        const vx = (Math.random() - 0.5) * (isShooter ? 2 : 0.5);
        const vy = (Math.random() - 0.5) * (isShooter ? 2 : 0.5);
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx,
          vy,
          radius,
          opacity: Math.random() * 0.5 + 0.3,
          randomSpeed: Math.random() * 0.5 + 0.2,
          randomDirection: Math.random() * Math.PI * 2,
          randomOffset: Math.random() * 1000,
          baseX: 0,
          baseY: 0,
          shooting: isShooter,
        });
      }

      // Parallax background layer
      for (let i = 0; i < count * 0.3; i++) {
        backgroundRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          radius: Math.random() * 1.2,
          opacity: Math.random() * 0.3,
          randomSpeed: 0,
          randomDirection: 0,
          randomOffset: 0,
          baseX: 0,
          baseY: 0,
        });
      }
    };

    const updateParticles = (): void => {
      const time = Date.now() * 0.001;
      particlesRef.current.forEach((particle: Particle) => {
        if (particle.baseX === 0 && particle.baseY === 0) {
          particle.baseX = particle.x;
          particle.baseY = particle.y;
        }

        const randomX = Math.sin(time * particle.randomSpeed + particle.randomOffset) * 20;
        const randomY = Math.cos(time * particle.randomSpeed * 0.8 + particle.randomOffset) * 15;
        const driftX = Math.cos(particle.randomDirection + time * 0.1) * 0.3;
        const driftY = Math.sin(particle.randomDirection + time * 0.1) * 0.3;

        particle.vx += driftX * 0.01 + randomX * 0.001;
        particle.vy += driftY * 0.01 + randomY * 0.001;

        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < mouseRadius) {
          const force = (mouseRadius - distance) / mouseRadius;
          particle.vx += dx * force * 0.008;
          particle.vy += dy * force * 0.008;
        }

        ripplesRef.current.forEach((ripple: Ripple) => {
          const rippleDx = particle.x - ripple.x;
          const rippleDy = particle.y - ripple.y;
          const rippleDistance = Math.sqrt(rippleDx * rippleDx + rippleDy * rippleDy);
          if (rippleDistance < ripple.radius + 20 && rippleDistance > ripple.radius - 20) {
            const rippleForce = ripple.opacity * 0.8;
            particle.vx += (rippleDx / rippleDistance) * rippleForce;
            particle.vy += (rippleDy / rippleDistance) * rippleForce;
          }
        });

        particle.x += particle.vx;
        particle.y += particle.vy;

        particle.vx *= 0.985;
        particle.vy *= 0.985;

        if (particle.x < 0 || particle.x > canvas.width) {
          particle.vx *= -0.3;
          particle.x = Math.max(0, Math.min(canvas.width, particle.x));
        }
        if (particle.y < 0 || particle.y > canvas.height) {
          particle.vy *= -0.3;
          particle.y = Math.max(0, Math.min(canvas.height, particle.y));
        }

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const centerDistance = Math.sqrt((particle.x - centerX) ** 2 + (particle.y - centerY) ** 2);
        const maxDistance = Math.min(canvas.width, canvas.height) * 0.4;

        if (centerDistance > maxDistance) {
          const returnForce = ((centerDistance - maxDistance) / centerDistance) * 0.001;
          particle.vx += (centerX - particle.x) * returnForce;
          particle.vy += (centerY - particle.y) * returnForce;
        }

        particle.opacity += Math.sin(time * 2 + particle.randomOffset) * 0.002;
        particle.opacity = Math.max(0.1, Math.min(0.8, particle.opacity));
      });
    };

    const updateRipples = (): void => {
      ripplesRef.current = ripplesRef.current.filter((ripple: Ripple) => {
        if (ripple.growing) {
          ripple.radius += 3;
          ripple.opacity = 1 - ripple.radius / ripple.maxRadius;
          if (ripple.radius >= ripple.maxRadius) ripple.growing = false;
          return true;
        }
        return false;
      });
    };

    const drawParticles = (): void => {
      backgroundRef.current.forEach((particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor.includes('rgba')
          ? particleColor.replace(/[\d.]+(?=\))/, (particle.opacity * 0.5).toString())
          : `rgba(255, 255, 255, ${particle.opacity * 0.5})`;
        ctx.fill();
      });

      particlesRef.current.forEach((particle: Particle) => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particleColor.includes('rgba')
          ? particleColor.replace(/[\d.]+(?=\))/, particle.opacity.toString())
          : `rgba(255, 255, 255, ${particle.opacity})`;
        ctx.fill();

        if (particle.shooting) {
          ctx.beginPath();
          ctx.moveTo(particle.x - particle.vx * 8, particle.y - particle.vy * 8);
          ctx.lineTo(particle.x, particle.y);
          ctx.strokeStyle = ctx.fillStyle;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
    };

    const drawConnections = (): void => {
      ctx.lineWidth = 1;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const dx = particlesRef.current[i].x - particlesRef.current[j].x;
          const dy = particlesRef.current[i].y - particlesRef.current[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < 120) {
            const opacity = (120 - distance) / 120 * 0.3;
            ctx.strokeStyle = connectionColor.includes('rgba')
              ? connectionColor.replace(/[\d.]+(?=\))/, opacity.toString())
              : `rgba(255, 255, 255, ${opacity})`;
            ctx.beginPath();
            ctx.moveTo(particlesRef.current[i].x, particlesRef.current[i].y);
            ctx.lineTo(particlesRef.current[j].x, particlesRef.current[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const drawRipples = (): void => {
      ripplesRef.current.forEach((ripple: Ripple) => {
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.strokeStyle = rippleColor.includes('rgba')
          ? rippleColor.replace(/[\d.]+(?=\))/, (ripple.opacity * 0.8).toString())
          : `rgba(255, 255, 255, ${ripple.opacity * 0.8})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      });
    };

    const animate = (): void => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      updateParticles();
      updateRipples();
      drawConnections();
      drawParticles();
      drawRipples();
      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent): void => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleClick = (e: MouseEvent): void => {
      ripplesRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        maxRadius: 150,
        opacity: 1,
        growing: true,
      });
    };

    const handleResize = (): void => {
      resize();
      createParticles();
    };

    resize();
    createParticles();
    animate();

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [particleCount, mouseRadius, particleColor, connectionColor, rippleColor]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default ParticlesBackground;
