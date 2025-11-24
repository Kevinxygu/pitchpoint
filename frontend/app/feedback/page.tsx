"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import FeedbackHeader from '@/components/feedback/FeedbackHeader';
import OverallScore from '@/components/feedback/OverallScore';
import CategoryBreakdown from '@/components/feedback/CategoryBreakdown';
import KeyMoments from '@/components/feedback/KeyMoments';
import TalkRatio from '@/components/feedback/TalkRatio';
import ActionItems from '@/components/feedback/ActionItems';
import LoadingSpinner from '@/components/FeedbackLoadingSpinner';

interface CategoryFeedback {
    name: string;
    score: number;
    evidence: string;
    strengths: string[];
    improvements: string[];
}

interface OverallFeedback {
    weighted_score: number;
    grade: string;
    summary: string;
    top_3_strengths: string[];
    top_3_priorities: string[];
}

interface TalkRatioData {
    rep_percentage: number;
    prospect_percentage: number;
    analysis: string;
}

interface KeyMoment {
    timestamp: string;
    moment: string;
    impact: string;
}

interface FeedbackData {
    categories: CategoryFeedback[];
    overall: OverallFeedback;
    talk_ratio: TalkRatioData;
    key_moments: KeyMoment[];
}

export default function FeedbackPage() {
    return (
        <React.Suspense fallback={<LoadingSpinner />}>
            <FeedbackContent />
        </React.Suspense>
    );
}

function FeedbackContent() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get('session');

    const [feedback, setFeedback] = useState<FeedbackData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [transcript, setTranscript] = useState<string>('');

    useEffect(() => {
        const fetchFeedback = async () => {
            try {
                // Get transcript from sessionStorage (set during the call)
                const storedTranscript = sessionStorage.getItem('callTranscript');

                if (!storedTranscript) {
                    throw new Error('No call transcript found. Please complete a practice call first.');
                }

                setTranscript(storedTranscript);

                // Call backend to generate feedback
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080'
                const response = await fetch(`${backendUrl}/api/feedback/generate`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        transcript: storedTranscript,
                        session_id: sessionId || 'default',
                    }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to generate feedback');
                }

                const data = await response.json();
                setFeedback(data.feedback);
                setLoading(false);

            } catch (err) {
                console.error('Error fetching feedback:', err);
                setError(err instanceof Error ? err.message : 'An unexpected error occurred');
                setLoading(false);
            }
        };

        fetchFeedback();
    }, [sessionId]);

    if (loading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#0F001E] flex items-center justify-center p-4">
                <div className="bg-[#0F001E] border-2 border-[#DE0037] rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="text-[#DE0037] text-xl font-bold mb-4">⚠️ Error</div>
                    <p className="text-[#FFFFFF] mb-6">{error}</p>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full bg-[#DE0037] text-[#FFFFFF] py-2 px-4 rounded-lg hover:bg-[#DE0037]/90 transition"
                    >
                        Return to Home
                    </button>
                </div>
            </div>
        );
    }

    if (!feedback) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0F001E]">
            {/* Header */}
            <FeedbackHeader sessionId={sessionId} />

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">

                {/* Overall Score Section */}
                <OverallScore overall={feedback.overall} />

                {/* Talk Ratio */}
                <TalkRatio talkRatio={feedback.talk_ratio} />

                {/* Category Breakdown */}
                <CategoryBreakdown categories={feedback.categories} />

                {/* Key Moments */}
                {feedback.key_moments && feedback.key_moments.length > 0 && (
                    <KeyMoments moments={feedback.key_moments} />
                )}

                {/* Action Items */}
                <ActionItems
                    priorities={feedback.overall.top_3_priorities}
                    strengths={feedback.overall.top_3_strengths}
                />

                {/* Transcript View (collapsible) */}
                <div className="bg-[#0F001E] border-2 border-[#DE0037] rounded-lg shadow-lg p-6">
                    <details>
                        <summary className="text-lg font-semibold text-[#FFFFFF] cursor-pointer hover:text-[#DE0037] transition">
                            Call Transcript:
                        </summary>
                        <div className="mt-4 p-4 bg-[#0F001E] border border-[#FFFFFF]/20 rounded-lg max-h-96 overflow-y-auto">
                            <pre className="text-sm text-[#FFFFFF] whitespace-pre-wrap font-mono">
                                {transcript}
                            </pre>
                        </div>
                    </details>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center pb-8">
                    <button
                        onClick={() => window.location.href = '/'}
                        className="px-6 py-3 bg-[#0F001E] border-2 border-[#DE0037] text-[#FFFFFF] rounded-lg hover:bg-[#DE0037]/10 transition font-medium"
                    >
                        Practice Again
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-[#DE0037] text-[#FFFFFF] rounded-lg hover:bg-[#DE0037]/90 transition font-medium"
                    >
                        📄 Export Report
                    </button>
                </div>
            </main>
        </div>
    );
}