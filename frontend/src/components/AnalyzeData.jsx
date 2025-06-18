import axios from 'axios';
import {
    ArcElement,
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    LineElement,
    PointElement,
    Title,
    Tooltip
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ThreeDChart from './ThreeDChart';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    PointElement,
    LineElement
);

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
    const [showChart, setShowChart] = useState(false);

    // Add console.log to debug
    console.log('AnalyzeData - User:', user);
    console.log('AnalyzeData - UploadedFiles:', uploadedFiles);
    console.log('AnalyzeData - SelectedFile:', selectedFile);
    console.log('AnalyzeData - FileData:', fileData);
    console.log('AnalyzeData - Form visibility conditions:', {
        hasSelectedFile: !!selectedFile,
        hasFileData: !!fileData,
        fileDataLength: fileData?.length || 0,
        shouldShowForm: !!(selectedFile && fileData && fileData.length > 0)
    });

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
            console.log('URL fileId:', fileId);
            
            if (fileId) {
                console.log('Found fileId in URL:', fileId);
                const file = response.data.find(f => f.id === fileId);
                if (file) {
                    console.log('Found matching file:', file);
                    handleFileSelect(file);
                } else {
                    console.log('No matching file found for fileId:', fileId);
                }
            }
        } catch (error) {
            console.error('Error fetching uploaded files:', error);
            setError('Failed to load uploaded files');
        }
    };

    // Fetch file data when a file is selected
    const fetchFileData = async (fileId) => {
        console.log('Fetching file data for fileId:', fileId);
        setIsLoading(true);
        try {
            const response = await api.get(`/upload/${fileId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            console.log('File data response:', response.data);
            
            if (!response.data || !response.data.data) {
                throw new Error('Invalid file data response');
            }
            
            setFileData(response.data.data);
            
            if (response.data.data.length > 0) {
                const headers = Object.keys(response.data.data[0]);
                console.log('Available headers:', headers);
                if (headers.length >= 2) {
                    setXAxis(headers[0]);
                    setYAxis(headers[1]);
                    setSuggestedChart('Bar Chart');
                    setSuggestedXAxis(headers[0]);
                    setSuggestedYAxis(headers[1]);
                }
            }
        } catch (error) {
            console.error('Error fetching file data:', error);
            setError('Failed to load file data');
            setFileData(null);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileSelect = (file) => {
        console.log('handleFileSelect called with file:', file);
        if (!file) {
            console.log('No file selected, clearing state');
            setSelectedFile(null);
            setFileData(null);
            setXAxis('');
            setYAxis('');
            return;
        }
        console.log('Setting selected file:', file);
        setSelectedFile(file);
        fetchFileData(file.id);
    };

    const handleAnalyze = async () => {
        if (!selectedFile || !xAxis || !yAxis) {
            setError('Please select a file and both axes');
            return;
        }

        setIsLoading(true);
        try {
            console.log('Saving analysis with file:', selectedFile);
            const response = await api.post('/analysis/save', {
                fileId: selectedFile.fileId,
                fileName: selectedFile.fileName,
                chartType,
                xAxis,
                yAxis,
                selected3DChartType: chartType === '3DBar' ? selected3DChartType : undefined,
            }, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            console.log('Analysis save response:', response.data);
            alert('Analysis saved successfully!');
        } catch (error) {
            console.error('Error saving analysis:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save analysis';
            setError(`Failed to save analysis: ${errorMessage}`);
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

    useEffect(() => {
        console.log('Debug state:', {
            selectedFile: selectedFile ? 'exists' : 'null',
            fileData: fileData ? `exists (length: ${fileData.length})` : 'null',
            uploadedFiles: uploadedFiles.length
        });
    }, [selectedFile, fileData, uploadedFiles]);

    // Add debug logging for render
    useEffect(() => {
        console.log('Render state:', {
            selectedFile,
            fileData,
            uploadedFiles,
            error,
            isLoading,
            user: user ? 'exists' : 'null'
        });
    }, [selectedFile, fileData, uploadedFiles, error, isLoading, user]);

    // Add debug logging for form visibility conditions
    useEffect(() => {
        console.log('Form visibility conditions:', {
            selectedFile: selectedFile ? 'exists' : 'null',
            fileData: fileData ? 'exists' : 'null',
            fileDataLength: fileData ? fileData.length : 0,
            shouldShowForm: selectedFile && fileData && fileData.length > 0
        });
    }, [selectedFile, fileData]);

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
                            value={selectedFile?.id || ''}
                        onChange={(e) => {
                            const selectedValue = e.target.value;
                                console.log('Selected value:', selectedValue);
                            if (!selectedValue) {
                                handleFileSelect(null);
                                return;
                            }
                                const file = uploadedFiles.find(f => f.id === selectedValue);
                                console.log('Found file:', file);
                            handleFileSelect(file);
                        }}
                    >
                            <option value="">Choose a file to analyze</option>
                        {uploadedFiles.map((file) => (
                                <option key={file.id} value={file.id}>
                                    {file.fileName} ({new Date(file.uploadDate).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                </div>

                    {/* Show loading state */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                        </div>
                    )}

                    {/* Show error message */}
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

                    {/* Form Section */}
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
                                            onChange={(e) => {
                                                console.log('Chart type changed to:', e.target.value);
                                                setChartType(e.target.value);
                                                if (e.target.value !== '3D') {
                                                    setSelected3DChartType('');
                                                }
                                                setShowChart(false);
                                            }}
                    >
                        <option value="Bar">Bar Chart</option>
                        <option value="Line">Line Chart</option>
                        <option value="Pie">Pie Chart</option>
                                            <option value="3D">3D Chart</option>
                    </select>
                                    </div>

                                    {chartType === '3D' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                3D Chart Style
                                            </label>
                                            <select
                                                className="w-full border border-gray-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                                                value={selected3DChartType}
                                                onChange={(e) => {
                                                    console.log('3D chart type changed to:', e.target.value);
                                                    setSelected3DChartType(e.target.value);
                                                    setShowChart(false);
                                                }}
                                            >
                                                <option value="">Select 3D Chart Type</option>
                                                <option value="3DBar">3D Bar Chart</option>
                                                <option value="3DLine">3D Line Chart</option>
                                                <option value="3DPie">3D Pie Chart</option>
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

                            {/* Chart Visualization */}
                            {showChart && (
                                <div className="mb-8">
                                    <div className="flex items-center mb-4">
                                        <div className="p-3 bg-green-100 rounded-lg mr-4">
                                            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                        <h3 className="text-xl font-semibold text-gray-900">Chart Visualization</h3>
                                    </div>
                                    <div className="bg-white p-6 rounded-lg shadow-lg">
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                                            </div>
                                        ) : error ? (
                                            <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
                                        ) : fileData && xAxis && yAxis ? (
                                            <div className="h-[600px] w-full">
                                                {(() => {
                                                    const chartData = {
                                                        labels: fileData.map(item => item[xAxis]),
                                                        datasets: [{
                                                            label: yAxis,
                                                            data: fileData.map(item => {
                                                                const value = item[yAxis];
                                                                return typeof value === 'string' ? parseFloat(value) || 0 : value;
                                                            }),
                                                            backgroundColor: [
                                                                'rgba(99, 102, 241, 0.6)',
                                                                'rgba(139, 92, 246, 0.6)',
                                                                'rgba(236, 72, 153, 0.6)',
                                                                'rgba(59, 130, 246, 0.6)',
                                                                'rgba(16, 185, 129, 0.6)',
                                                                'rgba(245, 158, 11, 0.6)',
                                                            ],
                                                            borderColor: [
                                                                'rgba(99, 102, 241, 1)',
                                                                'rgba(139, 92, 246, 1)',
                                                                'rgba(236, 72, 153, 1)',
                                                                'rgba(59, 130, 246, 1)',
                                                                'rgba(16, 185, 129, 1)',
                                                                'rgba(245, 158, 11, 1)',
                                                            ],
                                                            borderWidth: 1,
                                                        }],
                                                    };
                                                    const chartOptions = {
                                                        responsive: true,
                                                        maintainAspectRatio: false,
                                                        scales: {
                                                            y: {
                                                                beginAtZero: true,
                                                                title: { display: true, text: yAxis }
                                                            },
                                                            x: { title: { display: true, text: xAxis } }
                                                        },
                                                        plugins: {
                                                            legend: { position: 'top' },
                                                            title: { display: true, text: `${chartType} Chart of ${yAxis} by ${xAxis}` },
                                                        },
                                                    };
                                                    switch (chartType) {
                                                        case 'Bar':
                                                            return <Bar options={chartOptions} data={chartData} />;
                                                        case 'Line':
                                                            return <Line options={chartOptions} data={chartData} />;
                                                        case 'Pie':
                                                            return <Pie options={chartOptions} data={chartData} />;
                                                        case '3D':
                                                            console.log('Rendering 3D chart with type:', selected3DChartType);
                                                            if (!selected3DChartType) {
                                                                return (
                                                                    <div className="text-center text-gray-500">
                                                                        Please select a 3D chart type.
                                                                    </div>
                                                                );
                                                            }
                                                            return (
                                                                <div className="h-[600px] w-full">
                                                                    <ThreeDChart 
                                                                        data={fileData} 
                                                                        xAxis={xAxis} 
                                                                        yAxis={yAxis}
                                                                        chartType={selected3DChartType}
                                                                    />
                                                                </div>
                                                            );
                                                        default:
                                                            return <div className="text-center text-gray-500">Select a chart type and axes to generate a chart.</div>;
                                                    }
                                                })()}
                                            </div>
                                        ) : (
                                            <div className="text-center text-gray-500">
                                                <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                </svg>
                                                <p>Select axes to generate a chart.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

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

                            {/* 3D Chart Options */}
                            <div className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                                <div className="flex items-center mb-4">
                                    <div className="p-3 bg-purple-100 rounded-lg mr-4">
                                        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-purple-900">3D Visualization Options</h3>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-purple-700 mb-2">
                                            3D Chart Type
                                        </label>
                                        <select
                                            className="w-full border border-purple-300 rounded-lg shadow-sm py-3 px-4 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 bg-white"
                                            value={selected3DChartType}
                                            onChange={(e) => {
                                                console.log('3D chart type changed to:', e.target.value);
                                                setSelected3DChartType(e.target.value);
                                                setShowChart(false);
                                            }}
                                        >
                                            <option value="">Select 3D Chart Type</option>
                                            <option value="3DBar">3D Bar Chart</option>
                                            <option value="3DLine">3D Line Chart</option>
                                            <option value="3DPie">3D Pie Chart</option>
                                        </select>
                                    </div>
                                    {selected3DChartType && (
                                        <div className="text-sm text-purple-600 bg-purple-50 p-4 rounded-lg">
                                            <p>Selected 3D chart type: <span className="font-semibold">{selected3DChartType}</span></p>
                    </div>
                )}
                                </div>
                            </div>

                            {/* Generate Chart Button */}
                            <div className="flex justify-center">
                <button
                                    onClick={() => setShowChart(true)}
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
                                            Generating...
                                        </span>
                                    ) : (
                                        'Generate Chart'
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