import React, { useEffect, useRef, useState } from 'react';

interface BinaryMatrixBackgroundProps {
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  rippleColor?: string;
  density?: number;
  className?: string;
  flickerSpeed?: number;
  trailLength?: number;
  charSet?: string[];
  charChangeRate?: number;
}

const BinaryMatrixBackground: React.FC<BinaryMatrixBackgroundProps> = ({
  fontSize = 18,
  fontFamily = 'Space Grotesk',
  color = 'rgba(0, 255, 0, 0.8)',
  rippleColor = 'rgba(0, 255, 127, 0.5)',
  density = 0.05,
  className = '',
  flickerSpeed = 0.05,
  trailLength = 15,
  charSet = ['0', '1'],
  charChangeRate = 0.1
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const columnsRef = useRef<Array<{ x: number; yPositions: number[]; chars: string[]; speeds: number[] }>>([]);
  const rippleRef = useRef<Array<{ x: number; y: number; radius: number; opacity: number }>>([]);
  const mouseRef = useRef({ x: 0, y: 0, intensity: 0 });
  const flickerRef = useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { 
        x: e.clientX, 
        y: e.clientY,
        intensity: 1.0
      };
    };

    const handleClick = (e: MouseEvent) => {
      rippleRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 0,
        opacity: 0.8
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || dimensions.width === 0 || dimensions.height === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize columns
    const initColumns = () => {
      columnsRef.current = [];
      const columnCount = Math.floor(dimensions.width * density);
      const columnWidth = dimensions.width / columnCount;

      for (let i = 0; i < columnCount; i++) {
        const x = i * columnWidth + columnWidth / 2;
        const yPositions: number[] = [];
        const chars: string[] = [];
        const speeds: number[] = [];
        
        // Create initial characters in the column
        const charCount = Math.floor(dimensions.height / fontSize);
        for (let j = 0; j < charCount; j++) {
          yPositions.push(j * fontSize);
          chars.push(charSet[Math.floor(Math.random() * charSet.length)]);
          speeds.push(0.5 + Math.random() * 2);
        }
        
        columnsRef.current.push({ x, yPositions, chars, speeds });
      }
    };

    initColumns();

    const animate = () => {
      ctx.clearRect(0, 0, dimensions.width, dimensions.height);
      
      // Update flicker effect
      flickerRef.current = (flickerRef.current + flickerSpeed) % (Math.PI * 2);
      const flickerIntensity = 0.7 + Math.sin(flickerRef.current) * 0.3;
      
      // Update mouse intensity (fade over time)
      mouseRef.current.intensity *= 0.92;
      
      // Update ripple effects
      rippleRef.current = rippleRef.current.filter(ripple => {
        ripple.radius += 3;
        ripple.opacity -= 0.015;
        return ripple.opacity > 0;
      });

      // Draw ripples
      ctx.lineWidth = 2;
      rippleRef.current.forEach(ripple => {
        ctx.globalAlpha = ripple.opacity;
        ctx.strokeStyle = rippleColor;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.globalAlpha = ripple.opacity * 0.5;
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.radius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
      });
      ctx.globalAlpha = 1;

      // Draw binary characters
      ctx.font = `${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      
      columnsRef.current.forEach(column => {
        const { x, yPositions, chars, speeds } = column;
        let columnChanged = false;
        
        // Calculate distance to mouse for interaction
        const distToMouse = Math.sqrt(
          Math.pow(x - mouseRef.current.x, 2) + 
          Math.pow((yPositions[0] || 0) - mouseRef.current.y, 2)
        );
        
        // Determine if mouse is affecting this column
        const isAffected = distToMouse < 200 && mouseRef.current.intensity > 0.1;
        
        for (let i = 0; i < yPositions.length; i++) {
          // Move character down
          yPositions[i] += speeds[i];
          
          // Reset character if it goes off screen
          if (yPositions[i] > dimensions.height + fontSize) {
            yPositions[i] = -fontSize;
            chars[i] = charSet[Math.floor(Math.random() * charSet.length)];
            speeds[i] = 0.5 + Math.random() * 2;
            columnChanged = true;
          }
          
          // Randomly change characters (more likely when affected by mouse)
          if (Math.random() < (isAffected ? charChangeRate * 3 : charChangeRate)) {
            chars[i] = charSet[Math.floor(Math.random() * charSet.length)];
            columnChanged = true;
          }
          
          // Calculate opacity based on position in trail
          const trailIndex = Math.min(i, trailLength);
          const opacity = 1 - (trailIndex / trailLength);
          
          // Calculate brightness (first character is brightest)
          const brightness = i === 0 ? 1 : 0.3 + (0.7 * opacity);
          
          // Apply flicker effect
          const currentFlicker = i === 0 ? flickerIntensity : 1;
          
          // Apply mouse effect if close
          const mouseEffect = isAffected 
            ? (1 - Math.min(distToMouse / 200, 1)) * mouseRef.current.intensity 
            : 0;
          
          // Create color with varying opacity and brightness
          const [r, g, b] = color.match(/\d+/g)?.map(Number) || [0, 255, 0];
          const finalColor = `rgba(${r}, ${g}, ${b}, ${opacity * brightness * currentFlicker + mouseEffect})`;
          
          ctx.fillStyle = finalColor;
          ctx.fillText(chars[i], x, yPositions[i]);
          
          // Draw trail effect for first character
          if (i === 0 && opacity > 0.2) {
            ctx.strokeStyle = finalColor;
            ctx.beginPath();
            ctx.moveTo(x, yPositions[i] - fontSize * 0.8);
            ctx.lineTo(x, yPositions[i] - fontSize * 2.5);
            ctx.stroke();
          }
        }
        
        // Add new characters at the top occasionally
        if (columnChanged && Math.random() < 0.1) {
          yPositions.unshift(-fontSize);
          chars.unshift(charSet[Math.floor(Math.random() * charSet.length)]);
          speeds.unshift(0.5 + Math.random() * 2);
          
          // Remove extra characters
          if (yPositions.length > trailLength * 2) {
            yPositions.pop();
            chars.pop();
            speeds.pop();
          }
        }
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions, color, rippleColor, fontSize, fontFamily, density, flickerSpeed, trailLength, charSet, charChangeRate]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className={`fixed inset-0 ${className}`}
      style={{
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent'
      }}
    />
  );
};

export default BinaryMatrixBackground;