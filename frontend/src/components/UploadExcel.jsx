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
                navigate(`/analyze?fileId=${response.data.fileId}`);
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
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-3xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-600">
                        <h2 className="text-3xl font-bold text-white mb-2">Upload Excel File</h2>
                        <p className="text-indigo-100">Upload your Excel file to analyze your data and gain insights.</p>
                    </div>
                </div>

                {/* Upload Section */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    <div className="space-y-6">
                    {/* File Upload Input */}
                    <div className="flex items-center justify-center w-full">
                            <label 
                                htmlFor="file-upload" 
                                className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                    selectedFile 
                                        ? 'border-green-500 bg-green-50' 
                                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                }`}
                            >
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <svg 
                                        className={`w-12 h-12 mb-4 ${
                                            selectedFile ? 'text-green-500' : 'text-gray-500'
                                        }`} 
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
                                    <p className="mb-2 text-sm text-gray-600">
                                    <span className="font-semibold">Click to upload</span> or drag and drop
                                </p>
                                <p className="text-xs text-gray-500">.XLS, .XLSX</p>
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
                            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                                <div className="flex items-center">
                                    <svg className="w-5 h-5 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span className="text-sm text-gray-700">{selectedFile.name}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                </span>
                        </div>
                    )}

                    {/* Upload Message */}
                    {uploadMessage && (
                            <div className={`p-4 rounded-lg ${
                                uploadMessage.includes('successful') 
                                    ? 'bg-green-50 text-green-700 border border-green-200' 
                                    : 'bg-red-50 text-red-700 border border-red-200'
                            }`}>
                                <div className="flex items-center">
                                    {uploadMessage.includes('successful') ? (
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                    <span className="text-sm">{uploadMessage}</span>
                                </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button
                        onClick={handleUpload}
                        disabled={!selectedFile || isLoading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-all duration-200 ${
                                !selectedFile || isLoading
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:scale-[1.02]'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Uploading...
                            </div>
                        ) : (
                                'Upload and Analyze'
                        )}
                    </button>
                    </div>
                </div>

                {/* Features Section */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="p-3 bg-indigo-100 rounded-lg w-fit mb-4">
                            <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Data Analysis</h3>
                        <p className="text-gray-600">Get detailed insights and visualizations from your Excel data</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                            <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Reports</h3>
                        <p className="text-gray-600">Create beautiful charts and graphs from your data</p>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6">
                        <div className="p-3 bg-green-100 rounded-lg w-fit mb-4">
                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Insights</h3>
                        <p className="text-gray-600">Get AI-powered analysis and recommendations</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadExcel; 