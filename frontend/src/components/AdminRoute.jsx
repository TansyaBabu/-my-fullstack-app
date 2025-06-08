import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
    const { user } = useSelector((state) => state.user);

    // Check if user exists and is admin
    if (user && user.isAdmin) {
        return <Outlet />;
    } else if (user) {
        // User is logged in but not admin, redirect to user dashboard or home
        return <Navigate to="/" replace />;
    } else {
        // User is not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }
};

export default AdminRoute; 