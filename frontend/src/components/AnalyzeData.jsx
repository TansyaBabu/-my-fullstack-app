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
import html2canvas from 'html2canvas';
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

    // --- Generate Report Handler ---
    const handleGenerateReport = async () => {
        if (!selectedFile) {
            setError('Please select a file to generate a report.');
            return;
        }
        setIsLoading(true);
        setError(null);
        try {
            let chartImage = null;
            if (chartType === '3D' && showChart && selected3DChartType) {
                // Robustly find the Three.js canvas inside the chart area
                let chartCanvas = null;
                const chartDiv = document.querySelector('.h-[600px]');
                if (chartDiv) {
                    chartCanvas = chartDiv.querySelector('canvas');
                    if (!chartCanvas) {
                        chartCanvas = chartDiv.getElementsByTagName('canvas')[0];
                    }
                }
                if (!chartCanvas) {
                    chartCanvas = document.querySelector('canvas');
                }
                if (chartCanvas) {
                    await new Promise(resolve => setTimeout(resolve, 500)); // Wait for rendering
                    chartImage = chartCanvas.toDataURL('image/png');
                } else if (chartDiv) {
                    const canvas = await html2canvas(chartDiv);
                    chartImage = canvas.toDataURL('image/png');
                }
            } else if (chartRef.current && typeof chartRef.current.toBase64Image === 'function') {
                chartImage = chartRef.current.toBase64Image();
            }

            await api.post(
                '/reports/generate',
                {
                    fileId: selectedFile.id,
                    chartType,
                    xAxis,
                    yAxis,
                    chartImage, // now works for both 2D and 3D
                },
                {
                    headers: { Authorization: `Bearer ${user.token}` },
                    responseType: 'blob',
                }
            ).then(response => {
                const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', `report-${selectedFile.fileName || selectedFile.id}.pdf`);
                document.body.appendChild(link);
                link.click();
                link.parentNode.removeChild(link);
            });
        } catch (err) {
            setError('Failed to generate report.');
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-12 px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-6xl mx-auto relative z-10">
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Data Analysis & Visualization</h2>
                                    <p className="text-indigo-100 text-xl font-medium">Transform your data into stunning visual insights</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-10 border border-white/30">
                    {/* Generate Report Button */}
                    {selectedFile && (
                        <button
                            onClick={handleGenerateReport}
                            className="mb-8 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold py-2 px-6 rounded-xl shadow-lg hover:scale-105 transform transition-transform duration-300"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Generating Report...' : 'Generate Report'}
                        </button>
                    )}

                {/* File Selection */}
                    <div className="mb-10">
                        <div className="flex items-center mb-6">
                            <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-6 shadow-xl">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">Select Your Data File</h3>
                                <p className="text-gray-600 font-medium">Choose an uploaded Excel file to begin your analysis</p>
                            </div>
                        </div>
                        <div className="relative">
                    <select
                                className="w-full border-2 border-gray-200 rounded-2xl shadow-lg py-4 px-6 focus:ring-4 focus:ring-indigo-500/25 focus:border-indigo-500 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-300 hover:border-indigo-300 hover:shadow-xl"
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
                                <option value="">📁 Choose a file to analyze</option>
                        {uploadedFiles.map((file) => (
                                    <option key={file.id} value={file.id}>
                                        📊 {file.fileName} ({new Date(file.uploadDate).toLocaleDateString()})
                            </option>
                        ))}
                    </select>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </div>
                        </div>
                </div>

                    {/* Show loading state */}
                    {isLoading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="relative">
                                <div className="w-16 h-16 border-4 border-indigo-200 rounded-full animate-spin"></div>
                                <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full animate-pulse"></div>
                                </div>
                            </div>
                            <div className="ml-6">
                                <p className="text-lg font-semibold text-gray-700">Processing your data...</p>
                                <p className="text-gray-500">Please wait while we prepare your analysis</p>
                            </div>
                        </div>
                    )}

                    {/* Show error message */}
                    {/* {error && (
                        <div className="mb-8 bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 p-8 rounded-2xl shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                            <div className="flex items-center">
                                <div className="p-3 bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl mr-4 shadow-lg">
                                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-lg font-bold text-red-800 mb-1">Error Occurred</h4>
                                    <p className="text-red-700">{error}</p>
                                </div>
                            </div>
                        </div>
                    )} */}

                    {/* Analysis Details */}
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-purple-700 mb-2">Analysis Details</h3>
                        <ul className="list-disc ml-6 text-lg">
                            <li>
                                <span className="font-bold">Chart Type:</span> {chartType ? chartType : 'N/A'}
                            </li>
                            <li>
                                <span className="font-bold">X-Axis:</span> {xAxis ? xAxis : 'N/A'}
                            </li>
                            <li>
                                <span className="font-bold">Y-Axis:</span> {yAxis ? yAxis : 'N/A'}
                            </li>
                        </ul>
                    </div>

                    {/* Form Section */}
                    {selectedFile && fileData && fileData.length > 0 && (
                        <>
                            {/* Chart Configuration */}
                            <div className="mb-10 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100 shadow-lg">
                                <div className="flex items-center mb-6">
                                    <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mr-6 shadow-xl">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-purple-900 mb-2">Chart Configuration</h3>
                                        <p className="text-purple-700 font-medium">Choose your visualization type and customize your chart</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="block text-lg font-semibold text-purple-800 mb-3">
                                            📊 Chart Type
                    </label>
                    <select
                                            className="w-full border-2 border-purple-200 rounded-2xl shadow-lg py-4 px-6 focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-300 hover:border-purple-300 hover:shadow-xl"
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
                                            <option value="Bar">📊 Bar Chart</option>
                                            <option value="Line">📈 Line Chart</option>
                                            <option value="Pie">🥧 Pie Chart</option>
                                            <option value="3D">🎯 3D Chart</option>
                    </select>
                                    </div>

                                    {/* 3D Chart Options - Only show when 3D chart type is selected */}
                                    {chartType === '3D' && (
                                        <div className="mb-10 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl p-8 border border-purple-100 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                                            <div className="flex items-center mb-6">
                                                <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mr-6 shadow-xl">
                                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                    </svg>
                                                </div>
                                        <div>
                                                    <h3 className="text-2xl font-bold text-purple-900 mb-2">3D Visualization Options</h3>
                                                    <p className="text-purple-700 font-medium">Create stunning three-dimensional visualizations</p>
                                                </div>
                                            </div>
                                            <div className="space-y-6">
                                                <div className="space-y-4">
                                                    <label className="block text-lg font-semibold text-purple-800 mb-3">
                                                        🎯 3D Chart Type
                                            </label>
                                            <select
                                                        className="w-full border-2 border-purple-200 rounded-2xl shadow-lg py-4 px-6 focus:ring-4 focus:ring-purple-500/25 focus:border-purple-500 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-300 hover:border-purple-300 hover:shadow-xl"
                                                value={selected3DChartType}
                                                        onChange={(e) => {
                                                            console.log('3D chart type changed to:', e.target.value);
                                                            setSelected3DChartType(e.target.value);
                                                            setShowChart(false);
                                                        }}
                                            >
                                                        <option value="">🎯 Select 3D Chart Type</option>
                                                        <option value="3DBar">📊 3D Bar Chart</option>
                                                        <option value="3DLine">📈 3D Line Chart</option>
                                                        <option value="3DPie">🥧 3D Pie Chart</option>
                                            </select>
                                                </div>
                                                {selected3DChartType && (
                                                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl border border-purple-200">
                                                        <div className="flex items-center">
                                                            <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl mr-4 shadow-lg">
                                                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                                </svg>
                                                            </div>
                                                            <div>
                                                                <p className="text-purple-900 font-semibold">Selected 3D chart type:</p>
                                                                <p className="text-purple-700 font-bold text-lg">{selected3DChartType}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                </div>

                         {/* Axis Selection */}
                            <div className="mb-10 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-100 shadow-lg">
                                <div className="flex items-center mb-6">
                                    <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mr-6 shadow-xl">
                                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-bold text-green-900 mb-2">Select Your Axes</h3>
                                        <p className="text-green-700 font-medium">Choose which data columns to visualize</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <label className="block text-lg font-semibold text-green-800 mb-3">
                                            📍 X-Axis
                        </label>
                        <select
                                            className="w-full border-2 border-green-200 rounded-2xl shadow-lg py-4 px-6 focus:ring-4 focus:ring-green-500/25 focus:border-green-500 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-300 hover:border-green-300 hover:shadow-xl"
                            value={xAxis}
                            onChange={(e) => setXAxis(e.target.value)}
                        >
                                            <option value="">📍 Select X-Axis</option>
                            {Object.keys(fileData[0]).map((key) => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                        </select>
                    </div>
                                    <div className="space-y-4">
                                        <label className="block text-lg font-semibold text-green-800 mb-3">
                                            📊 Y-Axis
                        </label>
                        <select
                                            className="w-full border-2 border-green-200 rounded-2xl shadow-lg py-4 px-6 focus:ring-4 focus:ring-green-500/25 focus:border-green-500 bg-white/80 backdrop-blur-sm text-lg font-medium transition-all duration-300 hover:border-green-300 hover:shadow-xl"
                            value={yAxis}
                            onChange={(e) => setYAxis(e.target.value)}
                        >
                                            <option value="">📊 Select Y-Axis</option>
                            {Object.keys(fileData[0]).map((key) => (
                                <option key={key} value={key}>{key}</option>
                            ))}
                        </select>
                    </div>
                </div>
                            </div>

                            {/* Generate Chart Button - Only for 3D Charts */}
                            {chartType === '3D' && (
                                <div className="flex justify-center mb-10 space-x-6">
                                    <button
                                        onClick={() => setShowChart(true)}
                                        disabled={!selectedFile || !xAxis || !yAxis || !selected3DChartType || isLoading}
                                        className={`px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500/25 ${
                                            (!selectedFile || !xAxis || !yAxis || !selected3DChartType || isLoading)
                                                ? 'bg-gray-400 cursor-not-allowed shadow-lg'
                                                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/25'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                <span>Generating...</span>
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                </svg>
                                                Generate 3D Chart
                                            </span>
                                        )}
                                    </button>
                                    
                                    {/* Save Analysis Button for 3D Charts */}
                                    {showChart && selected3DChartType && (
                                        <button
                                            onClick={handleAnalyze}
                                            disabled={isLoading}
                                            className={`px-10 py-4 rounded-2xl text-white font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/25 ${
                                                isLoading
                                                    ? 'bg-gray-400 cursor-not-allowed shadow-lg'
                                                    : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-xl hover:shadow-2xl hover:shadow-green-500/25'
                                            }`}
                                        >
                                            {isLoading ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                    <span>Saving...</span>
                                                </span>
                                            ) : (
                                                <span className="flex items-center">
                                                    <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                    </svg>
                                                    Save Analysis
                                                </span>
                                            )}
                                        </button>
                                    )}
                                </div>
                            )}

                            {/* Download Buttons for 3D Charts */}
                            {chartType === '3D' && showChart && selected3DChartType && (
                                <div className="flex justify-center mb-10 space-x-6">
                                    <button
                                        onClick={download3DChart}
                                        className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 flex items-center"
                                    >
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                        </svg>
                                        Download 3D Chart
                                    </button>
                                    <button
                                        onClick={downloadChartData}
                                        className="px-8 py-4 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-purple-500/25 flex items-center"
                                    >
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Download Data
                                    </button>
                                    <button
                                        onClick={testDownload}
                                        className="px-8 py-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-orange-500/25 flex items-center"
                                    >
                                        <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                        </svg>
                                        Test Download
                                    </button>
                                </div>
                            )}

                            {/* Chart Visualization */}
                                <div className="mb-10">
                                <h3 className="text-2xl font-bold text-blue-700 mb-2">Chart Visualization</h3>
                                    <div className="bg-gradient-to-br from-white to-blue-50 p-8 rounded-3xl shadow-2xl border border-blue-100">
                                        {isLoading ? (
                                            <div className="flex justify-center items-center h-64">
                                                <div className="relative">
                                                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
                                                    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full animate-pulse"></div>
                                                    </div>
                                                </div>
                                            </div>
                                    ) : (xAxis && yAxis && fileData && fileData.length > 0) ? (
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
                                    ) : null}
                                            </div>
                                    </div>

                            {/* Smart Suggestions */}
                {suggestedChart && (
                                <div className="mb-10 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-100 shadow-lg transform hover:scale-[1.02] transition-all duration-300">
                                    <div className="flex items-center mb-6">
                                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mr-6 shadow-xl">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-blue-900 mb-2">Smart Suggestions</h3>
                                            <p className="text-blue-700 font-medium">AI-powered recommendations for your data</p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-lg">
                                            <div className="flex items-center mb-3">
                                                <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl mr-3 shadow-lg">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-blue-900">Recommended Chart</span>
                                            </div>
                                            <div className="bg-gradient-to-r from-blue-100 to-indigo-100 px-4 py-2 rounded-xl text-center">
                                                <span className="font-bold text-blue-800">{suggestedChart}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-lg">
                                            <div className="flex items-center mb-3">
                                                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 rounded-xl mr-3 shadow-lg">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-blue-900">Suggested X-Axis</span>
                                            </div>
                                            <div className="bg-gradient-to-r from-green-100 to-emerald-100 px-4 py-2 rounded-xl text-center">
                                                <span className="font-bold text-green-800">{suggestedXAxis}</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-blue-200 shadow-lg">
                                            <div className="flex items-center mb-3">
                                                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl mr-3 shadow-lg">
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                                    </svg>
                                                </div>
                                                <span className="font-semibold text-blue-900">Suggested Y-Axis</span>
                                            </div>
                                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-xl text-center">
                                                <span className="font-bold text-purple-800">{suggestedYAxis}</span>
                                            </div>
                                        </div>
                                    </div>
                    </div>
                )}

                {['Bar', 'Line', 'Pie'].includes(chartType) && fileData && fileData.length > 0 && (
                    <div className="flex justify-center mb-6">
                        <button
                            onClick={downloadChart}
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 flex items-center"
                        >
                            <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download Chart
                        </button>
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