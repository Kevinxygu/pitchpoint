"use client";

import React from 'react';

interface KeyMoment {
  timestamp: string;
  moment: string;
  impact: string;
}

interface KeyMomentsProps {
  moments: KeyMoment[];
}

export default function KeyMoments({ moments }: KeyMomentsProps) {
  // Determine if moment was positive or negative based on impact text
  const getMomentType = (impact: string) => {
    const lowerImpact = impact.toLowerCase();
    if (lowerImpact.includes('strong') || lowerImpact.includes('excellent') || 
        lowerImpact.includes('positive') || lowerImpact.includes('good')) {
      return 'positive';
    }
    if (lowerImpact.includes('missed') || lowerImpact.includes('weak') || 
        lowerImpact.includes('negative') || lowerImpact.includes('opportunity')) {
      return 'negative';
    }
    return 'neutral';
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'positive':
        return {
          border: 'border-green-500',
          bg: 'bg-green-50',
          icon: '✨',
          iconColor: 'text-green-600'
        };
      case 'negative':
        return {
          border: 'border-orange-500',
          bg: 'bg-orange-50',
          icon: '⚠️',
          iconColor: 'text-orange-600'
        };
      default:
        return {
          border: 'border-blue-500',
          bg: 'bg-blue-50',
          icon: '💬',
          iconColor: 'text-blue-600'
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">
        🎯 Key Moments
      </h2>
      <p className="text-gray-600 mb-6">
        Critical turning points that significantly impacted the call's outcome
      </p>

      <div className="space-y-4">
        {moments.map((moment, index) => {
          const type = getMomentType(moment.impact);
          const styles = getTypeStyles(type);

          return (
            <div
              key={index}
              className={`${styles.bg} border-l-4 ${styles.border} rounded-lg p-5 hover:shadow-md transition`}
            >
              <div className="flex items-start gap-4">
                <div className={`text-2xl ${styles.iconColor}`}>
                  {styles.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-semibold text-gray-500 bg-white px-3 py-1 rounded-full">
                      {moment.timestamp}
                    </span>
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">
                    {moment.moment}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    <span className="font-medium">Impact:</span> {moment.impact}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
