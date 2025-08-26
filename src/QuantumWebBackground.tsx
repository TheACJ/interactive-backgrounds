import React, { useEffect, useRef } from 'react';
import { useColorMode } from './useColorMode'

const QuantumWebBackground = () => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  const particlesRef = useRef([]);
  const connectionsRef = useRef([]);
  const mouseRef = useRef({ x: null, y: null, radius: 150, attractionMode: false });

  const quantumColor = mode === 'dark' ? '#7f5af0' : '#3f2d78'; // Darkened purple
  const normalColor = mode === 'dark' ? '#2cb67d' : '#165b3e'; // Darkened green
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set canvas dimensions
    const setCanvasSize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    
    setCanvasSize();
    
    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize particles
    const initParticles = () => {
      particlesRef.current = [];
      const particleCount = Math.floor(width * height / 5000);
      
      for (let i = 0; i < particleCount; i++) {
        const isQuantum = Math.random() > 0.85;
        particlesRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: isQuantum ? Math.random() * 2 + 1 : Math.random() * 1.5 + 0.5,
          opacity: Math.random() * 0.4 + 0.2,
          // baseColor: isQuantum ? '#7f5af0' : '#2cb67d',
          baseColor: isQuantum ? quantumColor : normalColor
          trail: [],
          maxTrail: Math.floor(Math.random() * 10) + 5,
          isQuantum,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.05 + 0.01,
          lastX: 0,
          lastY: 0
        });
      }
    };
    
    // Mouse interaction
    const handleMouseMove = (e) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
    };
    
    const handleMouseLeave = () => {
      mouseRef.current.x = null;
      mouseRef.current.y = null;
    };
    
    const handleKeyDown = (e) => {
      if (e.key === 'Shift') mouseRef.current.attractionMode = true;
    };
    
    const handleKeyUp = (e) => {
      if (e.key === 'Shift') mouseRef.current.attractionMode = false;
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Update particle positions and physics
    const updateParticles = () => {
      const mouse = mouseRef.current;
      
      particlesRef.current.forEach(particle => {
        // Store current position for trail calculation
        particle.lastX = particle.x;
        particle.lastY = particle.y;
        
        // Add current position to trail
        particle.trail.push({ x: particle.x, y: particle.y });
        if (particle.trail.length > particle.maxTrail) {
          particle.trail.shift();
        }
        
        // Random movement with noise
        particle.phase += particle.speed;
        particle.vx += Math.sin(particle.phase) * 0.01;
        particle.vy += Math.cos(particle.phase) * 0.01;
        
        // Velocity damping
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        
        // Mouse interaction
        if (mouse.x !== null && mouse.y !== null) {
          const dx = particle.x - mouse.x;
          const dy = particle.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            const force = (mouse.radius - distance) / mouse.radius;
            const angle = Math.atan2(dy, dx);
            const tx = mouse.x + Math.cos(angle) * mouse.radius;
            const ty = mouse.y + Math.sin(angle) * mouse.radius;
            
            if (mouse.attractionMode) {
              // Attract particles to mouse
              particle.vx += (mouse.x - particle.x) * force * 0.01;
              particle.vy += (mouse.y - particle.y) * force * 0.01;
            } else {
              // Repel particles from mouse
              particle.vx += (particle.x - tx) * force * 0.05;
              particle.vy += (particle.y - ty) * force * 0.05;
            }
          }
        }
        
        // Boundary checks with tunneling effect
        if (particle.x < -particle.radius) particle.x = width + particle.radius;
        if (particle.x > width + particle.radius) particle.x = -particle.radius;
        if (particle.y < -particle.radius) particle.y = height + particle.radius;
        if (particle.y > height + particle.radius) particle.y = -particle.radius;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
      });
    };
    
    // Create and update connections
    const updateConnections = () => {
      connectionsRef.current = [];
      const particles = particlesRef.current;
      const time = Date.now() * 0.001;
      
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Create connection if particles are close enough
          if (distance < 150) {
            const opacity = 0.7 * (1 - distance / 150);
            const pulse = Math.sin(time * 3) * 0.3 + 0.7;
            connectionsRef.current.push({
              particles: [particles[i], particles[j]],
              distance,
              opacity: opacity * pulse,
              strength: Math.random() * 0.05 + 0.01
            });
          }
        }
      }
    };
    
    // Draw everything
    const render = () => {
      // Clear canvas with transparent background
      ctx.clearRect(0, 0, width, height);
      
      // Draw particle trails
      particlesRef.current.forEach(particle => {
        if (particle.trail.length > 1) {
          const velocity = Math.sqrt(
            Math.pow(particle.x - particle.lastX, 2) + 
            Math.pow(particle.y - particle.lastY, 2)
          );
          const trailIntensity = Math.min(velocity * 20, 1);
          
          if (trailIntensity > 0.1) {
            ctx.beginPath();
            ctx.moveTo(particle.trail[0].x, particle.trail[0].y);
            
            for (let i = 1; i < particle.trail.length; i++) {
              ctx.lineTo(particle.trail[i].x, particle.trail[i].y);
            }
            
            const gradient = ctx.createLinearGradient(
              particle.trail[0].x, particle.trail[0].y,
              particle.x, particle.y
            );
            
            gradient.addColorStop(0, `${particle.baseColor}00`);
            gradient.addColorStop(1, `${particle.baseColor}${Math.floor(trailIntensity * 80).toString(16).padStart(2, '0')}`);
            
            ctx.strokeStyle = gradient;
            ctx.lineWidth = particle.isQuantum ? 1.5 : 1;
            ctx.stroke();
          }
        }
      });
      
      // Draw connections with entanglement effect
      connectionsRef.current.forEach(connection => {
        const [p1, p2] = connection.particles;
        
        // Create gradient for connection
        const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
        // gradient.addColorStop(0, p1.isQuantum ? '#7f5af0' : '#2cb67d');
        // gradient.addColorStop(1, p2.isQuantum ? '#7f5af0' : '#2cb67d');
        
        gradient.addColorStop(0, p1.isQuantum ? quantumColor : normalColor); // Use mode-based
        gradient.addColorStop(1, p2.isQuantum ? quantumColor : normalColor); // Use mode-based
        
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        
        ctx.strokeStyle = gradient;
        ctx.globalAlpha = connection.opacity;
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.globalAlpha = 1;
      });
      
      // Draw particles
      particlesRef.current.forEach(particle => {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = particle.baseColor;
        ctx.fill();
        
        // Glow effect for quantum particles
        if (particle.isQuantum) {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.radius * 3, 0, Math.PI * 2);
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.radius * 3
          );
          gradient.addColorStop(0, `${particle.baseColor}80`);
          gradient.addColorStop(1, `${particle.baseColor}00`);
          ctx.fillStyle = gradient;
          ctx.fill();
        }
      });
    };
    
    // Animation loop
    const animate = () => {
      updateParticles();
      updateConnections();
      render();
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Initialize and start animation
    initParticles();
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      cancelAnimationFrame(animationRef.current);
    };
  }, [mode]);
  
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
      <div className="absolute bottom-4 left-4 p-3 bg-gray-900 bg-opacity-50 rounded-lg text-xs text-white pointer-events-auto">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#2cb67d]"></div>
          <span>Quantum Particles</span>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-3 h-3 rounded-full bg-[#7f5af0]"></div>
          <span>Entangled Particles</span>
        </div>
        <div className="mt-2">
          {mouseRef.current.attractionMode ? (
            <span className="text-[#2cb67d]">Attraction Mode (Shift)</span>
          ) : (
            <span>Repulsion Mode (Hold Shift for attraction)</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuantumWebBackground;