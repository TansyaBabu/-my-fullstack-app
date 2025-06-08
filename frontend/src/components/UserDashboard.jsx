import axios from 'axios';
import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, Legend, LinearScale, LineElement, PointElement, Title, Tooltip } from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../redux/slices/userSlice';
import ThreeDChart from './ThreeDChart';

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
    const [selectedFileId, setSelectedFileId] = useState(null);
    const [fileData, setFileData] = useState(null);
    const [chartType, setChartType] = useState('Bar');
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');

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

        const formData = new FormData();
        formData.append('excelFile', selectedFile);

        try {
            const response = await axios.post('/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${user.token}`, // Assuming token is available in user object
                },
            });
            setUploadMessage(`Upload successful: ${response.data.message}`);
            setSelectedFile(null); // Clear selected file after successful upload
            fetchUploadHistory(); // Refresh history after upload
        } catch (error) {
            const errorMessage = error.response && error.response.data.message
                ? error.response.data.message
                : error.message;
            setUploadMessage(`Upload failed: ${errorMessage}`);
        }
    };

    const fetchUploadHistory = async () => {
        try {
            const response = await axios.get('/api/upload/history', {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setUploadHistory(response.data);
        } catch (error) {
            console.error('Failed to fetch upload history:', error);
            // Optionally set an error message for the user
        }
    };

    const fetchFileData = async (fileId) => {
        try {
            const response = await axios.get(`/api/upload/${fileId}`, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            setFileData(response.data.data); // Assuming response.data.data contains the parsed array of objects
            // Optionally set default axes or chart type based on data
            if (response.data.data.length > 0) {
                const headers = Object.keys(response.data.data[0]);
                if (headers.length >= 2) {
                    setXAxis(headers[0]);
                    setYAxis(headers[1]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch file data:', error);
            setFileData(null);
        }
    };

    useEffect(() => {
        if (user && user.token) {
            fetchUploadHistory();
        }
    }, [user]);

    useEffect(() => {
        if (selectedFileId) {
            fetchFileData(selectedFileId);
        }
    }, [selectedFileId]);

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
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">User Dashboard</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="mr-4">Welcome, {user?.username}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to your Dashboard, {user?.username}!</h2>
                            <p className="text-gray-700">Here you can manage your Excel files, view analysis, and generate charts.</p>
                        </div>
                    </div>

                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* File Upload Section */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload Excel File</h3>
                                <div className="flex items-center justify-center w-full">
                                    <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L7 9m3-3 3 3"/>
                                            </svg>
                                            <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                            <p className="text-xs text-gray-500">.XLS, .XLSX</p>
                                        </div>
                                        <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept=".xls,.xlsx" />
                                    </label>
                                </div>
                                {selectedFile && <p className="mt-2 text-sm text-gray-600">Selected file: {selectedFile.name}</p>}
                                {uploadMessage && <p className={`mt-2 text-sm ${uploadMessage.includes('successful') ? 'text-green-600' : 'text-red-600'}`}>{uploadMessage}</p>}
                                <button
                                    onClick={handleUpload}
                                    className="mt-4 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded"
                                >
                                    Upload
                                </button>
                            </div>
                        </div>

                        {/* Upload History Section */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Upload History</h3>
                                {uploadHistory.length > 0 ? (
                                    <ul className="divide-y divide-gray-200">
                                        {uploadHistory.map((file) => (
                                            <li key={file.id} className="py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50" onClick={() => setSelectedFileId(file.id)}>
                                                <span>{file.fileName}</span>
                                                <span className="text-sm text-gray-500">{new Date(file.uploadDate).toLocaleDateString()}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500">No upload history found.</p>
                                )}
                                <button className="mt-4 w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded">
                                    View All History
                                </button>
                            </div>
                        </div>

                        {/* Chart Display Section */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">Your Charts</h3>
                                <div className="mb-4">
                                    <label htmlFor="chartType" className="block text-sm font-medium text-gray-700">Chart Type:</label>
                                    <select
                                        id="chartType"
                                        name="chartType"
                                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                                    <div className="mb-4 grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="xAxis" className="block text-sm font-medium text-gray-700">X-Axis:</label>
                                            <select
                                                id="xAxis"
                                                name="xAxis"
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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
                                            <label htmlFor="yAxis" className="block text-sm font-medium text-gray-700">Y-Axis:</label>
                                            <select
                                                id="yAxis"
                                                name="yAxis"
                                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
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

                                <div className="bg-gray-100 h-96 rounded-lg flex items-center justify-center text-gray-500 p-4">
                                    {fileData && xAxis && yAxis ? (
                                        (() => {
                                            const data = {
                                                labels: fileData.map(row => row[xAxis]),
                                                datasets: [
                                                    {
                                                        label: yAxis,
                                                        data: fileData.map(row => parseFloat(row[yAxis])),
                                                        backgroundColor: 'rgba(75, 192, 192, 0.6)',
                                                        borderColor: 'rgba(75, 192, 192, 1)',
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
                                                                    'rgba(255, 99, 132, 0.6)',
                                                                    'rgba(54, 162, 235, 0.6)',
                                                                    'rgba(255, 206, 86, 0.6)',
                                                                    'rgba(75, 192, 192, 0.6)',
                                                                    'rgba(153, 102, 255, 0.6)',
                                                                    'rgba(255, 159, 64, 0.6)',
                                                                ],
                                                                borderColor: [
                                                                    'rgba(255, 99, 132, 1)',
                                                                    'rgba(54, 162, 235, 1)',
                                                                    'rgba(255, 206, 86, 1)',
                                                                    'rgba(75, 192, 192, 1)',
                                                                    'rgba(153, 102, 255, 1)',
                                                                    'rgba(255, 159, 64, 1)',
                                                                ],
                                                                borderWidth: 1,
                                                            },
                                                        ],
                                                    };
                                                    return <Pie options={chartOptions} data={pieData} />;
                                                case '3DBar':
                                                    return <ThreeDChart data={fileData} xAxis={xAxis} yAxis={yAxis} />;
                                                default:
                                                    return <p>Select a chart type and axes to generate a chart.</p>;
                                            }
                                        })()
                                    ) : (selectedFileId ? (
                                        <p>Select axes to generate a chart.</p>
                                    ) : (
                                        <p>Please upload a file and select one from history to generate charts.</p>
                                    ))}
                                </div>
                                <button className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                                    Generate New Chart
                                </button>
                            </div>
                        </div>

                        {/* AI Insights Section */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg col-span-1 md:col-span-2 lg:col-span-1">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Insights & Summaries</h3>
                                <div className="bg-gray-100 h-64 rounded-lg p-4 text-gray-700 overflow-auto">
                                    <p className="mb-2">Here are some insights based on your uploaded data:</p>
                                    <ul className="list-disc list-inside">
                                        <li>Detected a 15% increase in Q3 sales compared to Q2 in 'Sales_Report_Q3.xlsx'.</li>
                                        <li>Identified top 3 customer pain points from 'Customer_Feedback.xlsx': Shipping delays, product quality, and customer support response time.</li>
                                        <li>Financial trends suggest a potential revenue growth of 8% in the next quarter.</li>
                                    </ul>
                                    <p className="mt-4 text-sm text-gray-500">More detailed AI reports are available upon request.</p>
                                </div>
                                <button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded">
                                    Get More Insights
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default UserDashboard; 