import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import UserDashboard from './components/UserDashboard';
import store from './redux/store';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/admin" element={<AdminRoute />}>
                        <Route index element={<AdminDashboard />} />
                    </Route>
                    <Route
                        path="/"
                        element={
                            <PrivateRoute>
                                <UserDashboard />
                            </PrivateRoute>
                        }
                    />
                    <Route path="*" element={<PrivateRoute><UserDashboard /></PrivateRoute>} />
                </Routes>
            </Router>
        </Provider>
    );
}

export default App;
