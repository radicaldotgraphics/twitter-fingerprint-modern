'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface RadialChartProps {
  data: Record<string, number>;
  type: 'timeOfDay' | 'tweetLength' | 'characterFrequency';
  width?: number;
  height?: number;
  className?: string;
}

interface Point {
  x: number;
  y: number;
}

const COLORS = {
  PINK: '#EC0972',
  BLUE: '#0696CB',
  GREEN: '#00FF00',
  GRAY: '#76787A',
  WHITE: '#FFFFFF',
  TIME_OF_DAY_FILL: '#195872',
  MOST_USED_FILL: '#1D3C46',
};

const DrawConfig = {
  CANVAS_WIDTH: 600,
  CANVAS_HEIGHT: 600,
  RADIUS: 200,
  CENTER_X: 300,
  CENTER_Y: 300,
};

export default function RadialChart({
  data,
  type,
  width = 600,
  height = 600,
  className = '',
}: RadialChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Start animation based on chart type
    setIsAnimating(true);

    switch (type) {
      case 'timeOfDay':
        animateTimeOfDayChart(ctx, data);
        break;
      case 'tweetLength':
        animateTweetLengthChart(ctx, data);
        break;
      case 'characterFrequency':
        animateCharacterFrequencyChart(ctx, data);
        break;
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [data, type, width, height]);

  const animateTimeOfDayChart = (
    ctx: CanvasRenderingContext2D,
    data: Record<string, number>
  ) => {
    const numPoints = Object.keys(data).length;
    const angleIncrement = 360 / numPoints;
    const rad = Math.PI / 180;
    const angleOffset = 90 - 360 / numPoints;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxValue = Math.max(...Object.values(data));
    const mult = (DrawConfig.RADIUS - 50) / maxValue;
    const minOffset = 50;

    let iteration = 0;
    const totalIterations = 60;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = iteration / totalIterations;
      const easedProgress = easeInOutExpo(progress);

      const points: Point[] = [];
      let i = 0;

      for (const [, value] of Object.entries(data)) {
        const angleStep = (angleIncrement * i - angleOffset) * rad;
        const distance = mult * value * easedProgress + minOffset;
        const x = centerX + distance * Math.cos(angleStep);
        const y = centerY + distance * Math.sin(angleStep);
        points.push({ x, y });
        i++;
      }

      // Draw the radial shape
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.closePath();
        ctx.fillStyle = COLORS.TIME_OF_DAY_FILL;
        ctx.fill();
        ctx.strokeStyle = COLORS.BLUE;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw hour markers
      drawHourMarkers(ctx, centerX, centerY, minOffset + 20);

      iteration++;
      if (iteration < totalIterations) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  };

  const animateTweetLengthChart = (
    ctx: CanvasRenderingContext2D,
    data: Record<string, number>
  ) => {
    const numPoints = Object.keys(data).length;
    const angleIncrement = 360 / numPoints;
    const rad = Math.PI / 180;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxValue = Math.max(...Object.values(data));
    const mult = (DrawConfig.RADIUS * 0.6) / maxValue;
    const minOffset = 40;

    let iteration = 0;
    const totalIterations = 60;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = iteration / totalIterations;
      const easedProgress = easeInOutExpo(progress);

      let i = 0;
      for (const [, value] of Object.entries(data)) {
        if (value > 0) {
          const angleStep = (angleIncrement * i - 90) * rad;
          const distance = mult * value * easedProgress + minOffset;
          const startX = centerX + minOffset * Math.cos(angleStep);
          const startY = centerY + minOffset * Math.sin(angleStep);
          const endX = centerX + distance * Math.cos(angleStep);
          const endY = centerY + distance * Math.sin(angleStep);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.strokeStyle = COLORS.PINK;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        i++;
      }

      // Draw character count markers
      drawCharacterCountMarkers(ctx, centerX, centerY, minOffset + 30);

      iteration++;
      if (iteration < totalIterations) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  };

  const animateCharacterFrequencyChart = (
    ctx: CanvasRenderingContext2D,
    data: Record<string, number>
  ) => {
    const numPoints = Object.keys(data).length;
    const angleIncrement = 360 / numPoints;
    const rad = Math.PI / 180;

    const centerX = width / 2;
    const centerY = height / 2;
    const maxValue = Math.max(...Object.values(data));
    const mult = (DrawConfig.RADIUS * 0.5) / maxValue;
    const minOffset = 50;

    let iteration = 0;
    const totalIterations = 60;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      const progress = iteration / totalIterations;
      const easedProgress = easeInOutExpo(progress);

      const points: Point[] = [];
      let i = 0;

      for (const [, value] of Object.entries(data)) {
        const angleStep = (angleIncrement * i - 90) * rad;
        const distance = mult * value * easedProgress + minOffset;
        const x = centerX + distance * Math.cos(angleStep);
        const y = centerY + distance * Math.sin(angleStep);
        points.push({ x, y });
        i++;
      }

      // Draw the radial shape
      if (points.length > 0) {
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);

        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i].x, points[i].y);
        }

        ctx.closePath();
        ctx.fillStyle = COLORS.MOST_USED_FILL;
        ctx.fill();
        ctx.strokeStyle = COLORS.BLUE;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Draw character markers
      drawCharacterMarkers(ctx, centerX, centerY, minOffset + 20, data);

      iteration++;
      if (iteration < totalIterations) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();
  };

  const drawHourMarkers = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    ctx.font = '12px Inter, sans-serif';
    ctx.fillStyle = COLORS.GRAY;
    ctx.textAlign = 'center';

    for (let i = 0; i < 24; i++) {
      if (i % 3 === 0) {
        // Show every 3rd hour
        const angle = ((i * 15 - 90) * Math.PI) / 180;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        ctx.fillText(`${i}:00`, x, y + 4);
      }
    }
  };

  const drawCharacterCountMarkers = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number
  ) => {
    ctx.font = '10px Inter, sans-serif';
    ctx.fillStyle = COLORS.GRAY;
    ctx.textAlign = 'center';

    for (let i = 0; i <= 140; i += 20) {
      const angle = ((i * 2.57 - 90) * Math.PI) / 180; // 360/140 ≈ 2.57
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.fillText(i.toString(), x, y + 3);
    }
  };

  const drawCharacterMarkers = (
    ctx: CanvasRenderingContext2D,
    centerX: number,
    centerY: number,
    radius: number,
    data: Record<string, number>
  ) => {
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';

    const chars = Object.keys(data).slice(0, 20); // Show top 20 characters
    const angleIncrement = 360 / chars.length;

    chars.forEach((char, i) => {
      const angle = ((angleIncrement * i - 90) * Math.PI) / 180;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      ctx.fillStyle = data[char] > 0 ? COLORS.WHITE : COLORS.GRAY;
      ctx.fillText(char.toUpperCase(), x, y + 3);
    });
  };

  const easeInOutExpo = (t: number): number => {
    return t === 0
      ? 0
      : t === 1
        ? 1
        : t < 0.5
          ? Math.pow(2, 20 * t - 10) / 2
          : (2 - Math.pow(2, -20 * t + 10)) / 2;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={`relative ${className}`}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="w-full h-auto"
        style={{ maxWidth: '100%', height: 'auto' }}
      />
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/80 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-pink-600 border-t-transparent" />
              <span className="text-sm font-medium text-gray-700">
                Rendering chart...
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
