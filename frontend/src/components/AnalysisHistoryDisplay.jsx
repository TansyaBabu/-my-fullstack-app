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

const AnalysisHistoryDisplay = () => {
    const { user } = useSelector((state) => state.user);
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchAnalysisHistory = async () => {
        setIsLoading(true);
        setError(null);
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
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (analysis) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/analysis/download/${analysis.fileId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analysis_${analysis.fileId}.json`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download error:', error);
            setError('Failed to download analysis data. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user && user.token) {
            fetchAnalysisHistory();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Header Section */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/30 transform hover:scale-[1.02] transition-all duration-500">
                    <div className="p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
                        <div className="relative z-10">
                            <div className="flex items-center mb-6">
                                <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mr-8 backdrop-blur-sm shadow-2xl">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Analysis History</h2>
                                    <p className="text-indigo-100 text-xl font-medium">Review and manage your past data analyses</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/30">
                        {isLoading ? (
                        <div className="flex justify-center items-center py-16">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
                                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="ml-6">
                                <p className="text-lg font-semibold text-gray-700">Loading your analysis history...</p>
                                <p className="text-gray-500">Please wait while we fetch your data</p>
                            </div>
                            </div>
                        ) : error ? (
                        <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 p-8 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mr-4 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-red-800 mb-1">Error Loading History</h4>
                                    <p className="text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                        ) : analysisHistory.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {analysisHistory.map((analysis) => (
                                    <div
                                        key={analysis._id}
                                    className={`bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl border-2 transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                                            selectedAnalysis?._id === analysis._id
                                            ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-2xl shadow-indigo-500/25'
                                            : 'border-gray-200 hover:border-indigo-300'
                                        }`}
                                    >
                                    <div className="p-8">
                                        {/* Header */}
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center flex-1 min-w-0">
                                                <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-4 shadow-lg flex-shrink-0">
                                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1 truncate">{analysis.fileName}</h3>
                                                    <p className="text-sm text-gray-500 font-medium">
                                                        {new Date(analysis.analysisDate).toLocaleDateString('en-US', {
                                                            year: 'numeric',
                                                            month: 'long',
                                                            day: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleDownload(analysis)}
                                                className="px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center flex-shrink-0 ml-4"
                                            >
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download
                                            </button>
                                        </div>

                                        {/* Analysis Details */}
                                        <div className="space-y-4">
                                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-2xl border border-blue-100">
                                                <div className="flex items-center mb-2">
                                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-3 shadow-lg">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-semibold text-blue-900">Chart Type</span>
                                                </div>
                                                <p className="text-blue-800 font-bold text-lg">{analysis.chartType}</p>
                                            </div>

                                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-2xl border border-green-100">
                                                <div className="flex items-center mb-2">
                                                    <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl mr-3 shadow-lg">
                                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                        </svg>
                                                    </div>
                                                    <span className="font-semibold text-green-900">Data Axes</span>
                                                </div>
                                                <p className="text-green-800 font-bold text-lg">{analysis.xAxis} vs {analysis.yAxis}</p>
                                            </div>

                                            {analysis.summary && (
                                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-2xl border border-purple-100">
                                                    <div className="flex items-center mb-2">
                                                        <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-3 shadow-lg">
                                                            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                                            </svg>
                                                        </div>
                                                        <span className="font-semibold text-purple-900">AI Summary</span>
                                                    </div>
                                                    <p className="text-purple-800 font-medium">{analysis.summary}</p>
                                                </div>
                                            )}
                                        </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                        <div className="text-center py-16">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 border border-gray-200 shadow-xl">
                                <div className="w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                                    <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                    </svg>
                                </div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Analysis History Found</h3>
                                <p className="text-gray-600 text-lg mb-6">Start by uploading and analyzing a file to see your history here.</p>
                                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-2xl border border-indigo-100">
                                    <p className="text-indigo-800 font-medium">💡 Tip: Upload an Excel file and create your first analysis to get started!</p>
                                </div>
                            </div>
                            </div>
                        )}
                </div>
            </div>
        </div>
    );
};

export default AnalysisHistoryDisplay; 