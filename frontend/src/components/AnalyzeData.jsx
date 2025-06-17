import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const AnalyzeData = () => {
    console.log('AnalyzeData component rendering');
    const { user } = useSelector((state) => state.user);
    const location = useLocation();
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [chartType, setChartType] = useState('Bar');
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [suggestedChart, setSuggestedChart] = useState(null);
    const [suggestedXAxis, setSuggestedXAxis] = useState('');
    const [suggestedYAxis, setSuggestedYAxis] = useState('');
    const [selected3DChartType, setSelected3DChartType] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Add console.log to debug
    console.log('AnalyzeData - User:', user);
    console.log('AnalyzeData - UploadedFiles:', uploadedFiles);

    // Fetch uploaded files
    const fetchUploadedFiles = async () => {
        try {
            console.log('Fetching uploaded files...');
            const response = await api.get('/upload/history', {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            console.log('Uploaded files response:', response.data);
            setUploadedFiles(response.data);
            
            // After fetching files, check if we have a fileId in URL
            const searchParams = new URLSearchParams(location.search);
            const fileId = searchParams.get('fileId');
            if (fileId) {
                console.log('Found fileId in URL:', fileId);
                const file = response.data.find(f => f.fileId === fileId);
                if (file) {
                    console.log('Found matching file:', file);
                    handleFileSelect(file);
                }
            }
        } catch (error) {
            console.error('Error fetching uploaded files:', error);
            setError('Failed to load uploaded files');
        }
    };

    // Fetch file data when a file is selected
    const fetchFileData = async (fileId) => {
        setIsLoading(true);
        try {
            const response = await api.get(`/analysis/data/${fileId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setFileData(response.data.data);
            if (response.data.data.length > 0) {
                const headers = Object.keys(response.data.data[0]);
                if (headers.length >= 2) {
                    setXAxis(headers[0]);
                    setYAxis(headers[1]);
                    setSuggestedChart('Bar Chart');
                    setSuggestedXAxis(headers[0]);
                    setSuggestedYAxis(headers[1]);
                }
            }
        } catch (error) {
            setError('Failed to load file data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (file) => {
        if (!file) {
            setSelectedFile(null);
            setFileData(null);
            return;
        }
        setSelectedFile(file);
        fetchFileData(file.fileId);
    };

    const handleAnalyze = async () => {
        if (!selectedFile || !xAxis || !yAxis) {
            setError('Please select a file and both axes');
            return;
        }

        setIsLoading(true);
        try {
            await api.post('/analysis/save', {
                fileId: selectedFile.fileId,
                fileName: selectedFile.fileName,
                chartType,
                xAxis,
                yAxis,
                selected3DChartType: chartType === '3DBar' ? selected3DChartType : undefined,
            }, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            alert('Analysis saved successfully!');
        } catch (error) {
            setError('Failed to save analysis');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user?.token) {
            fetchUploadedFiles();
        }
    }, [user]);

    useEffect(() => {
        console.log('State updated:', {
            selectedFile,
            fileData,
            uploadedFiles,
            location: location.search
        });
    }, [selectedFile, fileData, uploadedFiles, location.search]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-600">
                        <h2 className="text-3xl font-bold text-white mb-2">Data Analysis</h2>
                        <p className="text-indigo-100">Create beautiful visualizations from your data</p>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-xl shadow-lg p-8">
                    {/* File Selection */}
                    <div className="mb-8">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-indigo-100 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900">Select Your Data File</h3>
                        </div>
                        <select
                            className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                            value={selectedFile?.fileId || ''}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                if (!selectedValue) {
                                    handleFileSelect(null);
                                    return;
                                }
                                const file = uploadedFiles.find(f => f.fileId === selectedValue);
                                handleFileSelect(file);
                            }}
                        >
                            <option value="">Choose a file to analyze</option>
                            {uploadedFiles.map((file) => (
                                <option key={file.fileId} value={file.fileId}>
                                    {file.fileName}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedFile && fileData && fileData.length > 0 && (
                        <>
                            {/* Chart Configuration */}
                            <div className="mb-8">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-purple-100 rounded-lg mr-4">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Chart Configuration</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Chart Type
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                            value={chartType}
                                            onChange={(e) => setChartType(e.target.value)}
                                        >
                                            <option value="Bar">Bar Chart</option>
                                            <option value="Line">Line Chart</option>
                                            <option value="Pie">Pie Chart</option>
                                            <option value="3DBar">3D Bar Chart</option>
                                        </select>
                                    </div>

                                    {chartType === '3DBar' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                3D Chart Style
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                value={selected3DChartType}
                                                onChange={(e) => setSelected3DChartType(e.target.value)}
                                            >
                                                <option value="3DBar">3D Bar Chart</option>
                                                <option value="3DColumn">3D Column Chart</option>
                                                <option value="3DScatter">3D Scatter Plot</option>
                                            </select>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Axis Selection */}
                            <div className="mb-8">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-green-100 rounded-lg mr-4">
                                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-900">Select Your Axes</h3>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            X-Axis
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                            value={xAxis}
                                            onChange={(e) => setXAxis(e.target.value)}
                                        >
                                            <option value="">Select X-Axis</option>
                                            {Object.keys(fileData[0]).map((key) => (
                                                <option key={key} value={key}>{key}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Y-Axis
                                        </label>
                                        <select
                                            className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                            value={yAxis}
                                            onChange={(e) => setYAxis(e.target.value)}
                                        >
                                            <option value="">Select Y-Axis</option>
                                            {Object.keys(fileData[0]).map((key) => (
                                                <option key={key} value={key}>{key}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Smart Suggestions */}
                            {suggestedChart && (
                                <div className="mb-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                                    <div className="flex items-center mb-4">
                                        <div className="p-3 bg-blue-100 rounded-lg mr-4">
                                            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-blue-900">Smart Suggestions</h3>
                                    </div>
                                    <div className="space-y-3 text-blue-800">
                                        <div className="flex items-center">
                                            <span className="font-medium w-40">Recommended Chart:</span>
                                            <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">{suggestedChart}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium w-40">Suggested X-Axis:</span>
                                            <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">{suggestedXAxis}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="font-medium w-40">Suggested Y-Axis:</span>
                                            <span className="bg-blue-100 px-3 py-1 rounded-full text-sm">{suggestedYAxis}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {error && (
                                <div className="mb-8 bg-red-50 border-l-4 border-red-400 p-6 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="w-6 h-6 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-red-800">{error}</p>
                                    </div>
                                </div>
                            )}

                            {/* Analyze Button */}
                            <div className="flex justify-center">
                                <button
                                    onClick={handleAnalyze}
                                    disabled={!selectedFile || !xAxis || !yAxis || isLoading}
                                    className={`w-full md:w-auto px-8 py-3 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                                        (!selectedFile || !xAxis || !yAxis || isLoading)
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 transform hover:scale-105'
                                    }`}
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Analyzing...
                                        </span>
                                    ) : (
                                        'Analyze Data'
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyzeData; 