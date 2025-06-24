import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateUser } from '../redux/slices/userSlice';

// Create axios instance with default config
const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true
});

const Settings = () => {
    const { user } = useSelector((state) => state.user);
    const dispatch = useDispatch();
    
    const [activeTab, setActiveTab] = useState('profile');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    
    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: user?.name || user?.username || '',
        email: user?.email || ''
    });
    
    // Password form state
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    
    // Preferences state
    const [preferences, setPreferences] = useState({
        emailNotifications: true,
        darkMode: false,
        autoSave: true
    });

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        
        try {
            const response = await api.put('/users/profile', profileForm, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            
            dispatch(updateUser(response.data));
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            console.error('Profile update error:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to update profile' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage({ type: '', text: '' });
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setIsLoading(false);
            return;
        }
        
        try {
            await api.put('/users/password', {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            }, {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            });
            
            setPasswordForm({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
            setMessage({ type: 'success', text: 'Password changed successfully!' });
        } catch (error) {
            console.error('Password change error:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Failed to change password' 
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreferenceChange = (key, value) => {
        setPreferences(prev => ({ ...prev, [key]: value }));
        // In a real app, you'd save this to the backend
        localStorage.setItem(`preference_${key}`, value);
    };

    useEffect(() => {
        // Load saved preferences
        const savedPreferences = {};
        Object.keys(preferences).forEach(key => {
            const saved = localStorage.getItem(`preference_${key}`);
            if (saved !== null) {
                savedPreferences[key] = saved === 'true';
            }
        });
        setPreferences(prev => ({ ...prev, ...savedPreferences }));
    }, []);

    useEffect(() => {
        if (preferences.darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [preferences.darkMode]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-100 dark:from-gray-900 dark:to-black py-12 px-4 relative overflow-hidden">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 left-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-rose-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-gradient-to-br from-blue-400/8 to-cyan-400/8 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
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
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-4xl font-bold text-white mb-3 drop-shadow-lg">Settings</h2>
                                    <p className="text-indigo-100 text-xl font-medium">Manage your account and preferences</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/30">
                    {/* Enhanced Tabs */}
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                        <nav className="flex space-x-2">
                            {[
                                { id: 'profile', name: 'Profile', icon: '👤', color: 'from-blue-500 to-indigo-600' },
                                { id: 'password', name: 'Password', icon: '🔒', color: 'from-green-500 to-emerald-600' },
                                { id: 'preferences', name: 'Preferences', icon: '⚙️', color: 'from-purple-500 to-pink-600' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`flex-1 py-4 px-6 rounded-2xl font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                                        activeTab === tab.id
                                            ? `bg-gradient-to-r ${tab.color} text-white shadow-xl shadow-${tab.color.split('-')[1]}-500/25`
                                            : 'bg-white/80 text-gray-600 hover:text-gray-900 hover:bg-white dark:bg-gray-800/50 dark:text-gray-300 dark:hover:bg-gray-700/60 shadow-lg'
                                    }`}
                                >
                                    <div className="flex items-center justify-center">
                                        <span className="text-lg mr-3">{tab.icon}</span>
                                        <span className="font-bold">{tab.name}</span>
                                    </div>
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Message Display */}
                    {message.text && (
                        <div className={`mx-6 mt-6 p-6 rounded-2xl border-2 shadow-lg ${
                            message.type === 'success' 
                                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 text-green-800' 
                                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800'
                        }`}>
                            <div className="flex items-center">
                                <div className={`p-3 rounded-2xl mr-4 shadow-lg ${
                                    message.type === 'success'
                                        ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                                        : 'bg-gradient-to-br from-red-500 to-rose-600'
                                }`}>
                                    {message.type === 'success' ? (
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    )}
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg mb-1">
                                        {message.type === 'success' ? 'Success!' : 'Error'}
                                    </h4>
                                    <p className="font-medium">{message.text}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tab Content */}
                    <div className="p-8">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <form onSubmit={handleProfileUpdate} className="space-y-8">
                                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-blue-900/50 rounded-3xl p-8 border border-blue-200 dark:border-blue-800 shadow-lg">
                                    <div className="flex items-center mb-6">
                                        <div className="p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mr-6 shadow-xl">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mb-2">Profile Information</h3>
                                            <p className="text-blue-700 dark:text-blue-300 font-medium">Update your personal details</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label htmlFor="name" className="block text-sm font-bold text-blue-900 dark:text-blue-200">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                value={profileForm.name}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                                                className="w-full bg-white/80 backdrop-blur-sm border-2 border-blue-200 dark:bg-gray-900/50 dark:border-blue-700 dark:text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-300 shadow-lg"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label htmlFor="email" className="block text-sm font-bold text-blue-900 dark:text-blue-200">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                id="email"
                                                value={profileForm.email}
                                                onChange={(e) => setProfileForm(prev => ({ ...prev, email: e.target.value }))}
                                                className="w-full bg-white/80 backdrop-blur-sm border-2 border-blue-200 dark:bg-gray-900/50 dark:border-blue-700 dark:text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-blue-500/25 focus:border-blue-500 transition-all duration-300 shadow-lg"
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-500/25 ${
                                            isLoading
                                                ? 'bg-gray-400 cursor-not-allowed shadow-lg'
                                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-xl hover:shadow-2xl hover:shadow-blue-500/25'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                Updating Profile...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                                </svg>
                                                Update Profile
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Password Tab */}
                        {activeTab === 'password' && (
                            <form onSubmit={handlePasswordChange} className="space-y-8">
                                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-green-900/50 rounded-3xl p-8 border border-green-200 dark:border-green-800 shadow-lg">
                                    <div className="flex items-center mb-6">
                                        <div className="p-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mr-6 shadow-xl">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mb-2">Change Password</h3>
                                            <p className="text-green-700 dark:text-green-300 font-medium">Secure your account with a new password</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label htmlFor="currentPassword" className="block text-sm font-bold text-green-900 dark:text-green-200">
                                                Current Password
                                            </label>
                                            <input
                                                type="password"
                                                id="currentPassword"
                                                value={passwordForm.currentPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                                                className="w-full bg-white/80 backdrop-blur-sm border-2 border-green-200 dark:bg-gray-900/50 dark:border-green-700 dark:text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 transition-all duration-300 shadow-lg"
                                                required
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label htmlFor="newPassword" className="block text-sm font-bold text-green-900 dark:text-green-200">
                                                    New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="newPassword"
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                    className="w-full bg-white/80 backdrop-blur-sm border-2 border-green-200 dark:bg-gray-900/50 dark:border-green-700 dark:text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 transition-all duration-300 shadow-lg"
                                                    required
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label htmlFor="confirmPassword" className="block text-sm font-bold text-green-900 dark:text-green-200">
                                                    Confirm New Password
                                                </label>
                                                <input
                                                    type="password"
                                                    id="confirmPassword"
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                                    className="w-full bg-white/80 backdrop-blur-sm border-2 border-green-200 dark:bg-gray-900/50 dark:border-green-700 dark:text-white rounded-2xl px-4 py-4 focus:outline-none focus:ring-4 focus:ring-green-500/25 focus:border-green-500 transition-all duration-300 shadow-lg"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-500/25 ${
                                            isLoading
                                                ? 'bg-gray-400 cursor-not-allowed shadow-lg'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl hover:shadow-green-500/25'
                                        }`}
                                    >
                                        {isLoading ? (
                                            <span className="flex items-center">
                                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                                                Changing Password...
                                            </span>
                                        ) : (
                                            <span className="flex items-center">
                                                <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                                Change Password
                                            </span>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}

                        {/* Preferences Tab */}
                        {activeTab === 'preferences' && (
                            <div className="space-y-8">
                                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-gray-800 dark:to-purple-900/50 rounded-3xl p-8 border border-purple-200 dark:border-purple-800 shadow-lg">
                                    <div className="flex items-center mb-6">
                                        <div className="p-4 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl mr-6 shadow-xl">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-purple-900 dark:text-purple-100 mb-2">Application Preferences</h3>
                                            <p className="text-purple-700 dark:text-purple-300 font-medium">Customize your experience</p>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 dark:bg-gray-900/50 dark:border-purple-700 shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl mr-4 shadow-lg">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-200">Email Notifications</h4>
                                                        <p className="text-gray-600 dark:text-gray-400">Receive email updates about your analyses</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handlePreferenceChange('emailNotifications', !preferences.emailNotifications)}
                                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 transform hover:scale-110 ${
                                                        preferences.emailNotifications ? 'bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg shadow-blue-500/25' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                                                            preferences.emailNotifications ? 'translate-x-7' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 dark:bg-gray-900/50 dark:border-purple-700 shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mr-4 shadow-lg">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-200">Dark Mode</h4>
                                                        <p className="text-gray-600 dark:text-gray-400">Use dark theme for the application</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handlePreferenceChange('darkMode', !preferences.darkMode)}
                                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 transform hover:scale-110 ${
                                                        preferences.darkMode ? 'bg-gradient-to-r from-indigo-500 to-purple-600 shadow-lg shadow-purple-500/25' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                                                            preferences.darkMode ? 'translate-x-7' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200 dark:bg-gray-900/50 dark:border-purple-700 shadow-lg">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center">
                                                    <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mr-4 shadow-lg">
                                                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                                        </svg>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-bold text-gray-900 dark:text-gray-200">Auto Save</h4>
                                                        <p className="text-gray-600 dark:text-gray-400">Automatically save your work</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handlePreferenceChange('autoSave', !preferences.autoSave)}
                                                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 transform hover:scale-110 ${
                                                        preferences.autoSave ? 'bg-gradient-to-r from-green-500 to-emerald-600 shadow-lg shadow-green-500/25' : 'bg-gray-300'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-all duration-300 ${
                                                            preferences.autoSave ? 'translate-x-7' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings; 