"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

const MAX_DIMENSION = 1080;
const JPEG_QUALITY = 0.8;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

interface CameraCaptureProps {
  onUploading?: (uploading: boolean) => void;
}

export function CameraCapture({ onUploading }: CameraCaptureProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const videoRefCallback = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
    }
  }, []);

  const startCamera = useCallback(async () => {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1080 }, height: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = stream;
      setIsOpen(true);
    } catch {
      setError("Camera access denied");
    }
  }, []);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsOpen(false);
  }, []);

  const captureAndUpload = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0 || video.videoHeight === 0) {
      setError("Camera not ready yet, try again");
      return;
    }

    const canvas = document.createElement("canvas");
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const scale = Math.min(MAX_DIMENSION / Math.max(vw, vh), 1);
    canvas.width = Math.round(vw * scale);
    canvas.height = Math.round(vh * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    stopCamera();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", JPEG_QUALITY)
    );
    if (!blob) {
      setError("Failed to capture image");
      return;
    }
    if (blob.size > MAX_FILE_SIZE) {
      setError("Image too large after compression");
      return;
    }

    setUploading(true);
    onUploading?.(true);
    try {
      const formData = new FormData();
      formData.append("image", blob, "snap.jpg");
      const res = await fetch("/api/image", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Upload failed");
      }
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
      onUploading?.(false);
    }
  }, [stopCamera, onUploading]);

  return (
    <>
      <motion.button
        onClick={startCamera}
        disabled={uploading}
        whileTap={{ scale: 0.9 }}
        whileHover={{ scale: 1.1 }}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 backdrop-blur transition-colors hover:bg-white/20 hover:text-white disabled:opacity-40"
        aria-label="Take a photo"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5"
        >
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
          <circle cx="12" cy="13" r="3" />
        </svg>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90"
          >
            <video
              ref={videoRefCallback}
              autoPlay
              playsInline
              muted
              className="max-h-[70vh] max-w-[90vw] rounded-2xl object-cover"
            />

            <div className="mt-6 flex items-center gap-6">
              <button
                onClick={stopCamera}
                className="rounded-full bg-white/10 px-5 py-2.5 text-sm text-white/70 transition-colors hover:bg-white/20"
              >
                Cancel
              </button>

              <motion.button
                onClick={captureAndUpload}
                whileTap={{ scale: 0.9 }}
                className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/20 transition-colors hover:bg-white/30"
                aria-label="Capture"
              >
                <div className="h-12 w-12 rounded-full bg-white" />
              </motion.button>

              <div className="w-[68px]" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-8 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-red-500/90 px-4 py-2 text-sm text-white backdrop-blur"
            onAnimationComplete={() => setTimeout(() => setError(null), 3000)}
          >
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
