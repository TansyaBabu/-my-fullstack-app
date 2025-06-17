import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import ThreeDChart from './ThreeDChart';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

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

const UserDashboard = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);

    const [selectedFile, setSelectedFile] = useState(null);
    const [uploadMessage, setUploadMessage] = useState('');
    const [uploadHistory, setUploadHistory] = useState([]);
    const [analysisHistory, setAnalysisHistory] = useState([]);
    const [selectedAnalysis, setSelectedAnalysis] = useState(null);
    const [selectedFileIdForChart, setSelectedFileIdForChart] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [chartType, setChartType] = useState('Bar');
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

    const handleLogout = () => {
        dispatch(logout());
    };

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setUploadMessage(''); // Clear previous messages
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
            fetchUploadHistory();
            setSelectedFileIdForChart(response.data.fileId);
            setSelectedAnalysis(null);
        } catch (error) {
            console.error('Upload error:', error);
            const errorMessage = error.response?.data?.message || error.message;
            setUploadMessage(`Upload failed: ${errorMessage}`);
        }
    };

    const fetchUploadHistory = async () => {
        try {
            const response = await api.get('/upload/history', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setUploadHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch upload history:', error);
        }
    };

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
        }
    };

    const fetchFileData = async (fileId) => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/analysis/data/${fileId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setFileData(response.data.data);
            if (response.data.data.length > 0) {
                const headers = Object.keys(response.data.data[0]);
                if (headers.length >= 2) {
                    setXAxis(headers[0]);
                    setYAxis(headers[1]);
                } else if (headers.length === 1) {
                    setXAxis(headers[0]);
                    setYAxis('');
                }
            }
        } catch (error) {
            console.error('Failed to fetch file data:', error);
            setError('Failed to load file data. Please try again.');
            setFileData(null);
            setXAxis('');
            setYAxis('');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectUploadedFile = async (file) => {
        setSelectedFileIdForChart(file.fileId);
        setSelectedAnalysis(null);
        setChartType('Bar');
        setXAxis(''); // Reset X-axis
        setYAxis(''); // Reset Y-axis
        // Fetch data immediately and try to set axes
        try {
            await fetchFileData(file.fileId);
        } catch (error) {
            console.error('Failed to fetch file data for uploaded file:', error);
            setFileData(null);
            setXAxis('');
            setYAxis('');
        }
    };

    const handleSelectAnalysis = (analysis) => {
        setSelectedAnalysis(analysis);
        setSelectedFileIdForChart(analysis.fileId);
        setChartType(analysis.chartType);
        setXAxis(analysis.xAxis);
        setYAxis(analysis.yAxis);
        // Data is fetched via useEffect based on selectedFileIdForChart
    };

    const handleDownload = async () => {
        if (!selectedAnalysis) {
            setError('Please select an analysis from history to download.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            const response = await api.get(`/analysis/download/${selectedAnalysis.fileId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
                responseType: 'blob',
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `analysis_${selectedAnalysis.fileId}.json`);
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

    const handleGenerateSummary = async () => {
        if (!selectedAnalysis) {
            setError('Please select an analysis from history to generate a summary.');
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

    const handleSaveAnalysis = async () => {
        if (!fileData || !xAxis || !yAxis || (!selectedAnalysis && !selectedFileIdForChart)) {
            alert('Please generate a chart first.');
            return;
        }

        let fileIdToSave = null;
        let fileNameToSave = '';

        if (selectedAnalysis) {
            fileIdToSave = selectedAnalysis.fileId;
            fileNameToSave = selectedAnalysis.fileName;
        } else if (selectedFileIdForChart && uploadHistory.length > 0) {
            const uploadedFile = uploadHistory.find(file => file.fileId === selectedFileIdForChart);
            if (uploadedFile) {
                fileIdToSave = uploadedFile.fileId;
                fileNameToSave = uploadedFile.fileName;
            } else {
                alert('Could not find file details for saving analysis.');
                return;
            }
        } else {
            alert('No file selected to save analysis.');
            return;
        }

        try {
            const response = await api.post('/analysis/save', {
                fileId: fileIdToSave,
                fileName: fileNameToSave,
                chartType,
                xAxis,
                yAxis,
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            alert('Analysis saved successfully!');
            fetchAnalysisHistory();
        } catch (error) {
            console.error('Save analysis error:', error);
            alert('Failed to save analysis.');
        }
    };

    useEffect(() => {
        if (user && user.token) {
            fetchUploadHistory();
            fetchAnalysisHistory();
        }
    }, [user]);

    useEffect(() => {
        if (selectedFileIdForChart) {
            fetchFileData(selectedFileIdForChart);
        }
    }, [selectedFileIdForChart]);

    useEffect(() => {
        if (fileData && fileData.length > 0 && !xAxis && !yAxis) {
            const headers = Object.keys(fileData[0]);
            if (headers.length >= 2) {
                setXAxis(headers[0]);
                setYAxis(headers[1]);
            } else if (headers.length === 1) {
                setXAxis(headers[0]);
                setYAxis('');
            }
        }
    }, [fileData, xAxis, yAxis]);

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `${chartType} Chart of ${yAxis} by ${xAxis}`,
            },
        },
    };

    return (
        <div className="dashboard-container">
            {/* Navigation Bar */}
            <nav className="dashboard-header">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="dashboard-title">
                                Data Analytics Dashboard
                            </h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700 font-medium">Welcome, {user?.username}</span>
                            <button
                                onClick={handleLogout}
                                className="btn-danger"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="welcome-section">
                    <div className="welcome-header">
                        <h2 className="welcome-title">Welcome back, {user?.username}!</h2>
                        <p className="welcome-subtitle">Manage your data, create visualizations, and gain insights from your analytics.</p>
                        </div>
                    </div>

                <div className="dashboard-grid">
                        {/* File Upload Section */}
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h3 className="dashboard-card-title">
                                <svg className="dashboard-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Upload Excel File
                            </h3>
                        </div>
                        <div className="dashboard-card-content">
                                <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="file-upload-area">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-12 h-12 mb-4 text-indigo-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L7 9m3-3 3 3"/>
                                            </svg>
                                        <p className="mb-2 text-sm text-gray-600"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500">.XLS, .XLSX</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".xls,.xlsx" />
                                    </label>
                                </div>
                            {selectedFile && (
                                <div className="mt-4 p-3 bg-indigo-50 rounded-lg">
                                    <p className="text-sm text-indigo-700">Selected file: {selectedFile.name}</p>
                                </div>
                            )}
                            {uploadMessage && (
                                <div className={`mt-4 p-3 rounded-lg ${uploadMessage.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                    {uploadMessage}
                                </div>
                            )}
                                <button
                                    onClick={handleUpload}
                                className="dashboard-button mt-4"
                                >
                                Upload File
                                </button>
                            </div>
                        </div>

                        {/* Upload History Section */}
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h3 className="dashboard-card-title">
                                <svg className="dashboard-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Upload History
                            </h3>
                        </div>
                        <div className="dashboard-card-content">
                            <div className="max-h-80 overflow-y-auto">
                                {uploadHistory.length > 0 ? (
                                    <ul className="dashboard-list">
                                        {uploadHistory.map((file) => (
                                            <li 
                                                key={file._id} 
                                                className="dashboard-list-item"
                                                onClick={() => handleSelectUploadedFile(file)}
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    <span className="text-gray-700">{file.fileName}</span>
                                                </div>
                                                <span className="text-sm text-gray-500">{new Date(file.uploadDate).toLocaleDateString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                        </svg>
                                    <p className="text-gray-500">No uploaded files found.</p>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>

                        {/* Analysis History Section */}
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h3 className="dashboard-card-title">
                                <svg className="dashboard-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Analysis History
                            </h3>
                        </div>
                        <div className="dashboard-card-content">
                            <div className="max-h-80 overflow-y-auto">
                                {analysisHistory.length > 0 ? (
                                    <ul className="dashboard-list">
                                        {analysisHistory.map((analysis) => (
                                            <li 
                                                key={analysis._id} 
                                                className="dashboard-list-item"
                                                onClick={() => handleSelectAnalysis(analysis)}
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-5 h-5 text-indigo-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                    </svg>
                                                    <div>
                                                        <span className="text-gray-700">{analysis.fileName}</span>
                                                        <p className="text-sm text-gray-500">{analysis.chartType} ({analysis.xAxis} vs {analysis.yAxis})</p>
                                                    </div>
                                                </div>
                                                <span className="text-sm text-gray-500">{new Date(analysis.analysisDate).toLocaleDateString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-center py-8">
                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    <p className="text-gray-500">No analysis history found.</p>
                                    </div>
                                )}
                            </div>
                            </div>
                        </div>

                        {/* Chart Display Section */}
                    <div className="dashboard-card lg:col-span-2">
                        <div className="dashboard-card-header">
                            <h3 className="dashboard-card-title">
                                <svg className="dashboard-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                                Chart Visualization
                            </h3>
                        </div>
                        <div className="dashboard-card-content">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Chart Type</label>
                                    <select
                                        className="dashboard-select"
                                        value={chartType}
                                        onChange={(e) => setChartType(e.target.value)}
                                    >
                                        <option value="Bar">Bar Chart</option>
                                        <option value="Line">Line Chart</option>
                                        <option value="Pie">Pie Chart</option>
                                        <option value="3DBar">3D Bar Chart</option>
                                    </select>
                                </div>
                                {fileData && fileData.length > 0 && (
                                        <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">X-Axis</label>
                                            <select
                                                className="dashboard-select"
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
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Y-Axis</label>
                                            <select
                                                className="dashboard-select"
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
                                )}
                                </div>

                            <div className="chart-container">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center">
                                        <div className="loading-spinner"></div>
                                        <p className="mt-4 text-gray-600">Loading data...</p>
                                        </div>
                                    ) : error ? (
                                    <div className="text-red-600 bg-red-50 p-4 rounded-lg">{error}</div>
                                    ) : fileData && xAxis && yAxis ? (
                                        (() => {
                                            const data = {
                                                labels: fileData.map(row => row[xAxis]),
                                                datasets: [
                                                    {
                                                        label: yAxis,
                                                        data: fileData.map(row => parseFloat(row[yAxis])),
                                                    backgroundColor: 'rgba(99, 102, 241, 0.6)',
                                                    borderColor: 'rgba(99, 102, 241, 1)',
                                                        borderWidth: 1,
                                                    },
                                                ],
                                            };
                                            switch (chartType) {
                                                case 'Bar':
                                                    return <Bar options={chartOptions} data={data} />;
                                                case 'Line':
                                                    return <Line options={chartOptions} data={data} />;
                                                case 'Pie':
                                                    const pieData = {
                                                        labels: data.labels,
                                                        datasets: [
                                                            {
                                                                label: yAxis,
                                                                data: data.datasets[0].data,
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
                                                            },
                                                        ],
                                                    };
                                                    return <Pie options={chartOptions} data={pieData} />;
                                                case '3DBar':
                                                    return <ThreeDChart data={fileData} xAxis={xAxis} yAxis={yAxis} />;
                                                default:
                                                return <p className="text-gray-500">Select a chart type and axes to generate a chart.</p>;
                                            }
                                        })()
                                ) : (
                                    <div className="text-center">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                        <p className="text-gray-500">Select axes to generate a chart.</p>
                                    </div>
                                )}
                                </div>

                            <div className="mt-6 grid grid-cols-2 gap-4">
                                    <button
                                        onClick={handleDownload}
                                        disabled={!selectedAnalysis || isLoading}
                                    className="dashboard-button"
                                    >
                                        {isLoading ? 'Downloading...' : 'Download Chart Data'}
                                    </button>
                                    {fileData && xAxis && yAxis && (
                                        <button
                                            onClick={handleSaveAnalysis}
                                            disabled={isLoading}
                                        className="dashboard-button"
                                        >
                                            {isLoading ? 'Saving...' : 'Save Current Analysis'}
                                </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* AI Insights Section */}
                    <div className="dashboard-card">
                        <div className="dashboard-card-header">
                            <h3 className="dashboard-card-title">
                                <svg className="dashboard-card-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                AI Insights
                            </h3>
                        </div>
                        <div className="dashboard-card-content">
                            <div className="ai-insights-container">
                                    {isGeneratingSummary ? (
                                    <div className="flex flex-col items-center justify-center h-full">
                                        <div className="loading-spinner"></div>
                                        <p className="mt-4 text-gray-600">Generating AI insights...</p>
                                        </div>
                                    ) : selectedAnalysis && selectedAnalysis.summary ? (
                                    <div className="prose prose-sm max-w-none">
                                        <p className="text-gray-700">{selectedAnalysis.summary}</p>
                                    </div>
                                    ) : (
                                    <div className="text-center h-full flex flex-col items-center justify-center">
                                        <svg className="w-12 h-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                        <p className="text-gray-500">Select an analysis to view or generate AI insights.</p>
                                    </div>
                                    )}
                                </div>
                                <button
                                    onClick={handleGenerateSummary}
                                className="dashboard-button mt-4"
                                >
                                Generate AI Insights
                                </button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard; 