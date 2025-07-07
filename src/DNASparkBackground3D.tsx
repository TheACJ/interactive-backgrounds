import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

interface DNASparkBackground3DProps {
  sparkColor?: string;
  strandColor?: string;
  className?: string;
  particleColor?: string;
  connectionColor?: string;
  rippleColor?: string;
  color?: string;
  constfill?: string;
  text?: string;
}

interface Particle {
  mesh: THREE.Mesh;
  velocity: THREE.Vector3;
  originalPosition: THREE.Vector3;
  angle: number;
  speed: number;
}

interface BasePair {
  base1: string;
  base2: string;
  mesh1: THREE.Mesh;
  mesh2: THREE.Mesh;
  connections: THREE.Mesh[];
  originalGlow: number;
  glowIntensity: number;
}

const DNASparkBackground3D: React.FC<DNASparkBackground3DProps> = ({
  sparkColor = 'rgba(255, 255, 255, 0.8)',
  strandColor = 'rgba(64, 224, 208, 0.6)',
  className = '',
  particleColor = 'rgba(255, 255, 255, 0.8)',
  connectionColor = 'rgba(255, 255, 255, 0.1)',
  rippleColor = 'rgba(255, 255, 255, 0.8)',
  color = 'rgba(255, 255, 255, 0.8)',
  constfill = 'white',
  text = 'THE ACJ'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const animationRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const basePairsRef = useRef<BasePair[]>([]);
  const backboneRef = useRef<{ mesh1: THREE.Mesh; mesh2: THREE.Mesh }>();
  const mouseRef = useRef(new THREE.Vector2());
  const raycasterRef = useRef(new THREE.Raycaster());
  const clickRipples = useRef<Array<{ mesh: THREE.Mesh; scale: number; opacity: number }>>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Base color mapping
  const baseColors = {
    A: 0x4169E1, // Royal Blue
    T: 0xFFD700, // Gold
    G: 0x1E90FF, // Dodger Blue
    C: 0xFFA500  // Orange
  };

  // Complementary base pairs
  const getComplementaryBase = (base: string): string => {
    const pairs: { [key: string]: string } = { A: 'T', T: 'A', G: 'C', C: 'G' };
    return pairs[base] || 'A';
  };

  // Generate random DNA sequence
  const generateDNASequence = (length: number): string => {
    const bases = ['A', 'T', 'G', 'C'];
    return Array.from({ length }, () => bases[Math.floor(Math.random() * bases.length)]).join('');
  };

  // Convert rgba string to THREE.Color
  const rgbaToThreeColor = (rgba: string): THREE.Color => {
    const match = rgba.match(/rgba?\(([^)]+)\)/);
    if (match) {
      const values = match[1].split(',').map(v => parseFloat(v.trim()));
      return new THREE.Color(values[0] / 255, values[1] / 255, values[2] / 255);
    }
    return new THREE.Color(0xffffff);
  };

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
    const handleMouseMove = (event: MouseEvent) => {
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const handleClick = (event: MouseEvent) => {
      if (!sceneRef.current || !cameraRef.current) return;
      
      mouseRef.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(event.clientY / window.innerHeight) * 2 + 1;
      
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      
      // Create ripple effect at click position
      const rippleGeometry = new THREE.RingGeometry(0.5, 1, 32);
      const rippleMaterial = new THREE.MeshBasicMaterial({
        color: rgbaToThreeColor(rippleColor),
        transparent: true,
        opacity: 0.8,
        side: THREE.DoubleSide
      });
      
      const rippleMesh = new THREE.Mesh(rippleGeometry, rippleMaterial);
      const intersects = raycasterRef.current.intersectObjects(sceneRef.current.children, true);
      
      if (intersects.length > 0) {
        rippleMesh.position.copy(intersects[0].point);
        rippleMesh.lookAt(cameraRef.current.position);
      } else {
        rippleMesh.position.set(0, 0, 0);
      }
      
      sceneRef.current.add(rippleMesh);
      clickRipples.current.push({ mesh: rippleMesh, scale: 1, opacity: 0.8 });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [rippleColor]);

  useEffect(() => {
    if (!mountRef.current || dimensions.width === 0 || dimensions.height === 0) return;

    // Initialize Three.js scene
    const scene = new THREE.Scene();
    scene.background = null; // Transparent background
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(75, dimensions.width / dimensions.height, 0.1, 1000);
    camera.position.set(0, 0, 200);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      premultipliedAlpha: false 
    });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    mountRef.current.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(100, 100, 50);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x00ffff, 0.5, 300);
    pointLight.position.set(0, 0, 100);
    scene.add(pointLight);

    // Initialize 3D DNA structure
    initDNA3D(scene);

    // Initialize 3D particles
    initParticles3D(scene);

    // Animation loop
    let time = 0;
    let waveOffset = 0;

    const animate = () => {
      time += 0.02;
      waveOffset += 0.05;

      // Update camera orbit
      if (cameraRef.current) {
        cameraRef.current.position.x = Math.cos(time * 0.1) * 200;
        cameraRef.current.position.z = Math.sin(time * 0.1) * 200;
        cameraRef.current.lookAt(0, 0, 0);
      }

      // Update DNA animation
      updateDNA3D(time, waveOffset);

      // Update particles
      updateParticles3D();

      // Update click ripples
      updateClickRipples3D();

      // Update glow effects based on mouse
      updateGlowEffects();

      renderer.render(scene, camera);
      animationRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [dimensions, sparkColor, strandColor, particleColor, connectionColor, rippleColor]);

  const initDNA3D = (scene: THREE.Scene) => {
    const sequence = generateDNASequence(40);
    const helixRadius = 25;
    const helixHeight = 400;
    const basePairSpacing = 10;

    // Create DNA backbone
    const backboneGeometry = new THREE.TubeGeometry(
      new THREE.CatmullRomCurve3(
        Array.from({ length: 100 }, (_, i) => {
          const t = (i / 99) * Math.PI * 8;
          const y = (i / 99) * helixHeight - helixHeight / 2;
          return new THREE.Vector3(
            Math.cos(t) * helixRadius,
            y,
            Math.sin(t) * helixRadius
          );
        })
      ),
      100,
      2,
      8,
      false
    );

    const backboneMaterial1 = new THREE.MeshPhongMaterial({
      color: 0x808080,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });

    const backboneMaterial2 = new THREE.MeshPhongMaterial({
      color: 0xa9a9a9,
      transparent: true,
      opacity: 0.7,
      shininess: 100
    });

    const backboneMesh1 = new THREE.Mesh(backboneGeometry, backboneMaterial1);
    const backboneMesh2 = new THREE.Mesh(backboneGeometry, backboneMaterial2);
    backboneMesh2.rotation.y = Math.PI;

    scene.add(backboneMesh1);
    scene.add(backboneMesh2);
    backboneRef.current = { mesh1: backboneMesh1, mesh2: backboneMesh2 };

    // Create base pairs
    basePairsRef.current = [];
    for (let i = 0; i < sequence.length; i++) {
      const base1 = sequence[i];
      const base2 = getComplementaryBase(base1);
      
      const y = (i / (sequence.length - 1)) * helixHeight - helixHeight / 2;
      const angle = (i / sequence.length) * Math.PI * 8;
      
      const pos1 = new THREE.Vector3(
        Math.cos(angle) * helixRadius,
        y,
        Math.sin(angle) * helixRadius
      );
      
      const pos2 = new THREE.Vector3(
        Math.cos(angle + Math.PI) * helixRadius,
        y,
        Math.sin(angle + Math.PI) * helixRadius
      );

      // Create base geometries
      const baseGeometry = new THREE.SphereGeometry(4, 16, 16);
      
      // Base 1
      const baseMaterial1 = new THREE.MeshPhongMaterial({
        color: baseColors[base1 as keyof typeof baseColors],
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      const baseMesh1 = new THREE.Mesh(baseGeometry, baseMaterial1);
      baseMesh1.position.copy(pos1);
      scene.add(baseMesh1);

      // Base 2
      const baseMaterial2 = new THREE.MeshPhongMaterial({
        color: baseColors[base2 as keyof typeof baseColors],
        transparent: true,
        opacity: 0.8,
        shininess: 100
      });
      const baseMesh2 = new THREE.Mesh(baseGeometry, baseMaterial2);
      baseMesh2.position.copy(pos2);
      scene.add(baseMesh2);

      // Create hydrogen bonds
      const bondCount = (base1 === 'A' || base1 === 'T') ? 2 : 3;
      const connections: THREE.Mesh[] = [];
      
      for (let j = 0; j < bondCount; j++) {
        const bondGeometry = new THREE.CylinderGeometry(0.5, 0.5, pos1.distanceTo(pos2), 8);
        const bondMaterial = new THREE.MeshPhongMaterial({
          color: 0xffffff,
          transparent: true,
          opacity: 0.4
        });
        const bondMesh = new THREE.Mesh(bondGeometry, bondMaterial);
        
        // Position bond between bases
        bondMesh.position.copy(pos1).add(pos2).multiplyScalar(0.5);
        bondMesh.lookAt(pos2);
        bondMesh.rotateX(Math.PI / 2);
        
        // Offset multiple bonds
        const offset = (j - (bondCount - 1) / 2) * 1.5;
        bondMesh.position.add(new THREE.Vector3(0, offset, 0));
        
        scene.add(bondMesh);
        connections.push(bondMesh);
      }

      basePairsRef.current.push({
        base1,
        base2,
        mesh1: baseMesh1,
        mesh2: baseMesh2,
        connections,
        originalGlow: 0,
        glowIntensity: 0
      });
    }
  };

  const initParticles3D = (scene: THREE.Scene) => {
    const particleCount = 100;
    const particleGeometry = new THREE.SphereGeometry(1, 8, 8);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: rgbaToThreeColor(sparkColor),
      transparent: true,
      opacity: 0.6
    });

    particlesRef.current = [];
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
      
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400,
        (Math.random() - 0.5) * 400
      );
      particle.position.copy(position);
      
      scene.add(particle);
      
      particlesRef.current.push({
        mesh: particle,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5
        ),
        originalPosition: position.clone(),
        angle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01
      });
    }
  };

  const updateDNA3D = (time: number, waveOffset: number) => {
    // Animate DNA structure
    if (backboneRef.current) {
      backboneRef.current.mesh1.rotation.y = time * 0.2;
      backboneRef.current.mesh2.rotation.y = time * 0.2;
    }

    // Animate base pairs
    basePairsRef.current.forEach((basePair, index) => {
      const waveAmplitude = Math.sin(waveOffset + index * 0.2) * 2;
      const rotationOffset = time * 0.2 + index * 0.2;
      
      // Apply wave motion to bases
      basePair.mesh1.position.x += Math.cos(rotationOffset) * waveAmplitude * 0.1;
      basePair.mesh1.position.z += Math.sin(rotationOffset) * waveAmplitude * 0.1;
      basePair.mesh2.position.x += Math.cos(rotationOffset + Math.PI) * waveAmplitude * 0.1;
      basePair.mesh2.position.z += Math.sin(rotationOffset + Math.PI) * waveAmplitude * 0.1;
      
      // Rotate bases
      basePair.mesh1.rotation.y = time + index * 0.1;
      basePair.mesh2.rotation.y = time + index * 0.1;
    });
  };

  const updateParticles3D = () => {
    if (!cameraRef.current) return;
    
    particlesRef.current.forEach(particle => {
      // Mouse repulsion in 3D
      const mouse3D = new THREE.Vector3();
      mouse3D.x = mouseRef.current.x * 100;
      mouse3D.y = mouseRef.current.y * 100;
      mouse3D.z = cameraRef.current ? cameraRef.current.position.z * 0.1 : 0;
      
      const distance = particle.mesh.position.distanceTo(mouse3D);
      if (distance < 50) {
        const repulsion = particle.mesh.position.clone().sub(mouse3D).normalize().multiplyScalar(0.5);
        particle.velocity.add(repulsion);
      }
      
      // Apply velocity
      particle.mesh.position.add(particle.velocity);
      
      // Add orbital motion
      particle.angle += particle.speed;
      const orbital = new THREE.Vector3(
        Math.cos(particle.angle) * 0.1,
        Math.sin(particle.angle * 0.7) * 0.1,
        Math.sin(particle.angle) * 0.1
      );
      particle.mesh.position.add(orbital);
      
      // Damping
      particle.velocity.multiplyScalar(0.98);
      
      // Boundary wrapping
      if (particle.mesh.position.x < -200) particle.mesh.position.x = 200;
      if (particle.mesh.position.x > 200) particle.mesh.position.x = -200;
      if (particle.mesh.position.y < -200) particle.mesh.position.y = 200;
      if (particle.mesh.position.y > 200) particle.mesh.position.y = -200;
      if (particle.mesh.position.z < -200) particle.mesh.position.z = 200;
      if (particle.mesh.position.z > 200) particle.mesh.position.z = -200;
    });
  };

  const updateClickRipples3D = () => {
    if (!sceneRef.current) return;
    
    clickRipples.current = clickRipples.current.filter(ripple => {
      ripple.scale += 0.1;
      ripple.opacity -= 0.02;
      
      ripple.mesh.scale.set(ripple.scale, ripple.scale, ripple.scale);
      (ripple.mesh.material as THREE.MeshBasicMaterial).opacity = ripple.opacity;
      
      if (ripple.opacity <= 0) {
        sceneRef.current!.remove(ripple.mesh);
        return false;
      }
      return true;
    });
  };

  const updateGlowEffects = () => {
    if (!cameraRef.current) return;
    
    // Convert mouse position to 3D ray
    raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
    
    basePairsRef.current.forEach(basePair => {
      // Calculate distance from mouse ray to base
      const distance1 = raycasterRef.current.ray.distanceToPoint(basePair.mesh1.position);
      const distance2 = raycasterRef.current.ray.distanceToPoint(basePair.mesh2.position);
      const minDistance = Math.min(distance1, distance2);
      
      // Apply glow effect
      const glowRadius = 30;
      if (minDistance < glowRadius) {
        basePair.glowIntensity = Math.max(0, 1 - minDistance / glowRadius);
      } else {
        basePair.glowIntensity *= 0.95;
      }
      
      // Update material emissive properties for glow
      const emissiveIntensity = basePair.glowIntensity * 0.3;
      (basePair.mesh1.material as THREE.MeshPhongMaterial).emissive.setScalar(emissiveIntensity);
      (basePair.mesh2.material as THREE.MeshPhongMaterial).emissive.setScalar(emissiveIntensity);
      
      // Update connection glow
      basePair.connections.forEach(connection => {
        (connection.material as THREE.MeshPhongMaterial).emissive.setScalar(emissiveIntensity);
        (connection.material as THREE.MeshPhongMaterial).opacity = 0.4 + basePair.glowIntensity * 0.4;
      });
    });
  };

  return (
    <div
      ref={mountRef}
      className={`fixed inset-0 ${className}`}
      style={{
        zIndex: 0,
        pointerEvents: 'none',
        background: 'transparent'
      }}
    />
  );
};

export default DNASparkBackground3D;