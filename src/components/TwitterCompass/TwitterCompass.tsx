'use client';

import { useState, useEffect, useRef } from 'react';
import { AnalyticsData } from '@/types';

interface TwitterCompassProps {
  data: AnalyticsData;
  username: string;
  onReset: () => void;
}

type ChartType = 'time-of-day' | 'length' | 'freq' | 'all';

export default function TwitterCompass({ data }: TwitterCompassProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('all');
  const [showChart, setShowChart] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const backgroundRef = useRef<HTMLCanvasElement>(null);
  const characterCountsRef = useRef<HTMLCanvasElement>(null);
  const timeOfDayRef = useRef<HTMLCanvasElement>(null);
  const mostUsedRef = useRef<HTMLCanvasElement>(null);
  const mostUsedMarkersRef = useRef<HTMLCanvasElement>(null);
  const topLayerRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (data) {
      // Show chart after a short delay
      setTimeout(() => setShowChart(true), 500);
      // Show info after chart is visible
      setTimeout(() => setShowInfo(true), 1000);
    }
  }, [data]);

  const renderCharts = () => {
    // Clear all canvases
    [
      backgroundRef,
      characterCountsRef,
      timeOfDayRef,
      mostUsedRef,
      mostUsedMarkersRef,
      topLayerRef,
    ].forEach((ref) => {
      if (ref.current) {
        const ctx = ref.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, 600, 538);
        }
      }
    });

    // Render background
    if (backgroundRef.current) {
      const ctx = backgroundRef.current.getContext('2d');
      if (ctx) {
        ctx.fillStyle = 'rgba(39, 54, 63, 1)';
        ctx.fillRect(0, 0, 600, 538);
      }
    }

    // Render charts based on active selection
    // Show all charts layered together for fingerprint effect, or individual charts
    if (activeChart === 'all' || activeChart === 'time-of-day') {
      renderTimeOfDayChart();
    }
    if (activeChart === 'all' || activeChart === 'length') {
      renderTweetLengthChart();
    }
    if (activeChart === 'all' || activeChart === 'freq') {
      renderCharacterFrequencyChart();
    }
  };

  useEffect(() => {
    if (showChart) {
      renderCharts();
    }
  }, [showChart, activeChart, data]);

  const renderTimeOfDayChart = () => {
    if (!timeOfDayRef.current) return;

    const ctx = timeOfDayRef.current.getContext('2d');
    if (!ctx) return;

    const centerX = 300;
    const centerY = 269;
    const maxRadius = 200;
    const minRadius = 50;

    const timeData = data.timeOfDay;
    const maxValue = Math.max(...Object.values(timeData));

    ctx.beginPath();
    ctx.strokeStyle = '#0696CB';
    ctx.fillStyle = '#195872';
    ctx.lineWidth = 2;

    const points: { x: number; y: number }[] = [];
    const hours = Object.keys(timeData)
      .map(Number)
      .sort((a, b) => a - b);

    hours.forEach((hour) => {
      const angle = ((hour * 15 - 90) * Math.PI) / 180; // 15 degrees per hour
      const radius =
        minRadius + (timeData[hour] / maxValue) * (maxRadius - minRadius);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y });
    });

    // Draw the shape
    if (points.length > 0) {
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  };

  const renderTweetLengthChart = () => {
    if (!characterCountsRef.current) return;

    const ctx = characterCountsRef.current.getContext('2d');
    if (!ctx) return;

    const centerX = 300;
    const centerY = 269;
    const maxRadius = 200;
    const minRadius = 50;

    const lengthData = data.tweetLength;
    const maxValue = Math.max(...Object.values(lengthData));

    ctx.strokeStyle = '#EC0972';
    ctx.lineWidth = 2;

    Object.entries(lengthData).forEach(([length, count]) => {
      if (count > 0) {
        const angle = ((parseInt(length) * 2.57 - 90) * Math.PI) / 180; // 360/140 ≈ 2.57
        const radius = minRadius + (count / maxValue) * (maxRadius - minRadius);
        const startX = centerX + minRadius * Math.cos(angle);
        const startY = centerY + minRadius * Math.sin(angle);
        const endX = centerX + radius * Math.cos(angle);
        const endY = centerY + radius * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    });
  };

  const renderCharacterFrequencyChart = () => {
    if (!mostUsedRef.current) return;

    const ctx = mostUsedRef.current.getContext('2d');
    if (!ctx) return;

    const centerX = 300;
    const centerY = 269;
    const maxRadius = 180;
    const minRadius = 40;

    const freqData = data.characterFrequency;
    const maxValue = Math.max(...Object.values(freqData));

    // Create character set: A-Z, 0-9, special characters
    const allChars = [
      ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)), // A-Z
      ...Array.from({ length: 10 }, (_, i) => i.toString()), // 0-9
      '#',
      '$',
      '%',
      '&',
      '!',
      '?',
      '@',
      '+',
      '-',
      '=',
      '(',
      ')',
      '[',
      ']',
      '{',
      '}',
      '|',
      '\\',
      '/',
      ':',
      ';',
      '"',
      "'",
      ',',
      '.',
      '<',
      '>',
      '~',
      '`',
    ];

    // Draw concentric circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 5; i++) {
      const radius = minRadius + (i * (maxRadius - minRadius)) / 5;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Draw radial lines
    const numLines = allChars.length;
    for (let i = 0; i < numLines; i++) {
      const angle = (((i * 360) / numLines - 90) * Math.PI) / 180;
      const x = centerX + maxRadius * Math.cos(angle);
      const y = centerY + maxRadius * Math.sin(angle);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    // Draw character labels
    ctx.font = '10px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    allChars.forEach((char, index) => {
      const angle = (((index * 360) / numLines - 90) * Math.PI) / 180;
      const labelRadius = maxRadius + 20;
      const x = centerX + labelRadius * Math.cos(angle);
      const y = centerY + labelRadius * Math.sin(angle);
      ctx.fillText(char, x, y);
    });

    // Draw data points and connections
    const points: { x: number; y: number; char: string; value: number }[] = [];

    allChars.forEach((char, index) => {
      const value = freqData[char] || 0;
      if (value > 0) {
        const angle = (((index * 360) / numLines - 90) * Math.PI) / 180;
        const radius = minRadius + (value / maxValue) * (maxRadius - minRadius);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        points.push({ x, y, char, value });
      }
    });

    // Draw connecting lines
    ctx.strokeStyle = '#0696CB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    if (points.length > 0) {
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.closePath();
      ctx.stroke();
    }

    // Draw data points as circles
    ctx.fillStyle = '#0696CB';
    points.forEach((point) => {
      ctx.beginPath();
      ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    });

    // Draw pink lines from center to data points
    ctx.strokeStyle = '#EC0972';
    ctx.lineWidth = 1;
    points.forEach((point) => {
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();
    });
  };

  return (
    <div className="twitter-compass">
      <div className={`chart-inner ${showChart ? 'active' : ''}`}>
        <canvas
          ref={backgroundRef}
          id="background"
          width="600"
          height="538"
        ></canvas>
        <canvas
          ref={characterCountsRef}
          id="character-counts"
          width="600"
          height="538"
          className={activeChart === 'length' ? 'active' : ''}
        ></canvas>
        <canvas
          ref={timeOfDayRef}
          id="time-of-day"
          width="600"
          height="538"
          className={activeChart === 'time-of-day' ? 'active' : ''}
        ></canvas>
        <canvas
          ref={mostUsedRef}
          id="most-used"
          width="600"
          height="538"
          className={activeChart === 'freq' ? 'active' : ''}
        ></canvas>
        <canvas
          ref={mostUsedMarkersRef}
          id="most-used-markers"
          width="600"
          height="538"
        ></canvas>
        <canvas
          ref={topLayerRef}
          id="top-layer"
          width="600"
          height="538"
        ></canvas>
      </div>

      <div className={`info ${showInfo ? 'active' : ''}`}>
        <div id="stats">
          <p className="tweet-count">Last {data.stats.totalTweets} Tweets</p>
          <div className="stat-wrap">
            <p className="intro">
              Toggle data sets by the following parameters.
            </p>
            <p
              className={`stat time-of-day ${activeChart === 'time-of-day' ? 'active' : ''}`}
            >
              Most active at{' '}
              <span className="most-active">{data.stats.mostActiveTime}</span>
              <span className="divider">-</span>Least active at{' '}
              <span className="least-active">{data.stats.leastActiveTime}</span>
            </p>
            <p
              className={`stat tweet-length ${activeChart === 'length' ? 'active' : ''}`}
            >
              Average Tweet length{' '}
              <span>{data.stats.averageTweetLength} characters</span>
            </p>
            <p
              className={`stat most-used ${activeChart === 'freq' ? 'active' : ''}`}
            >
              Most used character <span>{data.stats.mostUsedCharacter}</span>
            </p>
          </div>
        </div>

        <div className="btn-wrap">
          <div
            className={`btn-toggle all ${activeChart === 'all' ? 'active' : ''}`}
            onClick={() => setActiveChart('all')}
          >
            <div className="grphx">
              <span className="icon all"></span>
            </div>
            <span>
              all
              <br />
              charts
            </span>
          </div>
          <div
            className={`btn-toggle time ${activeChart === 'time-of-day' ? 'active' : ''}`}
            onClick={() => setActiveChart('time-of-day')}
          >
            <div className="grphx">
              <span className="icon time"></span>
            </div>
            <span>
              time
              <br />
              of day
            </span>
          </div>
          <div
            className={`btn-toggle length ${activeChart === 'length' ? 'active' : ''}`}
            onClick={() => setActiveChart('length')}
          >
            <div className="grphx">
              <span className="icon length"></span>
            </div>
            <span>tweet length</span>
          </div>
          <div
            className={`btn-toggle freq ${activeChart === 'freq' ? 'active' : ''}`}
            onClick={() => setActiveChart('freq')}
          >
            <div className="grphx">
              <span className="icon freq"></span>
            </div>
            <span>character frequency</span>
          </div>
        </div>

        <h2>About.</h2>
        <p className="about">
          This is the result of an exercise we did in our spare time; we call it
          Twitter Compass. The objective was to build a project that we could
          complete quickly and build in iterations. We set aside some time and
          went from ideation to design to development inside of a week.
          <br />
          <br />
          The resulting chart is a type of Twitter fingerprint: your active
          times + how wordy you are can be compared to others. Additionally, we
          noticed that an authentic user posts much more evenly throughout the
          day, but a bot or paid intern has their tweets scheduled at specific
          times.
          <br />
          <br />
          This was a fun, quick project. There are more robust Twitter
          visualization tools that exist, but there are none that are prettier.
        </p>
        <footer>
          <a href="http://martiansf.com" target="_blank">
            <img src="/img/martian-logo.png" alt="" />
          </a>
        </footer>
      </div>
    </div>
  );
}
