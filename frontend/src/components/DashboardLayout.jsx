import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { logout } from '../redux/slices/userSlice';

const DashboardLayout = () => {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.user);
    const location = useLocation();

    const handleLogout = () => {
        dispatch(logout());
    };

    const isActive = (path) => {
        return location.pathname === `/dashboard/${path}` || (location.pathname === `/dashboard` && path === 'overview');
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-pink-400/20 to-rose-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Sidebar */}
            <aside className="w-80 bg-white/90 backdrop-blur-2xl shadow-2xl border-r border-white/30 flex flex-col relative z-10">
                <div className="p-8 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12 animate-pulse delay-1000"></div>
                    <div className="relative z-10">
                        <div className="flex items-center mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4 backdrop-blur-sm shadow-lg">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white drop-shadow-lg">ExcelVerse</h2>
                                <p className="text-indigo-100 text-sm font-medium">Data Intelligence Platform</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <nav className="flex-1 px-6 py-8 space-y-3">
                    <Link 
                        to="/dashboard/overview"
                        className={`group flex items-center px-6 py-4 text-gray-700 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                            isActive('overview') 
                                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-2xl shadow-indigo-500/30 scale-105' 
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-indigo-50 hover:shadow-lg'
                        }`}
                    >
                        <div className={`mr-4 p-2 rounded-xl transition-all duration-500 ${
                            isActive('overview') ? 'bg-white/20 shadow-lg' : 'bg-indigo-100 group-hover:bg-indigo-200 group-hover:shadow-md'
                        }`}>
                            <svg className={`w-5 h-5 ${isActive('overview') ? 'text-white' : 'text-indigo-600'} transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <span className="font-semibold transition-all duration-300">{isActive('overview') ? 'Dashboard' : 'Dashboard'}</span>
                        {isActive('overview') && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                    </Link>
                    
                    <Link 
                        to="/dashboard/upload"
                        className={`group flex items-center px-6 py-4 text-gray-700 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                            isActive('upload') 
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-2xl shadow-green-500/30 scale-105' 
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-green-50 hover:shadow-lg'
                        }`}
                    >
                        <div className={`mr-4 p-2 rounded-xl transition-all duration-500 ${
                            isActive('upload') ? 'bg-white/20 shadow-lg' : 'bg-green-100 group-hover:bg-green-200 group-hover:shadow-md'
                        }`}>
                            <svg className={`w-5 h-5 ${isActive('upload') ? 'text-white' : 'text-green-600'} transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                        </div>
                        <span className="font-semibold transition-all duration-300">Upload Excel</span>
                        {isActive('upload') && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                    </Link>
                    
                    <Link 
                        to="/dashboard/analyze"
                        className={`group flex items-center px-6 py-4 text-gray-700 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                            isActive('analyze') 
                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-2xl shadow-purple-500/30 scale-105' 
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-purple-50 hover:shadow-lg'
                        }`}
                    >
                        <div className={`mr-4 p-2 rounded-xl transition-all duration-500 ${
                            isActive('analyze') ? 'bg-white/20 shadow-lg' : 'bg-purple-100 group-hover:bg-purple-200 group-hover:shadow-md'
                        }`}>
                            <svg className={`w-5 h-5 ${isActive('analyze') ? 'text-white' : 'text-purple-600'} transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className="font-semibold transition-all duration-300">Analyze Data</span>
                        {isActive('analyze') && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                    </Link>
                    
                    <Link 
                        to="/dashboard/history"
                        className={`group flex items-center px-6 py-4 text-gray-700 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                            isActive('history') 
                                ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-2xl shadow-orange-500/30 scale-105' 
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-orange-50 hover:shadow-lg'
                        }`}
                    >
                        <div className={`mr-4 p-2 rounded-xl transition-all duration-500 ${
                            isActive('history') ? 'bg-white/20 shadow-lg' : 'bg-orange-100 group-hover:bg-orange-200 group-hover:shadow-md'
                        }`}>
                            <svg className={`w-5 h-5 ${isActive('history') ? 'text-white' : 'text-orange-600'} transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <span className="font-semibold transition-all duration-300">History</span>
                        {isActive('history') && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                    </Link>
                    
                    <Link 
                        to="/dashboard/ai-insights"
                        className={`group flex items-center px-6 py-4 text-gray-700 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                            isActive('ai-insights') 
                                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-2xl shadow-pink-500/30 scale-105' 
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-pink-50 hover:shadow-lg'
                        }`}
                    >
                        <div className={`mr-4 p-2 rounded-xl transition-all duration-500 ${
                            isActive('ai-insights') ? 'bg-white/20 shadow-lg' : 'bg-pink-100 group-hover:bg-pink-200 group-hover:shadow-md'
                        }`}>
                            <svg className={`w-5 h-5 ${isActive('ai-insights') ? 'text-white' : 'text-pink-600'} transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <span className="font-semibold transition-all duration-300">AI Insights</span>
                        {isActive('ai-insights') && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                    </Link>
                    
                    <Link 
                        to="/dashboard/chat-with-file"
                        className={`group flex items-center px-6 py-4 text-gray-700 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                            isActive('chat-with-file') 
                                ? 'bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-2xl shadow-teal-500/30 scale-105' 
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-teal-50 hover:shadow-lg'
                        }`}
                    >
                        <div className={`mr-4 p-2 rounded-xl transition-all duration-500 ${
                            isActive('chat-with-file') ? 'bg-white/20 shadow-lg' : 'bg-teal-100 group-hover:bg-teal-200 group-hover:shadow-md'
                        }`}>
                            <svg className={`w-5 h-5 ${isActive('chat-with-file') ? 'text-white' : 'text-teal-600'} transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <span className="font-semibold transition-all duration-300">Chat with File</span>
                        {isActive('chat-with-file') && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                    </Link>
                    
                    <Link 
                        to="/dashboard/settings"
                        className={`group flex items-center px-6 py-4 text-gray-700 rounded-2xl transition-all duration-500 transform hover:scale-105 hover:shadow-xl ${
                            isActive('settings') 
                                ? 'bg-gradient-to-r from-gray-500 to-slate-500 text-white shadow-2xl shadow-gray-500/30 scale-105' 
                                : 'hover:bg-gradient-to-r hover:from-gray-50 hover:to-slate-50 hover:shadow-lg'
                        }`}
                    >
                        <div className={`mr-4 p-2 rounded-xl transition-all duration-500 ${
                            isActive('settings') ? 'bg-white/20 shadow-lg' : 'bg-gray-100 group-hover:bg-gray-200 group-hover:shadow-md'
                        }`}>
                            <svg className={`w-5 h-5 ${isActive('settings') ? 'text-white' : 'text-gray-600'} transition-all duration-300`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <span className="font-semibold transition-all duration-300">Settings</span>
                        {isActive('settings') && (
                            <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        )}
                    </Link>
                </nav>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full mt-4 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-500 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-red-500/25 shadow-lg hover:shadow-2xl hover:shadow-red-500/25"
                >
                    <div className="flex items-center justify-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Logout
                    </div>
                </button>
                
                <div className="p-6 border-t border-gray-100/50">
                    <div className="flex items-center mb-6 p-4 bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {(user?.name || user?.username)?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-4 flex-1">
                            <p className="text-sm font-semibold text-gray-800">{user?.name || user?.username}</p>
                            <p className="text-xs text-gray-500">Premium User</p>
                        </div>
                        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden relative z-10">
                <header className="flex justify-between items-center p-8 bg-white/80 backdrop-blur-2xl shadow-xl border-b border-white/30">
                    <div>
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent drop-shadow-sm">
                            Welcome to your dashboard
                            <span className="ml-2 font-bold text-indigo-700">{user?.name || user?.username}</span>
                        </h1>
                        <p className="text-gray-600 mt-2 font-medium">Here's what's happening today.</p>
                    </div>
                    <div className="flex items-center space-x-6">
                        <div className="flex items-center space-x-3 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg"></div>
                            <span className="text-sm font-semibold text-gray-700">Online</span>
                        </div>
                        <div className="text-sm text-gray-600 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-xl shadow-lg">
                            <span className="font-semibold">Last login:</span> {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout; 