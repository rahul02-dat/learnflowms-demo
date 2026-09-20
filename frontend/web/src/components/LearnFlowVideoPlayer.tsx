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
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Switch logic based on sourceType
    // For now, we are implementing HLS natively with video.js.
    // YouTube/Vimeo would require separate video.js plugins (e.g., videojs-youtube).
    
    if (sourceType !== 'hls') {
      setError(`${sourceType} support is not yet implemented. Currently only HLS is supported for testing.`);
      return;
    }
    
    setError(null);
    
    if (!videoRef.current) return;

    const videoElement = videoRef.current;
    
    const options = {
      autoplay: false,
      controls: true,
      responsive: true,
      fluid: true,
      poster: poster,
      sources: [{
        src,
        type: 'application/x-mpegURL' // HLS MIME type
      }]
    };

    playerRef.current = videojs(videoElement, options, () => {
      // Player is ready
      const player = playerRef.current;
      
      player.on('ended', () => {
        if (onEnded) onEnded();
      });
      
      player.on('timeupdate', () => {
        if (onProgress) {
          const progress = (player.currentTime() / player.duration()) * 100;
          onProgress(progress);
        }
      });
    });

    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, [src, sourceType, poster, onEnded, onProgress]);

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
    <div data-vjs-player className="w-full rounded-lg overflow-hidden border border-[#30363d]">
      <video ref={videoRef} className="video-js vjs-big-play-centered vjs-theme-city" />
    </div>
  );
}
