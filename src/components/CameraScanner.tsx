"use client";

import { useEffect, useRef, useState } from "react";
import { Camera, RefreshCw, X } from "lucide-react";

export default function CameraScanner({ onCapture }: { onCapture: (base64Image: string) => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Use a ref so stopCamera() always sees the current stream, even in cleanup closures
  const streamRef = useRef<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCamera = async () => {
    stopCamera();
    setError(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1080 } },
        audio: false,
      });
      streamRef.current = newStream;
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Camera access denied or error", err);
      setError("Please allow camera access to scan cards.");
    }
  };

  useEffect(() => {
    let cancelled = false;

    const start = async () => {
      // Stop any existing stream first
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
      setError(null);
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode, width: { ideal: 1080 } },
          audio: false,
        });
        if (cancelled) {
          // Effect was cleaned up while we were waiting — kill it immediately
          newStream.getTracks().forEach(t => t.stop());
          return;
        }
        streamRef.current = newStream;
        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Camera access denied or error", err);
          setError("Please allow camera access to scan cards.");
        }
      }
    };

    start();

    return () => {
      cancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
      }
    };
  }, [facingMode]);

  const toggleCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const base64Image = canvas.toDataURL("image/jpeg", 0.8);
        // Stop the camera before handing off the image
        stopCamera();
        onCapture(base64Image);
      }
    }
  };

  return (
    <div className="relative w-full h-full bg-black flex flex-col justify-center items-center overflow-hidden">
      {error ? (
        <div className="text-white text-center p-6 bg-red-500/20 rounded-xl border border-red-500">
          <p>{error}</p>
          <button onClick={startCamera} className="mt-4 px-4 py-2 bg-maize text-blue font-bold rounded-lg shrink-0">
            Retry Camera
          </button>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          />
          <canvas ref={canvasRef} className="hidden" />

          {/* Viewfinder overlay */}
          <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-sm aspect-[2.5/3.5] border-2 border-maize/80 rounded-xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
               <div className="absolute top-4 left-0 w-full text-center text-maize text-sm font-bold tracking-widest drop-shadow-md">
                 ALIGN CARD HERE
               </div>
               {/* Corner brackets */}
               <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-maize rounded-tl-xl"></div>
               <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-maize rounded-tr-xl"></div>
               <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-maize rounded-bl-xl"></div>
               <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-maize rounded-br-xl"></div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 w-full px-8 flex justify-between items-center z-10">
             <button onClick={() => window.history.back()} className="p-4 rounded-full bg-slate-800/80 text-white backdrop-blur-sm active:scale-95 transition-transform">
               <X size={24} />
             </button>

             <button onClick={handleCapture} className="w-20 h-20 bg-white/30 backdrop-blur-sm rounded-full p-2 active:scale-95 transition-transform">
               <div className="w-full h-full bg-white rounded-full flex items-center justify-center shadow-lg border-4 border-maize">
                 <Camera className="text-blue" size={28} />
               </div>
             </button>

             <button onClick={toggleCamera} className="p-4 rounded-full bg-slate-800/80 text-white backdrop-blur-sm active:scale-95 transition-transform">
               <RefreshCw size={24} />
             </button>
          </div>
        </>
      )}
    </div>
  );
}
