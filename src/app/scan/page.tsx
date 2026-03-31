"use client";

import { useState } from "react";
import CameraScanner from "@/components/CameraScanner";

type CardResult = {
  player_name: string;
  year: number;
  brand: string;
  set_name: string;
  card_number: string;
  sport: string;
  is_rookie: boolean;
  notes: string;
};

type PageState = "camera" | "review" | "processing" | "results" | "error";

export default function ScanPage() {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [pageState, setPageState] = useState<PageState>("camera");
  const [cardResult, setCardResult] = useState<CardResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCapture = (base64Image: string) => {
    setCapturedImage(base64Image);
    setPageState("review");
  };

  const handleAnalyze = async () => {
    if (!capturedImage) return;
    setPageState("processing");

    try {
      // Convert base64 data URL to a File/Blob for FormData
      const res = await fetch(capturedImage);
      const blob = await res.blob();
      const file = new File([blob], "card.jpg", { type: "image/jpeg" });

      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/identify-card", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Failed to identify card");
      }

      const data: CardResult = await response.json();
      setCardResult(data);
      setPageState("results");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Something went wrong.");
      setPageState("error");
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCardResult(null);
    setErrorMsg(null);
    setPageState("camera");
  };

  // --- Camera View ---
  if (pageState === "camera") {
    return (
      <div className="fixed inset-0 z-50 bg-black">
        <CameraScanner onCapture={handleCapture} />
      </div>
    );
  }

  // --- Review / Processing / Error ---
  if (pageState === "review" || pageState === "processing" || pageState === "error") {
    return (
      <div className="min-h-full flex flex-col items-center bg-slate-50 p-4">
        <h2 className="text-xl font-bold text-blue my-4">Review Card</h2>

        {capturedImage && (
          <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border-2 border-slate-200">
            <img src={capturedImage} alt="Captured Card" className="w-full h-auto" />
          </div>
        )}

        {pageState === "processing" && (
          <div className="mt-8 flex flex-col items-center">
            <div className="w-10 h-10 border-4 border-maize border-t-blue rounded-full animate-spin"></div>
            <p className="mt-4 font-semibold text-blue animate-pulse">Analyzing with AI...</p>
          </div>
        )}

        {pageState === "error" && (
          <div className="mt-4 w-full max-w-sm p-4 bg-red-50 border border-red-300 rounded-xl text-red-700 text-sm text-center">
            {errorMsg}
          </div>
        )}

        {(pageState === "review" || pageState === "error") && (
          <div className="mt-8 w-full max-w-sm space-y-3">
            <button
              onClick={handleAnalyze}
              className="w-full py-3 bg-blue text-white font-bold rounded-xl shadow-md hover:bg-blue-light transition-colors"
            >
              {pageState === "error" ? "Try Again" : "Looks Good, View AI Results"}
            </button>
            <button
              onClick={handleRetake}
              className="w-full py-3 bg-white text-slate-700 font-bold border-2 border-slate-200 rounded-xl shadow-sm"
            >
              Retake Photo
            </button>
          </div>
        )}
      </div>
    );
  }

  // --- Results View ---
  if (pageState === "results" && cardResult) {
    return (
      <div className="min-h-full flex flex-col items-center bg-slate-50 p-4 pb-16">
        <h2 className="text-xl font-bold text-blue my-4">Card Identified!</h2>

        {capturedImage && (
          <div className="w-full max-w-sm rounded-xl overflow-hidden shadow-lg border-2 border-slate-200 mb-6">
            <img src={capturedImage} alt="Captured Card" className="w-full h-auto" />
          </div>
        )}

        <div className="w-full max-w-sm bg-white rounded-xl shadow-md border border-slate-200 divide-y divide-slate-100">
          <div className="p-4 flex items-center justify-between">
            <span className="text-slate-500 text-sm">Player</span>
            <span className="font-bold text-blue text-right">{cardResult.player_name}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-slate-500 text-sm">Year</span>
            <span className="font-semibold text-slate-800">{cardResult.year}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-slate-500 text-sm">Brand / Set</span>
            <span className="font-semibold text-slate-800 text-right">{cardResult.brand} {cardResult.set_name}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-slate-500 text-sm">Card #</span>
            <span className="font-semibold text-slate-800">{cardResult.card_number}</span>
          </div>
          <div className="p-4 flex items-center justify-between">
            <span className="text-slate-500 text-sm">Sport</span>
            <span className="font-semibold text-slate-800">{cardResult.sport}</span>
          </div>
          {cardResult.is_rookie && (
            <div className="p-4 flex items-center justify-between">
              <span className="text-slate-500 text-sm">Rookie</span>
              <span className="px-2 py-0.5 bg-maize text-blue text-xs font-bold rounded-full">RC</span>
            </div>
          )}
          {cardResult.notes && (
            <div className="p-4">
              <span className="text-slate-500 text-sm block mb-1">Notes</span>
              <span className="text-slate-700 text-sm">{cardResult.notes}</span>
            </div>
          )}
        </div>

        <div className="mt-6 w-full max-w-sm space-y-3">
          <button
            onClick={handleRetake}
            className="w-full py-3 bg-blue text-white font-bold rounded-xl shadow-md hover:bg-blue-light transition-colors"
          >
            Scan Another Card
          </button>
        </div>
      </div>
    );
  }

  return null;
}
