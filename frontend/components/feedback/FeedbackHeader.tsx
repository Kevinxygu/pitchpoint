"use client";

import React from 'react';

interface FeedbackHeaderProps {
  sessionId: string | null;
}

export default function FeedbackHeader({ sessionId }: FeedbackHeaderProps) {
  return (
    <header className="background-palette-background-black text-white py-8 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              PitchPoint Feedback Report
            </h1>
            <p className="text-[#FFFFFF]/80">
              Sports Partnership Sales Performance Analysis
            </p>
          </div>
          {sessionId && (
            <div className="bg-[#0F001E] border border-[#FFFFFF]/20 px-4 py-2 rounded-lg">
              <p className="text-xs text-[#FFFFFF]/60">Session ID</p>
              <p className="font-mono text-sm text-[#FFFFFF]">{sessionId}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
