'use client';

import { useEffect, useRef } from 'react';

export default function AnimatedGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const setCanvasDimensions = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    setCanvasDimensions();
    window.addEventListener('resize', setCanvasDimensions);
    
    // Create gradient points
    const gradientPoints = [
      { x: canvas.width * 0.1, y: canvas.height * 0.1, radius: canvas.width * 0.4, color: 'rgba(216, 180, 254, 0.3)' }, // blue
      { x: canvas.width * 0.9, y: canvas.height * 0.9, radius: canvas.width * 0.4, color: 'rgba(244, 114, 182, 0.3)' }, // Pink
    ];
    
    // Animation variables
    let animationFrameId: number;
    let time = 0;
    
    // Animation function
    const animate = () => {
      time += 0.005;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update gradient positions
      gradientPoints.forEach((point, index) => {
        point.x = canvas.width * (0.3 + 0.4 * Math.sin(time + index * Math.PI));
        point.y = canvas.height * (0.3 + 0.4 * Math.cos(time + index * Math.PI));
      });
      
      // Draw gradients
      gradientPoints.forEach(point => {
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, point.radius
        );
        
        gradient.addColorStop(0, point.color);
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      window.removeEventListener('resize', setCanvasDimensions);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 size-full -z-10"
      style={{ opacity: 0.8 }}
    />
  );
}
