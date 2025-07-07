import React, { useEffect, useRef } from 'react';

interface ClusterParticle {
  angle: number;
  distance: number;
  speed: number;
  size: number;
  opacity: number;
  depth: number;
}

interface Cluster {
  x: number;
  y: number;
  particles: ClusterParticle[];
}

interface GravityWarp {
  x: number;
  y: number;
  strength: number;
  active: boolean;
}

interface OrbitClusterBackgroundProps {
  clusterCount?: number;
  particlesPerCluster?: number;
  color?: string;
  className?: string;
}

const OrbitClusterBackground: React.FC<OrbitClusterBackgroundProps> = ({
  clusterCount = 6,
  particlesPerCluster = 25,
  color = 'rgba(255, 255, 255, 0.9)',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const clustersRef = useRef<Cluster[]>([]);
  const gravityWarpRef = useRef<GravityWarp | null>(null);
  const mouseRef = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    
    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      generateClusters();
    };

    const generateClusters = () => {
      const width = canvas.width;
      const height = canvas.height;
      clustersRef.current = [];

      for (let i = 0; i < clusterCount; i++) {
        const cluster: Cluster = {
          x: Math.random() * width,
          y: Math.random() * height,
          particles: [],
        };

        for (let j = 0; j < particlesPerCluster; j++) {
          cluster.particles.push({
            angle: Math.random() * Math.PI * 2,
            distance: 20 + Math.random() * 60,
            speed: 0.002 + Math.random() * 0.004,
            size: 1 + Math.random() * 2,
            opacity: 0.4 + Math.random() * 0.6,
            depth: 0.5 + Math.random() * 0.5,
          });
        }

        clustersRef.current.push(cluster);
      }
    };

    const animate = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      clustersRef.current.forEach(cluster => {
        cluster.particles.forEach(p => {
          p.angle += p.speed;

          // Gravity warp effect
          let dX = Math.cos(p.angle) * p.distance;
          let dY = Math.sin(p.angle) * p.distance;

          if (gravityWarpRef.current?.active) {
            const dx = gravityWarpRef.current.x - cluster.x;
            const dy = gravityWarpRef.current.y - cluster.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const gravity = Math.min(gravityWarpRef.current.strength / (dist + 20), 5);
            dX += dx * gravity * 0.02;
            dY += dy * gravity * 0.02;
          }

          // Parallax with mouse
          const offsetX = (mouseRef.current.x - width / 2) * 0.001 * p.depth;
          const offsetY = (mouseRef.current.y - height / 2) * 0.001 * p.depth;

          const x = cluster.x + dX + offsetX * 100;
          const y = cluster.y + dY + offsetY * 100;

          ctx.beginPath();
          ctx.arc(x, y, p.size, 0, Math.PI * 2);
          ctx.fillStyle = color.replace(/[\d.]+(?=\))/, p.opacity.toFixed(2));
          ctx.fill();
        });
      });

      // Update gravity warp
      if (gravityWarpRef.current?.active) {
        gravityWarpRef.current.strength *= 0.9;
        if (gravityWarpRef.current.strength < 0.05) {
          gravityWarpRef.current.active = false;
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };

    const handleClick = (e: MouseEvent) => {
      gravityWarpRef.current = {
        x: e.clientX,
        y: e.clientY,
        strength: 20,
        active: true,
      };
    };

    // Init
    resize();
    animate();

    // Listeners
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [clusterCount, particlesPerCluster, color]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default OrbitClusterBackground;