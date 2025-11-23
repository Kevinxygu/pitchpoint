"use client";

import React from 'react';

export default function LoadingSpinner() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-4"></div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">
                    Analyzing Your Call...
                </h2>

                <p className="text-gray-600 mb-6">
                    Our AI coach is evaluating your performance
                </p>

                <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-sm text-gray-700">Reviewing transcript...</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                            <span className="text-sm text-gray-700">Evaluating against rubric...</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            <span className="text-sm text-gray-700">Generating recommendations...</span>
                        </div>
                    </div>
                </div>

                <p className="text-gray-500 text-sm mt-6">
                    This usually takes 10-15 seconds
                </p>
            </div>
        </div>
    );
}