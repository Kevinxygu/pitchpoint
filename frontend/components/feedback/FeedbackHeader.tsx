"use client";

import React from 'react';

interface FeedbackHeaderProps {
  sessionId: string | null;
}

export default function FeedbackHeader({ sessionId }: FeedbackHeaderProps) {
  return (
    <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-8 shadow-lg">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              📊 Call Feedback Report
            </h1>
            <p className="text-blue-100">
              Sports Partnership Sales Performance Analysis
            </p>
          </div>
          {sessionId && (
            <div className="bg-blue-700 bg-opacity-50 px-4 py-2 rounded-lg">
              <p className="text-xs text-blue-200">Session ID</p>
              <p className="font-mono text-sm">{sessionId}</p>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
