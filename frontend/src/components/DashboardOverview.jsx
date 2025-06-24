import React from 'react';
import { Link } from 'react-router-dom';

const DashboardOverview = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Welcome Section */}
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden mb-8 border border-white/30 transform hover:scale-[1.02] transition-all duration-500">
                    <div className="p-12 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-20 translate-x-20 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-white/5 rounded-full animate-pulse delay-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center mb-8">
                                <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center mr-8 backdrop-blur-sm shadow-2xl">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-5xl font-bold text-white mb-3 drop-shadow-lg">Welcome to Your Dashboard</h2>
                                    <p className="text-indigo-100 text-xl font-medium">Transform your data into actionable insights with our powerful analytics platform.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Files Card */}
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-105 border border-white/30 group">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Total Files</p>
                                <p className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mt-3">12</p>
                                <p className="text-sm text-green-600 font-bold mt-3 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    +2 this week
                                </p>
                            </div>
                            <div className="p-5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '75%'}}></div>
                        </div>
                    </div>

                    {/* Analyses Card */}
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-105 border border-white/30 group">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">Analyses</p>
                                <p className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mt-3">8</p>
                                <p className="text-sm text-green-600 font-bold mt-3 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    +3 this month
                                </p>
                            </div>
                            <div className="p-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-purple-500 to-pink-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '60%'}}></div>
                        </div>
                    </div>

                    {/* AI Insights Card */}
                    <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-105 border border-white/30 group">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">AI Insights</p>
                                <p className="text-5xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mt-3">5</p>
                                <p className="text-sm text-green-600 font-bold mt-3 flex items-center">
                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                    </svg>
                                    +1 today
                                </p>
                            </div>
                            <div className="p-5 bg-gradient-to-br from-green-500 to-emerald-600 rounded-3xl shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-3 rounded-full transition-all duration-1000 ease-out" style={{width: '40%'}}></div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                    {/* Upload Card */}
                    <Link to="/dashboard/upload" className="group bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-105 border border-white/30">
                        <div className="flex items-center mb-6">
                            <div className="p-5 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-3xl mr-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-indigo-600 transition-colors duration-300">Upload New File</h3>
                                <p className="text-gray-600 mt-2 font-medium">Upload Excel files for analysis</p>
                            </div>
                        </div>
                        <div className="flex items-center text-indigo-600 font-bold group-hover:text-indigo-700 transition-colors duration-300">
                            <span>Get Started</span>
                            <svg className="w-6 h-6 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </Link>

                    {/* Analysis Card */}
                    <Link to="/dashboard/analyze" className="group bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-105 border border-white/30">
                        <div className="flex items-center mb-6">
                            <div className="p-5 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl mr-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">View Analysis</h3>
                                <p className="text-gray-600 mt-2 font-medium">Explore your data visualizations</p>
                            </div>
                        </div>
                        <div className="flex items-center text-purple-600 font-bold group-hover:text-purple-700 transition-colors duration-300">
                            <span>Explore Data</span>
                            <svg className="w-6 h-6 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </Link>

                    {/* AI Insights Card */}
                    <Link to="/dashboard/ai-insights" className="group bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 transform transition-all duration-500 hover:shadow-3xl hover:scale-105 border border-white/30">
                        <div className="flex items-center mb-6">
                            <div className="p-5 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mr-6 shadow-xl group-hover:shadow-2xl transition-all duration-500 transform group-hover:scale-110">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-gray-900 group-hover:text-green-600 transition-colors duration-300">AI Insights</h3>
                                <p className="text-gray-600 mt-2 font-medium">Get AI-powered data insights</p>
                            </div>
                        </div>
                        <div className="flex items-center text-green-600 font-bold group-hover:text-green-700 transition-colors duration-300">
                            <span>Discover Insights</span>
                            <svg className="w-6 h-6 ml-3 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </div>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/30">
                    <div className="p-8 border-b border-gray-100/50">
                        <div className="flex items-center justify-between">
                            <h3 className="text-3xl font-bold text-gray-900 flex items-center">
                                <div className="p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-6 shadow-xl">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                                </div>
                            Recent Activity
                        </h3>
                            <button className="text-indigo-600 hover:text-indigo-700 font-bold transition-colors duration-300 bg-white/50 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg hover:shadow-xl">
                                View All
                            </button>
                        </div>
                    </div>
                    <div className="p-8">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-3xl border border-indigo-100/50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                                <div className="flex items-center">
                                    <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl mr-6 shadow-xl">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">New file uploaded</p>
                                        <p className="text-gray-600 font-medium">sales_data.xlsx • 2.4 MB</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 font-medium">2 hours ago</span>
                                    <div className="w-3 h-3 bg-green-400 rounded-full mt-2 ml-auto shadow-lg"></div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-3xl border border-purple-100/50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                                <div className="flex items-center">
                                    <div className="p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl mr-6 shadow-xl">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">Analysis completed</p>
                                        <p className="text-gray-600 font-medium">Monthly Sales Report • 3 charts generated</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 font-medium">5 hours ago</span>
                                    <div className="w-3 h-3 bg-blue-400 rounded-full mt-2 ml-auto shadow-lg"></div>
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-3xl border border-green-100/50 hover:shadow-lg transition-all duration-300 transform hover:scale-[1.02]">
                                <div className="flex items-center">
                                    <div className="p-4 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl mr-6 shadow-xl">
                                        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-gray-900">AI Insights generated</p>
                                        <p className="text-gray-600 font-medium">Sales Trend Analysis • 5 insights found</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="text-sm text-gray-500 font-medium">1 day ago</span>
                                    <div className="w-3 h-3 bg-yellow-400 rounded-full mt-2 ml-auto shadow-lg"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview; 