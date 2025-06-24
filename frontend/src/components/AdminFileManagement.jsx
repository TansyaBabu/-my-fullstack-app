import axios from 'axios';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip
} from 'chart.js';
import React, { useEffect, useState } from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';
import { useSelector } from 'react-redux';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminFileManagement = () => {
  const { user } = useSelector((state) => state.user);
  const [files, setFiles] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewFile, setViewFile] = useState(null);
  const [viewFileLoading, setViewFileLoading] = useState(false);
  const [viewFileError, setViewFileError] = useState(null);

  // Analysis/Chart management for admins
  const [analyses, setAnalyses] = useState([]);
  const [analysesLoading, setAnalysesLoading] = useState(false);
  const [analysesError, setAnalysesError] = useState(null);
  const [chartModalOpen, setChartModalOpen] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [chartMeta, setChartMeta] = useState(null);
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState(null);

  // Add state for delete loading and error
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  // Add per-row loading state for file and analysis deletes
  const [fileDeleteLoading, setFileDeleteLoading] = useState({});
  const [analysisDeleteLoading, setAnalysisDeleteLoading] = useState({});

  // Add state for per-file chart modal
  const [chartsModalOpen, setChartsModalOpen] = useState(false);
  const [chartsForFile, setChartsForFile] = useState([]);
  const [chartsFileName, setChartsFileName] = useState('');
  const [selectedChart, setSelectedChart] = useState(null);

  const fetchFiles = async (pageNum = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`/api/upload/all?page=${pageNum}&limit=10`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setFiles(res.data.files);
      setPage(res.data.page);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch files');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all analyses for admin
  const fetchAnalyses = async () => {
    setAnalysesLoading(true);
    setAnalysesError(null);
    try {
      const res = await axios.get('/api/analysis/all', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setAnalyses(res.data);
    } catch (err) {
      setAnalysesError(err.response?.data?.message || 'Failed to fetch analyses');
    } finally {
      setAnalysesLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.token) {
      fetchFiles(1);
      if (user.isAdmin) fetchAnalyses();
    }
    // eslint-disable-next-line
  }, [user]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      fetchFiles(newPage);
    }
  };

  const handleView = async (fileId) => {
    setViewFileLoading(true);
    setViewFileError(null);
    setViewModalOpen(true);
    try {
      const res = await axios.get(`/api/upload/${fileId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setViewFile(res.data);
    } catch (err) {
      setViewFileError(err.response?.data?.message || 'Failed to fetch file details');
      setViewFile(null);
    } finally {
      setViewFileLoading(false);
    }
  };

  const closeModal = () => {
    setViewModalOpen(false);
    setViewFile(null);
    setViewFileError(null);
  };

  // Chart view logic
  const handleViewChart = async (analysis) => {
    setChartLoading(true);
    setChartError(null);
    setChartModalOpen(true);
    setChartData(null);
    setChartMeta(null);
    try {
      const res = await axios.get(`/api/analysis/data/${analysis.fileId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setChartData(res.data.data);
      setChartMeta({
        _id: analysis._id,
        chartType: analysis.chartType,
        xAxis: analysis.xAxis,
        yAxis: analysis.yAxis,
        fileName: analysis.fileName,
        user: analysis.userId,
      });
    } catch (err) {
      setChartError(err.response?.data?.message || 'Failed to fetch chart data');
      setChartMeta({
        _id: analysis._id,
        chartType: analysis.chartType,
        xAxis: analysis.xAxis,
        yAxis: analysis.yAxis,
        fileName: analysis.fileName,
        user: analysis.userId,
      });
    } finally {
      setChartLoading(false);
    }
  };

  const closeChartModal = () => {
    setChartModalOpen(false);
    setChartData(null);
    setChartMeta(null);
    setChartError(null);
  };

  // Prepare chart.js data
  const renderChart = () => {
    if (!chartData || !chartMeta) return null;
    const { chartType, xAxis, yAxis } = chartMeta;
    const labels = chartData.map((row) => row[xAxis]);
    const values = chartData.map((row) => row[yAxis]);
    const data = {
      labels,
      datasets: [
        {
          label: `${yAxis} vs ${xAxis}`,
          data: values,
          backgroundColor: 'rgba(99, 102, 241, 0.5)',
          borderColor: 'rgba(99, 102, 241, 1)',
          borderWidth: 1,
        },
      ],
    };
    if (chartType === 'Bar') return <Bar data={data} />;
    if (chartType === 'Line') return <Line data={data} />;
    if (chartType === 'Pie') return <Pie data={data} />;
    if (chartType === 'Scatter') {
      const scatterData = {
        datasets: [
          {
            label: `${yAxis} vs ${xAxis}`,
            data: chartData.map((row) => ({ x: row[xAxis], y: row[yAxis] })),
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
          },
        ],
      };
      return <Scatter data={scatterData} />;
    }
    // Default fallback
    return <Bar data={data} />;
  };

  // File delete handler
  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    setFileDeleteLoading((prev) => ({ ...prev, [fileId]: true }));
    try {
      await axios.delete(`/api/upload/${fileId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await fetchFiles(page);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete file');
    } finally {
      setFileDeleteLoading((prev) => ({ ...prev, [fileId]: false }));
    }
  };

  // Update analysis delete handler to be per-row
  const handleDeleteAnalysis = async (analysisId) => {
    if (!window.confirm('Are you sure you want to delete this chart/analysis?')) return;
    setAnalysisDeleteLoading((prev) => ({ ...prev, [analysisId]: true }));
    setDeleteError(null);
    try {
      await axios.delete(`/api/analysis/${analysisId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      await fetchAnalyses();
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Failed to delete analysis');
    } finally {
      setAnalysisDeleteLoading((prev) => ({ ...prev, [analysisId]: false }));
    }
  };

  const handleOpenChartsModal = (fileId) => {
    const file = files.find(f => f.id === fileId);
    setChartsFileName(file?.fileName || '');
    const fileCharts = analyses.filter(a => a.fileId === fileId);
    setChartsForFile(fileCharts);
    setChartsModalOpen(true);
    setSelectedChart(null);
  };

  const handleCloseChartsModal = () => {
    setChartsModalOpen(false);
    setChartsForFile([]);
    setSelectedChart(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-extrabold text-indigo-800 mb-8">File Management</h2>
        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{error}</div>}

        {/* File Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-x-auto mb-10">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-indigo-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">File Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Uploader</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Upload Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Data Size</th>
                <th className="px-6 py-3 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan={5} className="text-center py-8">Loading...</td></tr>
              ) : files.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-8 text-gray-500">No files found.</td></tr>
              ) : (
                files.map((f) => (
                  <tr key={f.id} className="hover:bg-indigo-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold">{f.fileName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {f.uploader ? (
                        <span className="inline-flex items-center space-x-2">
                          <span className="inline-block w-7 h-7 rounded-full bg-indigo-200 text-indigo-700 font-bold flex items-center justify-center">
                            {f.uploader.username?.[0]?.toUpperCase() || 'U'}
                          </span>
                          <span>
                            <span className="font-semibold text-indigo-700">{f.uploader.username}</span>
                            <div className="text-xs text-gray-500">{f.uploader?.email}</div>
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-400 italic">Unknown</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(f.uploadDate).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{f.dataSize}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-3 py-1 rounded transition-colors shadow"
                        onClick={() => handleView(f.id)}
                      >
                        View
                      </button>
                      <button
                        className="bg-green-100 text-green-600 hover:bg-green-200 font-semibold px-3 py-1 rounded transition-colors ml-2"
                        onClick={() => handleOpenChartsModal(f.id)}
                      >
                        View Chart(s)
                      </button>
                      <button
                        className="bg-red-100 text-red-600 hover:bg-red-200 font-semibold px-3 py-1 rounded transition-colors ml-2"
                        onClick={() => handleDeleteFile(f.id)}
                        disabled={fileDeleteLoading[f.id]}
                      >
                        {fileDeleteLoading[f.id] ? 'Deleting...' : 'Delete'}
                      </button>
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

        {/* User-Created Charts Section */}
        {/* Removed: Now handled per file */}

        {/* View Modal */}
        {viewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={closeModal}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">File Preview: {viewFile?.fileName}</h3>
              {viewFileLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : viewFileError ? (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{viewFileError}</div>
              ) : viewFile && viewFile.data && viewFile.data.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {Object.keys(viewFile.data[0]).map((col) => (
                          <th key={col} className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {viewFile.data.slice(0, 5).map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((val, i) => (
                            <td key={i} className="px-4 py-2 whitespace-nowrap">{val}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="text-xs text-gray-500 mt-2">Showing first 5 rows</div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No data available for this file.</div>
              )}
            </div>
          </div>
        )}

        {/* Chart Modal */}
        {chartModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={closeChartModal}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">Chart Preview: {chartMeta?.fileName}</h3>
              <div className="mb-2 text-sm text-gray-500">
                {chartMeta?.user && (
                  <span>User: <span className="font-semibold text-indigo-700">{chartMeta.user.username}</span> ({chartMeta.user.email})</span>
                )}
              </div>
              {chartLoading ? (
                <div className="text-center py-8">Loading...</div>
              ) : chartError === 'File not found' ? (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex flex-col items-center">
                  <span>The original data file for this chart is missing. The chart cannot be displayed.</span>
                  <button
                    className="mt-4 bg-red-600 text-white hover:bg-red-700 font-semibold px-4 py-2 rounded shadow"
                    onClick={() => handleDeleteAnalysis(chartMeta?._id)}
                    disabled={analysisDeleteLoading[chartMeta?._id]}
                  >
                    {analysisDeleteLoading[chartMeta?._id] ? 'Deleting...' : 'Delete Chart'}
                  </button>
                  {deleteError && <div className="mt-2 text-red-600">{deleteError}</div>}
                </div>
              ) : chartError ? (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">{chartError}</div>
              ) : chartData && chartMeta ? (
                <div className="overflow-x-auto">
                  {renderChart()}
                  <div className="text-xs text-gray-500 mt-2">Chart type: {chartMeta.chartType}, X: {chartMeta.xAxis}, Y: {chartMeta.yAxis}</div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No chart data available.</div>
              )}
            </div>
          </div>
        )}

        {/* Per-file charts modal */}
        {chartsModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                onClick={handleCloseChartsModal}
              >
                &times;
              </button>
              <h3 className="text-xl font-bold mb-4">Charts for: {chartsFileName}</h3>
              {chartsForFile.length === 0 ? (
                <div className="text-center text-gray-500">No charts found for this file.</div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 mb-4">
                  <thead className="bg-indigo-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Chart Type</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">X Axis</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Y Axis</th>
                      <th className="px-4 py-2 text-left text-xs font-bold text-indigo-700 uppercase tracking-wider">Date</th>
                      <th className="px-4 py-2 text-center text-xs font-bold text-indigo-700 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {chartsForFile.map((a) => (
                      <tr key={a._id}>
                        <td className="px-4 py-2 whitespace-nowrap">{a.chartType}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{a.xAxis}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{a.yAxis}</td>
                        <td className="px-4 py-2 whitespace-nowrap">{new Date(a.analysisDate).toLocaleString()}</td>
                        <td className="px-4 py-2 whitespace-nowrap text-center">
                          <button
                            className="bg-indigo-600 text-white hover:bg-indigo-700 font-semibold px-3 py-1 rounded transition-colors shadow mr-2"
                            onClick={() => setSelectedChart(a)}
                          >
                            View
                          </button>
                          <button
                            className="bg-red-100 text-red-600 hover:bg-red-200 font-semibold px-3 py-1 rounded transition-colors"
                            onClick={() => handleDeleteAnalysis(a._id)}
                            disabled={analysisDeleteLoading[a._id]}
                          >
                            {analysisDeleteLoading[a._id] ? 'Deleting...' : 'Delete'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {/* Chart view modal inside charts modal */}
              {selectedChart && (
                <div className="mb-4 p-4 border rounded-lg bg-indigo-50">
                  <h4 className="font-bold mb-2">Chart Preview</h4>
                  <button className="mb-2 text-indigo-600 underline" onClick={() => setSelectedChart(null)}>Back to list</button>
                  {/* Reuse chart rendering logic */}
                  <div className="my-4">
                    {chartLoading ? (
                      <div className="text-center py-8">Loading...</div>
                    ) : chartError === 'File not found' ? (
                      <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg flex flex-col items-center">
                        <span>The original data file for this chart is missing. The chart cannot be displayed.</span>
                        <button
                          className="mt-4 bg-red-600 text-white hover:bg-red-700 font-semibold px-4 py-2 rounded shadow"
                          onClick={() => handleDeleteAnalysis(selectedChart._id)}
                          disabled={analysisDeleteLoading[selectedChart._id]}
                        >
                          {analysisDeleteLoading[selectedChart._id] ? 'Deleting...' : 'Delete Chart'}
                        </button>
                        {deleteError && <div className="mt-2 text-red-600">{deleteError}</div>}
                      </div>
                    ) : (
                      <button
                        className="bg-indigo-500 text-white px-3 py-1 rounded mb-2"
                        onClick={() => handleViewChart(selectedChart)}
                      >
                        Load Chart
                      </button>
                    )}
                    {/* Render chart if loaded */}
                    {chartData && chartMeta && chartMeta._id === selectedChart._id && renderChart()}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminFileManagement; 