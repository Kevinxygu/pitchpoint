"use client";

import React from 'react';

interface TalkRatioData {
  rep_percentage: number;
  prospect_percentage: number;
  analysis: string;
}

interface TalkRatioProps {
  talkRatio: TalkRatioData;
}

export default function TalkRatio({ talkRatio }: TalkRatioProps) {
  const isOptimal = talkRatio.rep_percentage >= 40 && talkRatio.rep_percentage <= 60;
  const talkingTooMuch = talkRatio.rep_percentage > 60;

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        🗣️ Talk Ratio Analysis
      </h2>
      <p className="text-gray-600 mb-6">
        The balance between your speaking time and listening time
      </p>

      {/* Visual Bar */}
      <div className="mb-6">
        <div className="flex h-16 rounded-lg overflow-hidden border-2 border-gray-300">
          <div
            className={`flex items-center justify-center font-bold text-white transition-all duration-1000 ${
              talkingTooMuch ? 'bg-orange-500' : 'bg-blue-500'
            }`}
            style={{ width: `${talkRatio.rep_percentage}%` }}
          >
            {talkRatio.rep_percentage >= 15 && (
              <span>You: {talkRatio.rep_percentage}%</span>
            )}
          </div>
          <div
            className="flex items-center justify-center font-bold text-white bg-green-500 transition-all duration-1000"
            style={{ width: `${talkRatio.prospect_percentage}%` }}
          >
            {talkRatio.prospect_percentage >= 15 && (
              <span>Prospect: {talkRatio.prospect_percentage}%</span>
            )}
          </div>
        </div>

        {/* Labels for small percentages */}
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          {talkRatio.rep_percentage < 15 && (
            <span>You: {talkRatio.rep_percentage}%</span>
          )}
          {talkRatio.prospect_percentage < 15 && (
            <span>Prospect: {talkRatio.prospect_percentage}%</span>
          )}
        </div>
      </div>

      {/* Status Badge */}
      <div className="mb-4">
        {isOptimal ? (
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full border-2 border-green-500">
            <span className="text-xl">✅</span>
            <span className="font-semibold">Optimal Balance</span>
          </div>
        ) : talkingTooMuch ? (
          <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full border-2 border-orange-500">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold">Talking Too Much</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full border-2 border-blue-500">
            <span className="text-xl">📊</span>
            <span className="font-semibold">Room for More Discovery</span>
          </div>
        )}
      </div>

      {/* Analysis */}
      <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
        <p className="text-gray-700">{talkRatio.analysis}</p>
      </div>

      {/* Best Practice Reference */}
      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Best Practice</h3>
        <p className="text-blue-800 text-sm">
          In consultative partnership sales, aim for <strong>40-60% rep speaking time</strong>. 
          The prospect should talk more about their needs, objectives, and challenges. 
          Your job is to ask strategic questions and listen actively.
        </p>
      </div>
    </div>
  );
}
