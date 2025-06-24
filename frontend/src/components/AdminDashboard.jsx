import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logout } from '../redux/slices/userSlice';
import AdminFileManagement from './AdminFileManagement';
import AdminUserManagement from './AdminUserManagement';

const AdminDashboard = () => {
  const [showFileManagement, setShowFileManagement] = useState(false);
  const { user } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ totalUsers: 0, totalAnalyses: 0, totalFiles: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setStats(res.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch statistics');
      } finally {
        setLoading(false);
      }
    };
    if (user && user.isAdmin && user.token) {
      fetchStats();
    }
  }, [user]);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/', { replace: true });
  };

  if (showFileManagement) {
    return (
      <div className="dashboard-container py-8 px-4 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <button
            className="dashboard-button mb-6"
            onClick={() => setShowFileManagement(false)}
          >
            ← Back to Dashboard
          </button>
          <AdminFileManagement />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-indigo-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back, <span className="font-semibold text-indigo-600">{user?.username || 'Admin'}</span>!</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className="inline-block w-10 h-10 rounded-full bg-indigo-200 flex items-center justify-center text-xl font-bold text-indigo-700">
              {user?.username?.[0]?.toUpperCase() || 'A'}
            </span>
            <button
              className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold shadow transition"
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition">
            <div className="bg-indigo-100 p-3 rounded-full mb-3">
              <svg className="w-7 h-7 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87m9-4V6a4 4 0 00-8 0v4m8 0a4 4 0 01-8 0" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-indigo-700">{loading ? '...' : stats.totalUsers}</div>
            <div className="text-gray-500 mt-1">Registered Users</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition">
            <div className="bg-purple-100 p-3 rounded-full mb-3">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-purple-700">{loading ? '...' : stats.totalAnalyses}</div>
            <div className="text-gray-500 mt-1">Completed Analyses</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition">
            <div className="bg-green-100 p-3 rounded-full mb-3">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m4 0h-1v4h-1m-4 0h-1v-4h-1" />
              </svg>
            </div>
            <div className="text-3xl font-bold text-green-700">{loading ? '...' : stats.totalFiles}</div>
            <div className="text-gray-500 mt-1">Uploaded Files</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center hover:shadow-2xl transition">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <svg className="w-7 h-7 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <span className="dashboard-badge dashboard-badge-success text-green-700 bg-green-100 px-3 py-1 rounded-full text-sm font-semibold">All systems operational</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition">
            <div>
              <h3 className="text-lg font-bold text-indigo-700 mb-2">File Management</h3>
              <p className="text-gray-500 mb-4">View, manage, or delete uploaded files from all users.</p>
            </div>
            <button className="dashboard-button bg-indigo-600 text-white hover:bg-indigo-700 transition" onClick={() => setShowFileManagement(true)}>
              Go to File Management
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition">
            <div>
              <h3 className="text-lg font-bold text-purple-700 mb-2">View Analytics</h3>
              <p className="text-gray-500 mb-4">Monitor platform analytics and user activity.</p>
            </div>
            <button 
              className="dashboard-button bg-purple-600 text-white hover:bg-purple-700 transition"
              onClick={() => navigate('/admin/analytics')}
            >
              Go to Analytics
            </button>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between hover:shadow-2xl transition">
            <div>
              <h3 className="text-lg font-bold text-blue-700 mb-2">System Settings</h3>
              <p className="text-gray-500 mb-4">Configure system preferences and security settings.</p>
            </div>
            <button className="dashboard-button bg-blue-600 text-white hover:bg-blue-700 transition">Go to Settings</button>
          </div>
        </div>

        {/* User Management */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <AdminUserManagement />
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;