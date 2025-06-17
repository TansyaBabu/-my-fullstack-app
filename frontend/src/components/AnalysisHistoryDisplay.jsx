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
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <div className="px-4 py-6 sm:px-0">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Analysis History</h2>
                        
                        {isLoading ? (
                            <div className="flex justify-center items-center py-8">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                            </div>
                        ) : error ? (
                            <div className="text-red-600 text-center py-4">{error}</div>
                        ) : analysisHistory.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {analysisHistory.map((analysis) => (
                                    <div
                                        key={analysis._id}
                                        className={`p-4 border rounded-lg transition-colors ${
                                            selectedAnalysis?._id === analysis._id
                                                ? 'border-indigo-500 bg-indigo-50'
                                                : 'border-gray-200'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-medium text-gray-900">{analysis.fileName}</h3>
                                            <button
                                                onClick={() => handleDownload(analysis)}
                                                className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                                            >
                                                Download
                                            </button>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm text-gray-600">
                                                Chart Type: <span className="font-medium">{analysis.chartType}</span>
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                Axes: <span className="font-medium">{analysis.xAxis} vs {analysis.yAxis}</span>
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(analysis.analysisDate).toLocaleDateString()}
                                            </p>
                                            {analysis.summary && (
                                                <div className="mt-2 pt-2 border-t border-gray-200">
                                                    <p className="text-sm text-gray-600">
                                                        <span className="font-medium">AI Summary:</span> {analysis.summary}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                No analysis history found. Start by uploading and analyzing a file.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnalysisHistoryDisplay; 