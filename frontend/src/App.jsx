import { Provider } from 'react-redux';
import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import AdminRoute from './components/AdminRoute';
import AiInsightsDisplay from './components/AiInsightsDisplay';
import AnalysisHistoryDisplay from './components/AnalysisHistoryDisplay';
import AnalyzeData from './components/AnalyzeData';
import ChatWithFile from './components/ChatWithFile';
import DashboardLayout from './components/DashboardLayout';
import DashboardOverview from './components/DashboardOverview';
import HomePage from './components/HomePage';
import Login from './components/Login';
import PrivateRoute from './components/PrivateRoute';
import Register from './components/Register';
import Settings from './components/Settings';
import UploadExcel from './components/UploadExcel';
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
                    {/* Public Home Page */}
                    <Route path="/" element={<HomePage />} />
                    {/* Authenticated dashboard and features */}
                    <Route
                        path="/dashboard/*"
                        element={
                            <PrivateRoute>
                                <DashboardLayout />
                            </PrivateRoute>
                        }
                    >
                        <Route index element={<DashboardOverview />} />
                        <Route path="overview" element={<DashboardOverview />} />
                        <Route path="upload" element={<UploadExcel />} />
                        <Route path="analyze" element={<AnalyzeData />} />
                        <Route path="history" element={<AnalysisHistoryDisplay />} />
                        <Route path="ai-insights" element={<AiInsightsDisplay />} />
                        <Route path="settings" element={<Settings />} />
                        <Route path="chat-with-file" element={<ChatWithFile />} />
                    </Route>
                    <Route path="*" element={<HomePage />} />
                </Routes>
            </Router>
        </Provider>
    );
}

export default App;
