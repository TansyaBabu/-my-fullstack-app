import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const DataCleanerHome = () => {
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useSelector((state) => state.user);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                console.log('User state:', user);
                console.log('User token:', user?.token);
                
                if (!user || !user.token) {
                    console.log('No user or token found');
                    setError('User not authenticated. Please log in again.');
                    setLoading(false);
                    return;
                }
                
                const config = {
                    headers: {
                        Authorization: `Bearer ${user.token}`,
                    },
                };
                console.log('Making API call to /api/upload/files with config:', config);
                const { data } = await axios.get('/api/upload/files', config);
                console.log('API response:', data);
                setFiles(data);
                setLoading(false);
            } catch (err) {
                console.error('API error:', err);
                console.error('Error response:', err.response);
                console.error('Error message:', err.message);
                
                if (err.response?.status === 401) {
                    setError('Authentication failed. Please log in again.');
                } else if (err.response?.status === 500) {
                    setError('Server error. Please try again later.');
                } else {
                    setError(`Failed to fetch files: ${err.response?.data?.message || err.message}`);
                }
                setLoading(false);
            }
        };

        fetchFiles();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-xl font-semibold text-gray-500">Loading files...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-full">
                <div className="text-xl font-semibold text-red-500 bg-red-100 p-4 rounded-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 bg-gradient-to-br from-cyan-500 to-blue-600">
                     <h1 className="text-4xl font-bold text-white drop-shadow-lg">Select a File to Clean</h1>
                     <p className="text-cyan-100 mt-2">Choose one of your uploaded Excel files to start the cleaning and pre-processing workflow.</p>
                </div>
               
                <div className="p-8">
                    {files.length === 0 ? (
                        <div className="text-center py-16">
                            <p className="text-gray-500 text-lg">You haven't uploaded any files yet.</p>
                            <Link to="/dashboard/upload" className="mt-4 inline-block bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold py-3 px-6 rounded-xl hover:scale-105 transform transition-transform duration-300">
                                Upload a File
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {files.map((file) => (
                                <div key={file._id} className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-shadow duration-300 flex flex-col justify-between overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex items-center mb-4">
                                            <div className="mr-4 p-3 rounded-xl bg-cyan-100">
                                                <svg className="w-6 h-6 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                                </svg>
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-800 truncate">{file.fileName}</h3>
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            Uploaded on: {new Date(file.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="bg-gray-50 p-4">
                                        <Link to={`/dashboard/clean/${file._id}`} className="block w-full text-center bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold py-3 px-5 rounded-lg hover:from-cyan-600 hover:to-blue-600 hover:scale-105 transform transition-all duration-300 shadow-md hover:shadow-lg">
                                            Clean & Pre-process
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DataCleanerHome; 