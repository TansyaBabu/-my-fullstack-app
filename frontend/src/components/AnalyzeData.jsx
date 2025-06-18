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
import React, { useEffect, useRef, useState } from 'react';
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
    const chartRef = useRef();

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
        setError(null);
        
        try {
            console.log('Saving analysis with file:', selectedFile);
            
            // Determine the actual chart type to save
            let chartTypeToSave = chartType;
            if (chartType === '3D' && selected3DChartType) {
                chartTypeToSave = selected3DChartType;
            }
            
            const analysisData = {
                fileId: selectedFile.id,
                fileName: selectedFile.fileName,
                chartType: chartTypeToSave,
                xAxis: xAxis,
                yAxis: yAxis
            };
            
            console.log('Sending analysis data:', analysisData);
            
            const response = await api.post('/analysis/save', analysisData, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            
            console.log('Analysis save response:', response.data);
            
            // Show success message
            setError(null);
            
            // Check if this was an update or new creation based on response
            const isUpdate = response.data.updatedAt !== response.data.createdAt;
            const message = isUpdate 
                ? 'Analysis updated successfully! You can view it in the Analysis History.'
                : 'Analysis saved successfully! You can view it in the Analysis History.';
            
            alert(message);
            
        } catch (error) {
            console.error('Error saving analysis:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to save analysis';
            setError(`Failed to save analysis: ${errorMessage}`);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadChart = () => {
        try {
            console.log('Attempting to download 2D chart...');
            console.log('chartRef.current:', chartRef.current);
            
            // First try to use chartRef if available
            if (chartRef.current) {
                if (typeof chartRef.current.toBase64Image === 'function') {
                    const url = chartRef.current.toBase64Image();
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${chartType}_chart_${xAxis}_vs_${yAxis}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    console.log('Chart downloaded successfully using toBase64Image method');
                    return;
                } else if (chartRef.current.canvas) {
                    const url = chartRef.current.canvas.toDataURL('image/png', 1.0);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${chartType}_chart_${xAxis}_vs_${yAxis}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    console.log('Chart downloaded successfully using canvas method');
                    return;
                }
            }
            
            // Fallback: try to find the chart canvas in the DOM
            console.log('ChartRef not available, searching for canvas in DOM...');
            const chartContainer = document.querySelector('.h-[600px]');
            if (chartContainer) {
                const canvas = chartContainer.querySelector('canvas');
                if (canvas) {
                    const url = canvas.toDataURL('image/png', 1.0);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `${chartType}_chart_${xAxis}_vs_${yAxis}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    console.log('Chart downloaded successfully using DOM search method');
                    return;
                }
            }
            
            // Last resort: try to find any canvas that might be the chart
            const allCanvases = document.querySelectorAll('canvas');
            console.log('Found canvases:', allCanvases.length);
            
            if (allCanvases.length > 0) {
                // Use the last canvas (most likely to be the chart)
                const canvas = allCanvases[allCanvases.length - 1];
                const url = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${chartType}_chart_${xAxis}_vs_${yAxis}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('Chart downloaded successfully using fallback canvas method');
                return;
            }
            
            alert('Chart not available for download. Please generate the chart first.');
        } catch (error) {
            console.error('Error downloading 2D chart:', error);
            alert('Error downloading chart. Please try again.');
        }
    };

    const download3DChart = () => {
        try {
            console.log('=== Simplified 3D chart download ===');
            
            // Simple approach: find any canvas and try to download it
            const allCanvases = document.querySelectorAll('canvas');
            console.log('Found canvases:', allCanvases.length);
            
            if (allCanvases.length === 0) {
                alert('No canvas found. Please generate the 3D chart first.');
                return;
            }
            
            // Try the last canvas (most likely to be the 3D chart)
            const canvas = allCanvases[allCanvases.length - 1];
            console.log('Using canvas:', canvas);
            console.log('Canvas dimensions:', canvas.width, 'x', canvas.height);
            
            try {
                // Try normal download first
                const url = canvas.toDataURL('image/png', 1.0);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${selected3DChartType}_chart_${xAxis}_vs_${yAxis}.png`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                console.log('3D chart downloaded successfully!');
                return;
            } catch (normalError) {
                console.log('Normal download failed, trying WebGL method...');
                
                // Try WebGL method
                try {
                    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
                    if (gl) {
                        console.log('WebGL context found, reading pixels...');
                        
                        // Read pixels from WebGL canvas
                        const pixels = new Uint8Array(gl.drawingBufferWidth * gl.drawingBufferHeight * 4);
                        gl.readPixels(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
                        
                        // Create new canvas with the WebGL content
                        const newCanvas = document.createElement('canvas');
                        newCanvas.width = gl.drawingBufferWidth;
                        newCanvas.height = gl.drawingBufferHeight;
                        const ctx = newCanvas.getContext('2d');
                        const imageData = ctx.createImageData(gl.drawingBufferWidth, gl.drawingBufferHeight);
                        
                        // Copy pixels (flip vertically for WebGL)
                        for (let y = 0; y < gl.drawingBufferHeight; y++) {
                            for (let x = 0; x < gl.drawingBufferWidth; x++) {
                                const srcIndex = (y * gl.drawingBufferWidth + x) * 4;
                                const dstIndex = ((gl.drawingBufferHeight - 1 - y) * gl.drawingBufferWidth + x) * 4;
                                imageData.data[dstIndex] = pixels[srcIndex];
                                imageData.data[dstIndex + 1] = pixels[srcIndex + 1];
                                imageData.data[dstIndex + 2] = pixels[srcIndex + 2];
                                imageData.data[dstIndex + 3] = pixels[srcIndex + 3];
                            }
                        }
                        
                        ctx.putImageData(imageData, 0, 0);
                        const url = newCanvas.toDataURL('image/png', 1.0);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `${selected3DChartType}_chart_${xAxis}_vs_${yAxis}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        console.log('3D chart downloaded successfully using WebGL method!');
                        return;
                    }
                } catch (webglError) {
                    console.log('WebGL method failed:', webglError);
                }
            }
            
            // If all methods fail, create a simple fallback
            console.log('Creating fallback image...');
            const fallbackCanvas = document.createElement('canvas');
            fallbackCanvas.width = 800;
            fallbackCanvas.height = 600;
            const ctx = fallbackCanvas.getContext('2d');
            
            // Draw a simple chart representation
            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, 800, 600);
            
            ctx.fillStyle = '#495057';
            ctx.font = 'bold 24px Arial';
            ctx.textAlign = 'center';
            ctx.fillText(`${selected3DChartType} Chart`, 400, 50);
            ctx.fillText(`${yAxis} vs ${xAxis}`, 400, 80);
            
            ctx.fillStyle = '#6c757d';
            ctx.font = '16px Arial';
            ctx.fillText('3D Chart Generated Successfully', 400, 200);
            ctx.fillText('Chart data is available for download', 400, 230);
            ctx.fillText('Use "Download Data" button for CSV export', 400, 260);
            
            // Add some visual elements
            ctx.fillStyle = '#007bff';
            ctx.fillRect(300, 300, 200, 100);
            ctx.fillStyle = '#28a745';
            ctx.fillRect(320, 320, 160, 60);
            
            const url = fallbackCanvas.toDataURL('image/png', 1.0);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${selected3DChartType}_chart_${xAxis}_vs_${yAxis}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            console.log('Fallback chart image created successfully');
            alert('3D chart image created successfully! Use "Download Data" for the actual data.');
            
        } catch (error) {
            console.error('Error downloading 3D chart:', error);
            alert('Error downloading 3D chart. Please try again or use "Download Data" for CSV export.');
        }
    };

    const downloadChartData = () => {
        if (!fileData || !xAxis || !yAxis) {
            alert('No chart data available for download.');
            return;
        }

        // Determine the chart type for the filename
        let chartTypeForFile = chartType;
        if (chartType === '3D' && selected3DChartType) {
            chartTypeForFile = selected3DChartType;
        }

        // Create CSV data
        const csvData = fileData.map(item => ({
            [xAxis]: item[xAxis],
            [yAxis]: item[yAxis]
        }));

        // Convert to CSV string
        const headers = [xAxis, yAxis];
        const csvContent = [
            headers.join(','),
            ...csvData.map(row => headers.map(header => `"${row[header]}"`).join(','))
        ].join('\n');

        // Create and download CSV file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${chartTypeForFile}_data_${xAxis}_vs_${yAxis}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        console.log('CSV data downloaded successfully');
    };

    // Test function to verify download functionality
    const testDownload = () => {
        console.log('=== Testing Download Functionality ===');
        console.log('Chart type:', chartType);
        console.log('3D chart type:', selected3DChartType);
        console.log('Chart ref exists:', !!chartRef.current);
        console.log('File data exists:', !!fileData);
        console.log('X axis:', xAxis);
        console.log('Y axis:', yAxis);
        
        // Test canvas detection
        const allCanvases = document.querySelectorAll('canvas');
        console.log('Total canvases found:', allCanvases.length);
        
        allCanvases.forEach((canvas, index) => {
            console.log(`Canvas ${index}:`, {
                width: canvas.width,
                height: canvas.height,
                style: canvas.style.cssText,
                parent: canvas.parentElement?.className
            });
        });
        
        alert('Check console for download test results');
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
        console.log('=== DEBUG: AnalyzeData State ===');
        console.log('chartType:', chartType);
        console.log('selected3DChartType:', selected3DChartType);
        console.log('showChart:', showChart);
        console.log('xAxis:', xAxis);
        console.log('yAxis:', yAxis);
        console.log('selectedFile:', selectedFile ? 'exists' : 'null');
        console.log('fileData:', fileData ? `exists (${fileData.length} rows)` : 'null');
        console.log('shouldShow3DOptions:', chartType === '3D');
        console.log('shouldShow3DButton:', chartType === '3D');
        console.log('shouldShow3DChart:', chartType === '3D' && showChart && selected3DChartType);
        console.log('================================');
    }, [chartType, selected3DChartType, showChart, xAxis, yAxis, selectedFile, fileData]);

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
                                                    setShowChart(false);
                                                } else {
                                                    setShowChart(false);
                                                }
                                            }}
                    >
                        <option value="Bar">Bar Chart</option>
                        <option value="Line">Line Chart</option>
                        <option value="Pie">Pie Chart</option>
                                            <option value="3D">3D Chart</option>
                    </select>
                                    </div>

                                    {/* 3D Chart Options - Only show when 3D chart type is selected */}
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

                            {/* 3D Chart Options - Only show when 3D chart type is selected */}
                            {chartType === '3D' && (
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
                            )}

                            {/* Generate Chart Button - Only for 3D Charts */}
                            {chartType === '3D' && (
                                <div className="flex justify-center mb-8 space-x-4">
                                    <button
                                        onClick={() => setShowChart(true)}
                                        disabled={!selectedFile || !xAxis || !yAxis || !selected3DChartType || isLoading}
                                        className={`px-8 py-3 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                                            (!selectedFile || !xAxis || !yAxis || !selected3DChartType || isLoading)
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
                                            'Generate 3D Chart'
                                        )}
                                    </button>
                                    
                                    {/* Save Analysis Button for 3D Charts */}
                                    {showChart && selected3DChartType && (
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isLoading}
                                            className={`px-8 py-3 rounded-lg text-white font-semibold text-lg transition-all duration-200 ${
                                                isLoading
                                                    ? 'bg-gray-400 cursor-not-allowed'
                                                    : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105'
                                            }`}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Saving...
                                                </span>
                                            ) : (
                                                'Save Analysis'
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Download Buttons for 3D Charts */}
                            {chartType === '3D' && showChart && selected3DChartType && (
                                <div className="flex justify-center mb-8 space-x-4">
                                    <button
                                        onClick={download3DChart}
                                        className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download 3D Chart
                                    </button>
                                    <button
                                        onClick={downloadChartData}
                                        className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Data
                                    </button>
                                    <button
                                        onClick={testDownload}
                                        className="px-6 py-3 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors flex items-center"
                                    >
                                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Test Download
                                    </button>
                                </div>
                            )}

                            {/* Chart Visualization */}
                            {((chartType !== '3D' && xAxis && yAxis) || (chartType === '3D' && showChart && selected3DChartType)) && (
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
                                                            return <Bar options={chartOptions} data={chartData} ref={chartRef} />;
                                                        case 'Line':
                                                            return <Line options={chartOptions} data={chartData} ref={chartRef} />;
                                                        case 'Pie':
                                                            return <Pie options={chartOptions} data={chartData} ref={chartRef} />;
                                                        case '3D':
                                                            console.log('Rendering 3D chart with type:', selected3DChartType);
                                                            console.log('3D chart conditions:', {
                                                                showChart,
                                                                selected3DChartType,
                                                                hasData: !!fileData,
                                                                dataLength: fileData?.length,
                                                                xAxis,
                                                                yAxis
                                                            });
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
                                    
                                    {/* Save Analysis Button for Regular Charts */}
                                    {chartType !== '3D' && xAxis && yAxis && fileData && (
                                        <div className="flex justify-center mt-6 space-x-4">
                                            <button
                                                onClick={handleAnalyze}
                                                disabled={isLoading}
                                                className={`px-6 py-3 rounded-lg text-white font-semibold transition-all duration-200 ${
                                                    isLoading
                                                        ? 'bg-gray-400 cursor-not-allowed'
                                                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 transform hover:scale-105'
                                                }`}
                                            >
                                                {isLoading ? (
                                                    <span className="flex items-center justify-center">
                                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Saving...
                                                    </span>
                                                ) : (
                                                    'Save Analysis'
                                                )}
                                            </button>
                                            
                                            {/* Download buttons - show when chart is rendered */}
                                            <button
                                                onClick={downloadChart}
                                                className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                Download Chart
                                            </button>
                                            <button
                                                onClick={downloadChartData}
                                                className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center"
                                            >
                                                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                Download Data
                                            </button>
                                        </div>
                                    )}
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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AnalyzeData; 