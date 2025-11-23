"use client";

import React from 'react';

interface ActionItemsProps {
  priorities: string[];
  strengths: string[];
}

export default function ActionItems({ priorities, strengths }: ActionItemsProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        📋 Action Plan
      </h2>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Top Priorities */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border-2 border-orange-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🎯</span>
            <h3 className="text-xl font-bold text-gray-800">
              Top 3 Priorities
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Focus on these improvements in your next practice call
          </p>
          <ul className="space-y-3">
            {priorities.map((priority, index) => (
              <li
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-orange-500"
              >
                <div className="flex items-start gap-3">
                  <span className="font-bold text-orange-600 text-lg mt-0.5">
                    {index + 1}.
                  </span>
                  <span className="text-gray-800">{priority}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Top Strengths */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-6 border-2 border-green-300">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⭐</span>
            <h3 className="text-xl font-bold text-gray-800">
              Top 3 Strengths
            </h3>
          </div>
          <p className="text-gray-600 text-sm mb-4">
            Keep doing these things - they're working well
          </p>
          <ul className="space-y-3">
            {strengths.map((strength, index) => (
              <li
                key={index}
                className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-green-500"
              >
                <div className="flex items-start gap-3">
                  <span className="text-green-600 text-xl">✓</span>
                  <span className="text-gray-800">{strength}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="mt-6 bg-blue-50 border-2 border-blue-300 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
          <span className="text-xl">🚀</span>
          Recommended Next Steps
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg">
            <div className="text-3xl mb-2">1️⃣</div>
            <h4 className="font-semibold text-gray-800 mb-1">Review & Reflect</h4>
            <p className="text-sm text-gray-600">
              Read through each category's feedback and identify specific moments to improve
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-3xl mb-2">2️⃣</div>
            <h4 className="font-semibold text-gray-800 mb-1">Practice Again</h4>
            <p className="text-sm text-gray-600">
              Take another call focusing on your top 3 priorities
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg">
            <div className="text-3xl mb-2">3️⃣</div>
            <h4 className="font-semibold text-gray-800 mb-1">Track Progress</h4>
            <p className="text-sm text-gray-600">
              Compare your scores over time to see improvement in each area
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
