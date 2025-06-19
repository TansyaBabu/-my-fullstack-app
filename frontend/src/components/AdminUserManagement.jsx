import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const AdminUserManagement = () => {
  const { user } = useSelector((state) => state.user);
  const [users, setUsers] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [modal, setModal] = useState({ open: false, type: '', user: null });

  const fetchUsers = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/users?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setUsers(res.data.users);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.token) {
      fetchUsers(1);
    }
    // eslint-disable-next-line
  }, [user]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchUsers(newPage);
    }
  };

  const openModal = (type, u) => setModal({ open: true, type, user: u });
  const closeModal = () => setModal({ open: false, type: '', user: null });

  const handleDelete = async () => {
    if (!modal.user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.delete(`/api/users/${modal.user._id}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess('User deleted successfully.');
      fetchUsers(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete user');
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  const handleRoleChange = async () => {
    if (!modal.user) return;
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.put(`/api/users/${modal.user._id}`, {
        isAdmin: !modal.user.isAdmin,
      }, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setSuccess(`User role updated to ${modal.user.isAdmin ? 'User' : 'Admin'}.`);
      fetchUsers(page);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user role');
    } finally {
      setLoading(false);
      closeModal();
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}
      {success && <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-lg">{success}</div>}
      <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8">Loading...</td></tr>
            ) : users.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-500">No users found.</td></tr>
            ) : (
              users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">{u.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${u.isAdmin ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>{u.isAdmin ? 'Admin' : 'User'}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    {/* Prevent self-delete and self-demote */}
                    {u._id !== user._id && (
                      <>
                        <button
                          className="text-blue-600 hover:text-blue-900 font-semibold px-2 py-1 rounded transition-colors"
                          onClick={() => openModal('role', u)}
                        >
                          {u.isAdmin ? 'Demote to User' : 'Promote to Admin'}
                        </button>
                        <button
                          className="text-red-600 hover:text-red-900 font-semibold px-2 py-1 rounded transition-colors ml-2"
                          onClick={() => openModal('delete', u)}
                        >
                          Delete
                        </button>
                      </>
                    )}
                    {u._id === user._id && (
                      <span className="text-gray-400 italic">(You)</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination Controls */}
      <div className="flex justify-center items-center mt-6 space-x-2">
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
          onClick={() => handlePageChange(page - 1)}
          disabled={page === 1}
        >
          Prev
        </button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx + 1}
            className={`px-3 py-1 rounded font-semibold ${page === idx + 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'}`}
            onClick={() => handlePageChange(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
        <button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50"
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
      {/* Confirmation Modal */}
      {modal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-sm w-full">
            <h3 className="text-lg font-bold mb-4">
              {modal.type === 'delete' ? 'Delete User' : 'Change User Role'}
            </h3>
            <p className="mb-6">
              {modal.type === 'delete' ? (
                <>Are you sure you want to <span className="font-semibold text-red-600">delete</span> user <span className="font-semibold">{modal.user?.username}</span>? This action cannot be undone.</>
              ) : (
                <>Are you sure you want to {modal.user?.isAdmin ? 'demote' : 'promote'} <span className="font-semibold">{modal.user?.username}</span> to {modal.user?.isAdmin ? 'User' : 'Admin'}?</>
              )}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                onClick={closeModal}
                disabled={loading}
              >
                Cancel
              </button>
              {modal.type === 'delete' ? (
                <button
                  className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                  onClick={handleDelete}
                  disabled={loading}
                >
                  Delete
                </button>
              ) : (
                <button
                  className="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
                  onClick={handleRoleChange}
                  disabled={loading}
                >
                  {modal.user?.isAdmin ? 'Demote to User' : 'Promote to Admin'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUserManagement; 