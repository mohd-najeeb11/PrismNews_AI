'use client';

import React, { useEffect, useRef } from 'react';

export default function PrismBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Target cursor position & smoothed values
    let targetMouseX = window.innerWidth / 2;
    let targetMouseY = window.innerHeight / 3;
    let mouseX = targetMouseX;
    let mouseY = targetMouseY;

    // Prism 3D rotation angles
    let angleX = 0.2;
    let angleY = 0.5;
    let angleZ = 0.05;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        targetMouseX = e.touches[0].clientX;
        targetMouseY = e.touches[0].clientY;
      }
    };

    const resize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      const dpr = window.devicePixelRatio || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    resize();

    // 3D Triangular Prism Vertices (centered at 0,0,0)
    // Triangular faces top & bottom
    const baseRadius = 140;
    const prismHeight = 220;

    const rawVertices = [
      // Top Triangle
      [0, -prismHeight / 2, baseRadius],
      [baseRadius * Math.sin((2 * Math.PI) / 3), -prismHeight / 2, baseRadius * Math.cos((2 * Math.PI) / 3)],
      [baseRadius * Math.sin((4 * Math.PI) / 3), -prismHeight / 2, baseRadius * Math.cos((4 * Math.PI) / 3)],
      // Bottom Triangle
      [0, prismHeight / 2, baseRadius],
      [baseRadius * Math.sin((2 * Math.PI) / 3), prismHeight / 2, baseRadius * Math.cos((2 * Math.PI) / 3)],
      [baseRadius * Math.sin((4 * Math.PI) / 3), prismHeight / 2, baseRadius * Math.cos((4 * Math.PI) / 3)],
    ];

    const faces = [
      [0, 1, 2], // Top Cap
      [3, 5, 4], // Bottom Cap
      [0, 3, 4, 1], // Side 1
      [1, 4, 5, 2], // Side 2
      [2, 5, 3, 0], // Side 3
    ];

    // Rainbow Spectral Colors
    const spectralColors = [
      'rgba(255, 50, 80, 0.7)',   // Red
      'rgba(255, 140, 0, 0.75)',  // Orange
      'rgba(255, 220, 0, 0.8)',   // Yellow
      'rgba(50, 235, 120, 0.75)',  // Green
      'rgba(0, 215, 255, 0.8)',   // Cyan
      'rgba(90, 120, 255, 0.85)',  // Blue
      'rgba(180, 70, 255, 0.8)',  // Indigo / Violet
    ];

    // Floating particles along rainbow beams
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 1,
      speedX: (Math.random() - 0.5) * 0.8,
      speedY: (Math.random() - 0.5) * 0.8,
      color: spectralColors[Math.floor(Math.random() * spectralColors.length)],
      alpha: Math.random() * 0.6 + 0.2,
    }));

    const render = () => {
      // Smooth interpolation toward cursor position
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      // Map cursor coordinates to 3D rotation angles
      const normX = (mouseX / width - 0.5) * 2;
      const normY = (mouseY / height - 0.5) * 2;

      angleY += (normX * 1.2 - angleY) * 0.05 + 0.003; // Gentle continuous auto-spin + mouse tracking
      angleX += (-normY * 0.8 - angleX) * 0.05;
      angleZ = normX * normY * 0.2;

      ctx.clearRect(0, 0, width, height);

      // Prism center position in viewport (slightly top right/center)
      const prismCenterX = width * 0.5 + normX * 40;
      const prismCenterY = height * 0.35 + normY * 30;

      // 1. Draw Ambient Prism Glow Background Radial
      const bgGlow = ctx.createRadialGradient(
        prismCenterX,
        prismCenterY,
        20,
        prismCenterX,
        prismCenterY,
        width * 0.6
      );
      bgGlow.addColorStop(0, 'rgba(120, 80, 255, 0.15)');
      bgGlow.addColorStop(0.3, 'rgba(50, 180, 255, 0.08)');
      bgGlow.addColorStop(0.7, 'rgba(255, 0, 128, 0.03)');
      bgGlow.addColorStop(1, 'rgba(7, 9, 19, 0)');

      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, width, height);

      // 2. Rotate & Project 3D Vertices
      const projected: [number, number, number][] = [];

      for (let i = 0; i < rawVertices.length; i++) {
        let [x, y, z] = rawVertices[i];

        // Rotate X
        const cosX = Math.cos(angleX);
        const sinX = Math.sin(angleX);
        const y1 = y * cosX - z * sinX;
        const z1 = y * sinX + z * cosX;

        // Rotate Y
        const cosY = Math.cos(angleY);
        const sinY = Math.sin(angleY);
        const x2 = x * cosY + z1 * sinY;
        const z2 = -x * sinY + z1 * cosY;

        // Rotate Z
        const cosZ = Math.cos(angleZ);
        const sinZ = Math.sin(angleZ);
        const x3 = x2 * cosZ - y1 * sinZ;
        const y3 = x2 * sinZ + y1 * cosZ;

        // Perspective Projection
        const fov = 500;
        const scale = fov / (fov + z2 + 200);
        const px = prismCenterX + x3 * scale;
        const py = prismCenterY + y3 * scale;

        projected.push([px, py, z2]);
      }

      // 3. Render Incident White Light Ray (From Left edge into Prism)
      const raySourceX = 0;
      const raySourceY = height * 0.2 + normY * 50;

      const incidentGrad = ctx.createLinearGradient(raySourceX, raySourceY, prismCenterX, prismCenterY);
      incidentGrad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      incidentGrad.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
      incidentGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');

      ctx.beginPath();
      ctx.moveTo(raySourceX, raySourceY);
      ctx.lineTo(prismCenterX - 30, prismCenterY);
      ctx.strokeStyle = incidentGrad;
      ctx.lineWidth = 4;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 15;
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow

      // 4. Render Refracted Rainbow Rays (Dispersing from Prism toward Cursor & Right Canvas)
      const rayAngleStart = Math.atan2(mouseY - prismCenterY, mouseX - prismCenterX) - 0.35;
      const rayAngleSpread = 0.7;
      const rayLength = Math.max(width, height) * 1.2;

      for (let i = 0; i < spectralColors.length; i++) {
        const factor = i / (spectralColors.length - 1);
        const currentAngle = rayAngleStart + factor * rayAngleSpread;

        const targetX = prismCenterX + Math.cos(currentAngle) * rayLength;
        const targetY = prismCenterY + Math.sin(currentAngle) * rayLength;

        // Rainbow Beam Fan Polygon
        const nextAngle = rayAngleStart + ((i + 1) / (spectralColors.length - 1)) * rayAngleSpread;
        const nextTargetX = prismCenterX + Math.cos(nextAngle) * rayLength;
        const nextTargetY = prismCenterY + Math.sin(nextAngle) * rayLength;

        const beamGrad = ctx.createRadialGradient(
          prismCenterX,
          prismCenterY,
          10,
          prismCenterX + Math.cos(currentAngle) * 300,
          prismCenterY + Math.sin(currentAngle) * 300,
          rayLength
        );
        beamGrad.addColorStop(0, spectralColors[i]);
        beamGrad.addColorStop(0.5, spectralColors[i].replace('0.7', '0.25').replace('0.8', '0.3'));
        beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.beginPath();
        ctx.moveTo(prismCenterX, prismCenterY);
        ctx.lineTo(targetX, targetY);
        ctx.lineTo(nextTargetX, nextTargetY);
        ctx.closePath();

        ctx.fillStyle = beamGrad;
        ctx.fill();

        // High-intensity core spectral streak line
        ctx.beginPath();
        ctx.moveTo(prismCenterX, prismCenterY);
        ctx.lineTo(targetX, targetY);
        ctx.strokeStyle = spectralColors[i].replace('0.7', '0.9').replace('0.8', '0.95');
        ctx.lineWidth = 2.5;
        ctx.shadowColor = spectralColors[i];
        ctx.shadowBlur = 12;
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      // 5. Draw Glass Prism Faces (Sorted by Z for depth rendering)
      const sortedFaces = faces
        .map((faceIndices) => {
          const avgZ = faceIndices.reduce((sum, idx) => sum + projected[idx][2], 0) / faceIndices.length;
          return { faceIndices, avgZ };
        })
        .sort((a, b) => a.avgZ - b.avgZ);

      sortedFaces.forEach(({ faceIndices }) => {
        ctx.beginPath();
        const startPt = projected[faceIndices[0]];
        ctx.moveTo(startPt[0], startPt[1]);

        for (let i = 1; i < faceIndices.length; i++) {
          const pt = projected[faceIndices[i]];
          ctx.lineTo(pt[0], pt[1]);
        }
        ctx.closePath();

        // Crystal Glass Facet Gradient
        const faceGrad = ctx.createLinearGradient(
          projected[faceIndices[0]][0],
          projected[faceIndices[0]][1],
          projected[faceIndices[1]][0],
          projected[faceIndices[1]][1]
        );
        faceGrad.addColorStop(0, 'rgba(255, 255, 255, 0.18)');
        faceGrad.addColorStop(0.4, 'rgba(160, 210, 255, 0.08)');
        faceGrad.addColorStop(0.8, 'rgba(255, 120, 220, 0.12)');
        faceGrad.addColorStop(1, 'rgba(255, 255, 255, 0.22)');

        ctx.fillStyle = faceGrad;
        ctx.fill();

        // Glowing Prism Edge Borders
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.shadowColor = 'rgba(180, 220, 255, 0.8)';
        ctx.shadowBlur = 10;
        ctx.stroke();
        ctx.shadowBlur = 0;
      });

      // 6. Floating Spectral Particles
      particles.forEach((p) => {
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // 7. Cursor Follow Glow Ring
      const cursorGlow = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 180);
      cursorGlow.addColorStop(0, 'rgba(168, 85, 247, 0.15)');
      cursorGlow.addColorStop(0.5, 'rgba(59, 130, 246, 0.08)');
      cursorGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = cursorGlow;
      ctx.beginPath();
      ctx.arc(mouseX, mouseY, 180, 0, Math.PI * 2);
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 w-full h-full"
      style={{ opacity: 0.9 }}
    />
  );
}
