import axios from 'axios';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const UploadExcel = () => {
    const { user } = useSelector((state) => state.user);
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            setSelectedFile(file);
            setUploadMessage('');
        } else {
            setSelectedFile(null);
            setUploadMessage('Please select a valid Excel file (.xlsx or .xls)');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setUploadMessage('Please select a file to upload.');
            return;
        }

        if (!user || !user.token) {
            setUploadMessage('Please log in to upload files.');
            return;
        }

        setIsLoading(true);
        setUploadMessage('');

        const formData = new FormData();
        formData.append('excelFile', selectedFile);

        try {
            const response = await api.post('/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setUploadMessage(`Upload successful: ${response.data.message}`);
            setSelectedFile(null);
            // Reset file input
            document.getElementById('file-upload').value = '';
            
            // Redirect to analyze page with the uploaded file ID
            if (response.data.fileId) {
                navigate(`/dashboard/analyze?fileId=${response.data.fileId}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || error.message;
            setUploadMessage(`Upload failed: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10">
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Upload Excel File</h2>
                                    <p className="text-indigo-100 text-xl font-medium">Upload your Excel file to analyze your data and gain insights.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/30">
                    <div className="space-y-8">
                    {/* File Upload Input */}
                    <div className="flex items-center justify-center w-full">
                            <label 
                                htmlFor="file-upload" 
                                className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-3xl cursor-pointer transition-all duration-500 transform hover:scale-105 ${
                                    selectedFile 
                                        ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-xl' 
                                        : 'border-gray-300 bg-gradient-to-br from-gray-50 to-slate-50 hover:border-indigo-400 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 hover:shadow-xl'
                                }`}
                            >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <div className={`p-6 rounded-3xl mb-6 transition-all duration-500 ${
                                        selectedFile 
                                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-xl' 
                                            : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg'
                                    }`}>
                                    <svg 
                                            className="w-12 h-12 text-white" 
                                        aria-hidden="true" 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        fill="none" 
                                        viewBox="0 0 20 16"
                                    >
                                        <path 
                                            stroke="currentColor" 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth="2" 
                                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L7 9m3-3 3 3"
                                        />
                                </svg>
                                    </div>
                                    <p className="mb-2 text-lg font-semibold text-gray-700">
                                        <span className="font-bold">Click to upload</span> or drag and drop
                                </p>
                                    <p className="text-sm text-gray-500 font-medium">.XLS, .XLSX files only</p>
                            </div>
                            <input
                                id="file-upload"
                                type="file"
                                className="hidden"
                                onChange={handleFileChange}
                                accept=".xls,.xlsx"
                            />
                        </label>
                    </div>

                    {/* Selected File Display */}
                    {selectedFile && (
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border border-green-200 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                                <div className="flex items-center">
                                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mr-4 shadow-lg">
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    </div>
                                    <div>
                                        <span className="text-lg font-bold text-gray-800">{selectedFile.name}</span>
                                        <p className="text-sm text-gray-600 font-medium">Ready to upload</p>
                                    </div>
                                </div>
                                <span className="text-sm font-bold text-gray-700 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                        </div>
                    )}

                    {/* Upload Message */}
                    {uploadMessage && (
                            <div className={`p-6 rounded-3xl border-2 shadow-lg ${
                                uploadMessage.includes('successful') 
                                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200' 
                                    : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-800 border-red-200'
                            }`}>
                                <div className="flex items-center">
                                    {uploadMessage.includes('successful') ? (
                                        <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mr-4 shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                        </div>
                                    ) : (
                                        <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mr-4 shadow-lg">
                                            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        </div>
                                    )}
                                    <span className="text-lg font-semibold">{uploadMessage}</span>
                                </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isLoading}
                            className={`w-full py-4 px-6 rounded-2xl font-bold text-white transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 ${
                                !selectedFile || isLoading
                                    ? 'bg-gray-400 cursor-not-allowed shadow-lg'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/25'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                    <span className="text-lg">Uploading...</span>
                            </div>
                        ) : (
                                <span className="text-lg">Upload and Analyze</span>
                        )}
                    </button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/30 transform hover:scale-105 transition-all duration-500">
                        <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl w-fit mb-6 shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Data Analysis</h3>
                        <p className="text-gray-600 font-medium">Get detailed insights and visualizations from your Excel data</p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/30 transform hover:scale-105 transition-all duration-500">
                        <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl w-fit mb-6 shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">Visual Reports</h3>
                        <p className="text-gray-600 font-medium">Create beautiful charts and graphs from your data</p>
                    </div>

                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/30 transform hover:scale-105 transition-all duration-500">
                        <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl w-fit mb-6 shadow-xl">
                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">AI Insights</h3>
                        <p className="text-gray-600 font-medium">Get AI-powered analysis and recommendations</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadExcel; 