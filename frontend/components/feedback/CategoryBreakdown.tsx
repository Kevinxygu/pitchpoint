"use client";

import React, { useState } from 'react';

interface CategoryFeedback {
  name: string;
  score: number;
  evidence: string;
  strengths: string[];
  improvements: string[];
}

interface CategoryBreakdownProps {
  categories: CategoryFeedback[];
}

export default function CategoryBreakdown({ categories }: CategoryBreakdownProps) {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-50 border-green-500';
    if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-500';
    if (score >= 70) return 'text-yellow-600 bg-yellow-50 border-yellow-500';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-500';
    return 'text-red-600 bg-red-50 border-red-500';
  };

  const getBarColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 80) return 'bg-blue-500';
    if (score >= 70) return 'bg-yellow-500';
    if (score >= 60) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-palette-background-black border-1 border-[#DE0037] rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-[#FFFFFF] mb-6">
        Category Breakdown
      </h2>

      <div className="space-y-4">
        {categories.map((category, index) => (
          <div
            key={index}
            className="border-2 border-[#FFFFFF]/20 rounded-lg overflow-hidden hover:border-[#DE0037] transition"
          >
            {/* Category Header (Always Visible) */}
            <button
              onClick={() => setExpandedCategory(expandedCategory === index ? null : index)}
              className="w-full p-4 flex items-center justify-between hover:bg-[#FFFFFF]/5 transition"
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`px-4 py-2 rounded-lg border-2 font-bold bg-palette-background-black`}>
                  {category.score}
                </div>
                <div className="text-left flex-1">
                  <h3 className="font-semibold text-[#FFFFFF] text-lg">
                    {category.name}
                  </h3>
                  <div className="w-full bg-[#FFFFFF]/20 rounded-full h-2 mt-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${getBarColor(category.score)}`}
                      style={{ width: `${category.score}%` }}
                    />
                  </div>
                </div>
              </div>
              <svg
                className={`w-6 h-6 text-[#FFFFFF]/60 transition-transform ${expandedCategory === index ? 'rotate-180' : ''
                  }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Expanded Details */}
            {expandedCategory === index && (
              <div className="p-6 bg-[#0F001E] border-t-2 border-[#FFFFFF]/20 space-y-6">
                {/* Evidence */}
                <div>
                  <h4 className="font-semibold text-[#FFFFFF] mb-2 flex items-center gap-2">
                    <span className="text-blue-400">🔍</span>
                    Evidence from Call
                  </h4>
                  <p className="text-[#FFFFFF]/80 italic bg-[#0F001E] border border-blue-400 p-4 rounded-lg">
                    {category.evidence}
                  </p>
                </div>

                {/* Strengths */}
                {category.strengths && category.strengths.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#FFFFFF] mb-3 flex items-center gap-2">
                      <span className="text-green-400">✅</span>
                      What You Did Well
                    </h4>
                    <ul className="space-y-2">
                      {category.strengths.map((strength, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-[#0F001E] border border-green-400 p-3 rounded-lg">
                          <span className="text-green-400 font-bold mt-1">+</span>
                          <span className="text-[#FFFFFF]/80">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Improvements */}
                {category.improvements && category.improvements.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-[#FFFFFF] mb-3 flex items-center gap-2">
                      <span className="text-orange-400">💡</span>
                      Areas to Improve
                    </h4>
                    <ul className="space-y-2">
                      {category.improvements.map((improvement, idx) => (
                        <li key={idx} className="flex items-start gap-3 bg-[#0F001E] border border-orange-400 p-3 rounded-lg">
                          <span className="text-orange-400 font-bold mt-1">→</span>
                          <span className="text-[#FFFFFF]/80">{improvement}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
