"use client";

import React from 'react';

interface ActionItemsProps {
  priorities: string[];
  strengths: string[];
}

export default function ActionItems({ priorities, strengths }: ActionItemsProps) {
  return (
    <div className="bg-[#0F001E] border-1 border-[#DE0037] rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-[#FFFFFF] mb-6">
        📋 Action Plan
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Priorities */}
        <div className="bg-[#0F001E] border-2 border-[#DE0037] rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-bold text-[#FFFFFF]">
              Top 3 Priorities
            </h3>
          </div>
          <p className="text-[#FFFFFF]/60 text-sm mb-4">
            Focus on these improvements in your next practice call
          </p>
          <ul className="space-y-3">
            {priorities.map((priority, index) => (
              <li
                key={index}
                className="bg-[#0F001E] border border-[#DE0037] p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-[#DE0037] text-lg mt-0.5">
                    {index + 1}.
                  </span>
                  <span className="text-[#FFFFFF]">{priority}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Strengths */}
        <div className="bg-[#0F001E] border-2 border-green-500 rounded-lg p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <h3 className="text-xl font-bold text-[#FFFFFF]">
              Top 3 Strengths
            </h3>
          </div>
          <p className="text-[#FFFFFF]/60 text-sm mb-4">
            Keep doing these things - they're working well
          </p>
          <ul className="space-y-3">
            {strengths.map((strength, index) => (
              <li
                key={index}
                className="bg-[#0F001E] border border-green-500 p-4 rounded-lg shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <span className="text-green-500 text-xl">✓</span>
                  <span className="text-[#FFFFFF]">{strength}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6 bg-[#0F001E] border-2 border-[#FFFFFF]/20 rounded-lg p-6">
        <h3 className="font-bold text-[#FFFFFF] mb-3 flex items-center gap-2">
          <span className="text-xl">🚀</span>
          Recommended Next Steps
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-[#0F001E] border border-[#FFFFFF]/20 p-4 rounded-lg">
            <div className="text-3xl mb-2">1️⃣</div>
            <h4 className="font-semibold text-[#FFFFFF] mb-1">Review & Reflect</h4>
            <p className="text-sm text-[#FFFFFF]/60">
              Read through each category's feedback and identify specific moments to improve
            </p>
          </div>
          <div className="bg-[#0F001E] border border-[#FFFFFF]/20 p-4 rounded-lg">
            <div className="text-3xl mb-2">2️⃣</div>
            <h4 className="font-semibold text-[#FFFFFF] mb-1">Practice Again</h4>
            <p className="text-sm text-[#FFFFFF]/60">
              Take another call focusing on your top 3 priorities
            </p>
          </div>
          <div className="bg-[#0F001E] border border-[#FFFFFF]/20 p-4 rounded-lg">
            <div className="text-3xl mb-2">3️⃣</div>
            <h4 className="font-semibold text-[#FFFFFF] mb-1">Track Progress</h4>
            <p className="text-sm text-[#FFFFFF]/60">
              Compare your scores over time to see improvement in each area
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
