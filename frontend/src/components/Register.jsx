import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../redux/slices/userSlice';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [localError, setLocalError] = useState(null);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);

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
        if (registrationSuccess) {
            setUsername('');
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setTimeout(() => {
                navigate('/login', {
                    state: {
                        message: 'Registration successful! Please log in to continue.'
                    }
                });
            }, 1500);
        }
    }, [registrationSuccess, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError(null);
        if (!username || !email || !password || !confirmPassword) {
            setLocalError('All fields are required');
            return;
        }
        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }
        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters long');
            return;
        }
        try {
            const result = await dispatch(register({ username, email, password })).unwrap();
            if (!result || !result.token) {
                throw new Error('Invalid response from server');
            }
            setRegistrationSuccess(true);
        } catch (err) {
            setLocalError(err.message || 'Registration failed. Please try again.');
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
                    <h2 className="text-3xl font-extrabold text-teal-700 mt-4 mb-2">Create Your Account</h2>
                </div>
                {registrationSuccess && (
                    <div className="p-3 text-sm text-green-700 bg-green-100 rounded-lg text-center">
                        Registration successful! Redirecting to login...
                    </div>
                )}
                {localError && (
                    <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg text-center">
                        {localError}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-teal-700">Username</label>
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            className="w-full px-3 py-2 mt-1 border border-teal-200 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white/80"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter your username"
                        />
                    </div>
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
                            required
                            className="w-full px-3 py-2 mt-1 border border-teal-200 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white/80"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-teal-700">Confirm Password</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            required
                            className="w-full px-3 py-2 mt-1 border border-teal-200 rounded-md shadow-sm appearance-none focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-teal-400 bg-white/80"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirm your password"
                        />
                    </div>
                    <button
                        type="submit"
                        className={`w-full px-4 py-2 text-white rounded-md font-bold shadow focus:outline-none focus:ring-2 focus:ring-offset-2 transition ${loading ? 'bg-teal-300 cursor-not-allowed' : 'bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 focus:ring-teal-400'}`}
                        disabled={loading}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </form>
                <div className="text-sm text-center text-gray-600 mt-4">
                    <p>
                        Already have an account?{' '}
                        <Link to="/login" className="text-teal-600 hover:text-teal-800 font-semibold">
                            Sign in here
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register; 