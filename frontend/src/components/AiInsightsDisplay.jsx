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
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [error, setError] = useState(null);

    const fetchUploadedFiles = async () => {
        try {
            const response = await api.get('/upload/history', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setUploadedFiles(response.data);
        } catch (error) {
            console.error('Failed to fetch uploaded files:', error);
            setError('Failed to load uploaded files. Please try again.');
        }
    };

    const handleSelectFile = (file) => {
        setSelectedFile(file);
    };

    const handleGenerateSummary = async () => {
        if (!selectedFile) {
            setError('Please select a file to generate a summary.');
            return;
        }
        setIsGeneratingSummary(true);
        setError(null);
        
        console.log('Selected file:', selectedFile);
        console.log('FileId being used:', selectedFile.id);
        
        try {
            const response = await api.post(`/analysis/summarize/${selectedFile.id}`, {},
                {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                }
            );
            const updatedFile = { ...selectedFile, summary: response.data.summary };
            setSelectedFile(updatedFile);
            setUploadedFiles(prevFiles => 
                prevFiles.map(item => 
                    item.id === selectedFile.id ? updatedFile : item
                )
            );
        } catch (error) {
            console.error('AI Summary generation error:', error);
            const errorMessage = error.response?.data?.message || 'Failed to generate AI summary. Please try again.';
            setError(errorMessage);
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    useEffect(() => {
        if (user && user.token) {
            fetchUploadedFiles();
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/30">
                    <div className="p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative">
                                    <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">AI Insights & Summaries</h2>
                                    <p className="text-indigo-100 text-xl font-medium">Get intelligent insights from your data analyses</p>
                    </div>
                </div>

                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/30">
                    <div className="mb-10">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">Select a File for AI Insights</h3>
                            {uploadedFiles.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {uploadedFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className={`p-6 bg-white/80 rounded-3xl shadow-xl border-2 transition-all duration-300 cursor-pointer ${selectedFile?.id === file.id ? 'border-indigo-500 scale-105' : 'border-gray-200 hover:border-indigo-300'}`}
                                            onClick={() => handleSelectFile(file)}
                                        >
                                        <h4 className="font-bold text-gray-900 mb-2 truncate">{file.fileName}</h4>
                                        <p className="text-sm text-gray-500 font-medium">Uploaded: {new Date(file.uploadDate).toLocaleDateString()}</p>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                            <p className="text-gray-600">No files found. Upload a file to get started.</p>
                        )}
                    </div>

                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100 shadow-lg">
                        <h3 className="text-2xl font-bold text-purple-900 mb-6">AI Summary</h3>
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 min-h-[250px] border border-purple-200">
                            {isGeneratingSummary ? (
                                <p className="text-purple-700">Generating AI Summary...</p>
                            ) : error ? (
                                <p className="text-red-600">{error}</p>
                            ) : selectedFile?.summary ? (
                                <p className="text-green-800 leading-relaxed">{selectedFile.summary}</p>
                            ) : (
                                <p className="text-purple-700">Select a file to view or generate a summary.</p>
                            )}
                        </div>
                        <button
                            onClick={handleGenerateSummary}
                            disabled={!selectedFile || isGeneratingSummary}
                            className={`mt-6 w-full py-3 rounded-2xl font-bold text-lg transition-all duration-300 ${!selectedFile || isGeneratingSummary ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:scale-105'}`}
                        >
                            {isGeneratingSummary ? 'Generating...' : 'Generate AI Summary'}
                            </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AiInsightsDisplay; 