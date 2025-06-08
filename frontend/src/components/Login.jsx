import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../redux/slices/userSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(null);

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user, loading, error } = useSelector((state) => state.user);

    useEffect(() => {
        if (error) {
            setLocalError(error);
        } else {
            setLocalError(null);
        }
    }, [error]);

    useEffect(() => {
        if (user) {
            console.log('User logged in:', user);
            if (user.isAdmin === true) {
                console.log('User is admin, redirecting to admin dashboard');
                navigate('/admin', { replace: true });
            } else {
                console.log('User is regular user, redirecting to home');
                navigate('/', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        try {
            console.log('Attempting login with:', { email });
            const result = await dispatch(login({ email, password })).unwrap();
            console.log('Login successful, result:', result);
        } catch (err) {
            console.error('Login error:', err);
            setLocalError('Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-center">Login</h2>
                {localError && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg">
                        {localError}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full px-3 py-2 mt-1 border rounded-md shadow-sm appearance-none focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign in'}
                    </button>
                </form>
                <div className="text-sm text-center space-y-2">
                    <p className="text-gray-600">Admin Login: admin@example.com / admin123</p>
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-blue-600 hover:text-blue-800">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login; 