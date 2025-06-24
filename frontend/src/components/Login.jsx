import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { login } from '../redux/slices/userSlice';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [localError, setLocalError] = useState(null);
    const [successMessage, setSuccessMessage] = useState('');

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { user, loading, error } = useSelector((state) => state.user);

    useEffect(() => {
        // Check for registration success message
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
            // Clear the message from location state
            window.history.replaceState({}, document.title);
        }
    }, [location]);

    useEffect(() => {
        if (error) {
            console.log('Login error from Redux:', error);
            setLocalError(error);
        } else {
            setLocalError(null);
        }
    }, [error]);

    useEffect(() => {
        if (user) {
            if (
                user.isAdmin === true &&
                user.email &&
                user.email.toLowerCase() === 'admin@example.com'
            ) {
                navigate('/admin', { replace: true });
            } else {
                navigate('/dashboard', { replace: true });
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        setSuccessMessage('');
        
        if (!email || !password) {
            setLocalError('Please enter both email and password');
            return;
        }

        try {
            console.log('Attempting login with:', { email });
            await dispatch(login({ email, password })).unwrap();
            // No need to navigate here; useEffect will handle redirect
        } catch (err) {
            console.error('Login error:', err);
            setLocalError(err.message || 'Login failed. Please check your credentials and try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-400 via-cyan-200 to-blue-300 px-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-white/60 backdrop-blur-lg rounded-2xl shadow-2xl">
                <div className="flex flex-col items-center mb-4">
                    <span className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-100 shadow">
                        <svg className="w-10 h-10" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <rect width="48" height="48" rx="12" fill="#14b8a6"/>
                            <path d="M14 34L34 14M14 14l20 20" stroke="#fff" strokeWidth="3" strokeLinecap="round"/>
                            <rect x="10" y="10" width="28" height="28" rx="6" stroke="#fff" strokeWidth="2"/>
                        </svg>
                    </span>
                    <h2 className="text-3xl font-extrabold text-teal-700 mt-4 mb-2">Sign in to ExcelVerse</h2>
                </div>
                {successMessage && (
                    <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg text-center">
                        {successMessage}
                    </div>
                )}
                {localError && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg text-center">
                        {localError}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-teal-700">Email address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="w-full px-3 py-2 mt-1 border border-teal-200 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white/80"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Enter your email"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-teal-700">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="current-password"
                            required
                            className="w-full px-3 py-2 mt-1 border border-teal-200 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white/80"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full px-4 py-2 text-white rounded-md font-bold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${loading ? 'bg-teal-300 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 focus:ring-teal-400'}`}
                        disabled={loading}
                    >
                        {loading ? 'Signing In...' : 'Sign in'}
                    </button>
                </form>
                <div className="text-sm text-center space-y-2 mt-4">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-teal-600 hover:text-teal-800 font-semibold">
                            Sign up here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login; 