import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const AiInsightsDisplay = () => {
    const { user } = useSelector((state) => state.user);
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [error, setError] = useState(null);

    const fetchAnalysisHistory = async () => {
        try {
            const response = await api.get('/analysis/history', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setAnalysisHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch analysis history:', error);
            setError('Failed to load analysis history. Please try again.');
        }
    };

    const handleSelectAnalysis = (analysis) => {
        setSelectedAnalysis(analysis);
    };

    const handleGenerateSummary = async () => {
        if (!selectedAnalysis) {
            setError('Please select an analysis to generate a summary.');
            return;
        }
        setIsGeneratingSummary(true);
        setError(null);
        try {
            const response = await api.post(`/analysis/summarize/${selectedAnalysis.fileId}`, {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            setSelectedAnalysis(prev => ({ ...prev, summary: response.data.summary }));
            setAnalysisHistory(prevHistory => 
                prevHistory.map(item => 
                    item.fileId === selectedAnalysis.fileId ? { ...item, summary: response.data.summary } : item
                )
            );
        } catch (error) {
            console.error('AI Summary generation error:', error);
            setError('Failed to generate AI summary. Please try again.');
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    useEffect(() => {
        if (user && user.token) {
            fetchAnalysisHistory();
        }
    }, [user]);

    return (
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Insights & Summaries</h2>
                        
                        {/* Analysis History */}
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Analysis</h3>
                            {analysisHistory.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {analysisHistory.map((analysis) => (
                                        <div
                                            key={analysis._id}
                                            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                                                selectedAnalysis?._id === analysis._id
                                                    ? 'border-indigo-500 bg-indigo-50'
                                                    : 'border-gray-200 hover:border-indigo-300'
                                            }`}
                                            onClick={() => handleSelectAnalysis(analysis)}
                                        >
                                            <h4 className="font-medium text-gray-900">{analysis.fileName}</h4>
                                            <p className="text-sm text-gray-500">
                                                {analysis.chartType} Chart ({analysis.xAxis} vs {analysis.yAxis})
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(analysis.analysisDate).toLocaleDateString()}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-500">No analysis history found.</p>
                            )}
                        </div>

                        {/* AI Summary Display */}
                        <div className="mt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Summary</h3>
                            <div className="bg-gray-50 rounded-lg p-4 min-h-[200px]">
                                {isGeneratingSummary ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                                        <p className="mt-2 text-gray-600">Generating AI summary...</p>
                                    </div>
                                ) : error ? (
                                    <div className="text-red-600">{error}</div>
                                ) : selectedAnalysis?.summary ? (
                                    <div className="prose max-w-none">
                                        <p className="text-gray-700">{selectedAnalysis.summary}</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <p>Select an analysis to view or generate AI insights.</p>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={handleGenerateSummary}
                                disabled={!selectedAnalysis || isGeneratingSummary}
                                className={`mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded ${
                                    (!selectedAnalysis || isGeneratingSummary) ? 'opacity-50 cursor-not-allowed' : ''
                                }`}
                            >
                                {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiInsightsDisplay; 