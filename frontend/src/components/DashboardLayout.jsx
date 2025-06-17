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
        return location.pathname === path || location.pathname === `/${path}`;
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Sidebar */}
            <aside className="w-72 bg-white shadow-xl flex flex-col">
                <div className="p-6 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <h2 className="text-2xl font-bold text-white">Excel Analyzer</h2>
                    <p className="text-indigo-100 text-sm mt-1">Data Analysis Platform</p>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                    <Link 
                        to="/overview"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all duration-200 ${
                            isActive('overview') 
                                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="mr-3 text-xl">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link 
                        to="/upload"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all duration-200 ${
                            isActive('upload') 
                                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="mr-3 text-xl">⬆️</span>
                        <span>Upload Excel</span>
                    </Link>
                    <Link 
                        to="/analyze"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all duration-200 ${
                            isActive('analyze') 
                                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="mr-3 text-xl">🔍</span>
                        <span>Analyze Data</span>
                    </Link>
                    <Link 
                        to="/history"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all duration-200 ${
                            isActive('history') 
                                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="mr-3 text-xl">📜</span>
                        <span>History</span>
                    </Link>
                    <Link 
                        to="/ai-insights"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all duration-200 ${
                            isActive('ai-insights') 
                                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="mr-3 text-xl">🧠</span>
                        <span>AI Insights</span>
                    </Link>
                    <Link 
                        to="/settings"
                        className={`flex items-center px-4 py-3 text-gray-700 rounded-lg transition-all duration-200 ${
                            isActive('settings') 
                                ? 'bg-indigo-50 text-indigo-600 font-medium' 
                                : 'hover:bg-gray-50'
                        }`}
                    >
                        <span className="mr-3 text-xl">⚙️</span>
                        <span>Settings</span>
                    </Link>
                </nav>
                <div className="p-6 border-t border-gray-100">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">{user?.username}</p>
                            <p className="text-xs text-gray-500">User Account</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="flex justify-between items-center p-6 bg-white shadow-sm border-b border-gray-100">
                    <h1 className="text-2xl font-bold text-gray-800">User Dashboard</h1>
                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                            <span className="font-medium">Last login:</span> {new Date().toLocaleDateString()}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100 p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout; 