"use client";

import React from 'react';

interface OverallFeedback {
  weighted_score: number;
  grade: string;
  summary: string;
  top_3_strengths: string[];
  top_3_priorities: string[];
}

interface OverallScoreProps {
  overall: OverallFeedback;
}

export default function OverallScore({ overall }: OverallScoreProps) {
  // Determine color based on score
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 border-green-500';
    if (score >= 80) return 'bg-blue-100 border-blue-500';
    if (score >= 70) return 'bg-yellow-100 border-yellow-500';
    if (score >= 60) return 'bg-orange-100 border-orange-500';
    return 'bg-red-100 border-red-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Overall Performance</h2>
        <div className={`px-6 py-3 rounded-lg border-2 ${getGradeBgColor(overall.weighted_score)}`}>
          <p className={`text-3xl font-bold ${getScoreColor(overall.weighted_score)}`}>
            {overall.grade}
          </p>
        </div>
      </div>

      {/* Score Circle/Progress */}
      <div className="flex items-center gap-8 mb-6">
        <div className="relative w-32 h-32">
          <svg className="w-32 h-32 transform -rotate-90">
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              className="text-gray-200"
            />
            <circle
              cx="64"
              cy="64"
              r="56"
              stroke="currentColor"
              strokeWidth="8"
              fill="transparent"
              strokeDasharray={`${2 * Math.PI * 56}`}
              strokeDashoffset={`${2 * Math.PI * 56 * (1 - overall.weighted_score / 100)}`}
              className={getProgressColor(overall.weighted_score).replace('bg-', 'text-')}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={`text-3xl font-bold ${getScoreColor(overall.weighted_score)}`}>
              {overall.weighted_score}
            </span>
          </div>
        </div>

        <div className="flex-1">
          <p className="text-gray-700 text-lg leading-relaxed">
            {overall.summary}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
        <div
          className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor(overall.weighted_score)}`}
          style={{ width: `${overall.weighted_score}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-500">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>
    </div>
  );
}
