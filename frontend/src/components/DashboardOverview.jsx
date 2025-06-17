import React from 'react';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4">
            {/* Welcome Section */}
            <div className="max-w-7xl mx-auto">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
                    <div className="p-8 bg-gradient-to-r from-indigo-500 to-purple-600">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome to Your Dashboard</h2>
                        <p className="text-indigo-100">Manage your data, create visualizations, and gain insights from your analytics.</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Files Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Total Files</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
                            </div>
                            <div className="p-3 bg-indigo-100 rounded-lg">
                                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Analyses Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">Analyses</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">8</p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600">AI Insights</p>
                                <p className="text-2xl font-bold text-gray-900 mt-1">5</p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Upload Card */}
                    <Link to="/upload" className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl hover:scale-105">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Upload New File</h3>
                        </div>
                        <p className="text-gray-600">Upload Excel files for analysis</p>
                    </Link>

                    {/* Analysis Card */}
                    <Link to="/analyze" className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl hover:scale-105">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">View Analysis</h3>
                        </div>
                        <p className="text-gray-600">Explore your data visualizations</p>
                    </Link>

                    {/* AI Insights Card */}
                    <Link to="/insights" className="bg-white rounded-xl shadow-lg p-6 transform transition-all duration-200 hover:shadow-xl hover:scale-105">
                        <div className="flex items-center mb-4">
                            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-lg mr-4">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
                        </div>
                        <p className="text-gray-600">Get AI-powered data insights</p>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Recent Activity
                        </h3>
                    </div>
                    <div className="p-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="p-2 bg-indigo-100 rounded-lg mr-4">
                                        <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">New file uploaded</p>
                                        <p className="text-sm text-gray-500">sales_data.xlsx</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">2 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="p-2 bg-purple-100 rounded-lg mr-4">
                                        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Analysis completed</p>
                                        <p className="text-sm text-gray-500">Monthly Sales Report</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">5 hours ago</span>
                            </div>
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                    <div className="p-2 bg-green-100 rounded-lg mr-4">
                                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">AI Insights generated</p>
                                        <p className="text-sm text-gray-500">Sales Trend Analysis</p>
                                    </div>
                                </div>
                                <span className="text-sm text-gray-500">1 day ago</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview; 