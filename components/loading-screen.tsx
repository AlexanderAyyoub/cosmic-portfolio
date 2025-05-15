'use client';

import { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleProgress = (event: CustomEvent) => {
      setProgress(event.detail);
    };

    const handleLoad = () => {
      setTimeout(() => setVisible(false), 500); // Fade out
    };

    window.addEventListener('loadingProgress', handleProgress as EventListener);
    window.addEventListener('loadingComplete', handleLoad);

    return () => {
      window.removeEventListener('loadingProgress', handleProgress as EventListener);
      window.removeEventListener('loadingComplete', handleLoad);
    };
  }, []);

  return (
    <div
      style={{
        pointerEvents: visible ? 'auto' : 'none',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.8s ease-in-out',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: 9999,
      }}
    >
      {/* Video Background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          objectFit: 'cover',
          width: '100%',
          height: '100%',
          zIndex: -1,
        }}
      >
        <source src="/videos/loading-bg.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>

      {/* Loading UI */}
      <div
        style={{
          fontFamily: '"AlbertusMTStd", sans-serif',
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          padding: '1rem',
        }}
      >
        <style jsx global>{`
          @font-face {
            font-family: 'AlbertusMTStd';
            src: url('/fonts/AlbertusMTStd.otf') format('opentype');
            font-display: swap;
          }
        `}</style>

        <h1 className="text-2xl mb-4 tracking-wide">Loading the Cosmos</h1>
        <div className="w-1/2 max-w-md">
          <Progress value={progress} />
        </div>
        <p className="mt-4 text-sm text-gray-300">{Math.round(progress)}%</p>
      </div>
    </div>
  );
}
