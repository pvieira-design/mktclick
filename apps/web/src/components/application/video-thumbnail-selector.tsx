"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface VideoThumbnailSelectorProps {
  videoUrl: string;
  currentThumbnailUrl?: string | null;
  onThumbnailCaptured: (blob: Blob) => void;
  isUploading?: boolean;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoThumbnailSelector({
  videoUrl,
  currentThumbnailUrl,
  onThumbnailCaptured,
  isUploading,
}: VideoThumbnailSelectorProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [isReady, setIsReady] = useState(false);

  const handleLoadedMetadata = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
    setIsReady(true);
  }, []);

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;
    const time = parseFloat(e.target.value);
    video.currentTime = time;
    setCurrentTime(time);
  }, []);

  const handleCapture = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob((blob) => {
      if (blob) onThumbnailCaptured(blob);
    }, "image/png");
  }, [onThumbnailCaptured]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => setCurrentTime(video.currentTime);
    video.addEventListener("timeupdate", onTimeUpdate);
    return () => video.removeEventListener("timeupdate", onTimeUpdate);
  }, []);

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        src={videoUrl}
        crossOrigin="anonymous"
        preload="metadata"
        muted
        onLoadedMetadata={handleLoadedMetadata}
        className="mx-auto max-h-[300px] w-full rounded-lg bg-black object-contain"
      />

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          disabled={!isReady}
          className="flex-1 accent-brand-600"
        />
        <span className="whitespace-nowrap text-xs text-tertiary">
          {formatTime(currentTime)} / {formatTime(duration)}
        </span>
      </div>

      <div className="flex items-center justify-between">
        {currentThumbnailUrl ? (
          <div className="flex items-center gap-2">
            <img
              src={currentThumbnailUrl}
              alt="Thumbnail atual"
              className="h-16 w-24 rounded border border-secondary object-cover"
            />
            <span className="text-xs text-tertiary">Thumbnail atual</span>
          </div>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={handleCapture}
          disabled={!isReady || isUploading}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Enviando..." : "Capturar Frame"}
        </button>
      </div>
    </div>
  );
}
