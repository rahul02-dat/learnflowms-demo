import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

interface VideoPlayerProps {
  sourceType: 'hls' | 'youtube' | 'vimeo' | 's3';
  src: string;
  poster?: string;
  onEnded?: () => void;
  onProgress?: (progress: number) => void;
}

export default function LearnFlowVideoPlayer({ sourceType, src, poster, onEnded, onProgress }: VideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onEndedRef = useRef(onEnded);
  const onProgressRef = useRef(onProgress);

  useEffect(() => {
    onEndedRef.current = onEnded;
    onProgressRef.current = onProgress;
  }, [onEnded, onProgress]);

  useEffect(() => {
    if (sourceType !== 'hls' && sourceType !== 'youtube') {
      setError(`${sourceType} support is not yet implemented. Currently HLS and YouTube are supported.`);
      return;
    }
    
    setError(null);
    if (!containerRef.current) return;

    // Create a new video element for video.js
    const videoElement = document.createElement('video');
    videoElement.classList.add('video-js', 'vjs-big-play-centered', 'vjs-theme-city');
    containerRef.current.appendChild(videoElement);

    let isMounted = true;

    const initPlayer = async () => {
      if (sourceType === 'youtube') {
        // videojs-youtube expects global videojs object
        if (typeof window !== 'undefined') {
          (window as any).videojs = videojs;
        }
        await import('videojs-youtube');
      }

      if (!isMounted) return;

      const options: any = {
        autoplay: false,
        controls: true,
        responsive: true,
        fluid: true,
        poster: poster,
        sources: [{
          src,
          type: sourceType === 'youtube' ? 'video/youtube' : 'application/x-mpegURL'
        }]
      };

      if (sourceType === 'youtube') {
        options.techOrder = ['youtube'];
      }

      playerRef.current = videojs(videoElement, options, () => {
        const player = playerRef.current;
        if (!player) return;
        
        player.on('ended', () => {
          if (onEndedRef.current) onEndedRef.current();
        });
        
        player.on('timeupdate', () => {
          if (onProgressRef.current) {
            const progress = (player.currentTime() / player.duration()) * 100;
            onProgressRef.current(progress);
          }
        });
      });
    };

    initPlayer();

    return () => {
      isMounted = false;
      if (playerRef.current && !playerRef.current.isDisposed()) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, sourceType, poster]);

  if (error) {
    return (
      <div className="w-full h-full min-h-[400px] flex items-center justify-center bg-[#0d1117] border border-[#30363d] rounded-lg">
        <div className="text-center p-6">
          <p className="text-[#f85149] font-mono text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div data-vjs-player ref={containerRef} className="w-full rounded-lg overflow-hidden border border-[#30363d]">
    </div>
  );
}
