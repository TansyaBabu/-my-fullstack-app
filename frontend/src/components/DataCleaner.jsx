import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

const api = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
    withCredentials: true,
});

const DataCleaner = () => {
    const { fileId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.user);

    const [fileData, setFileData] = useState(null);
    const [columns, setColumns] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [statusMessage, setStatusMessage] = useState('');
    
    const [activeTool, setActiveTool] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState('');
    const [fillValue, setFillValue] = useState('');

    const fetchFileData = async (currentFileId) => {
        if (!user?.token || !currentFileId) return;
        setIsLoading(true);
        setStatusMessage('');
        try {
            const { data } = await api.get(`/upload/${currentFileId}`, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            setFileData(data.data);
            if (data.data?.length > 0) {
                const columnKeys = Object.keys(data.data[0]);
                setColumns(columnKeys);
                setSelectedColumn(columnKeys[0] || '');
            }
        } catch (err) {
            setError('Failed to load file data.');
        } finally {
            setIsLoading(false);
        }
    };
    
    useEffect(() => {
        fetchFileData(fileId);
    }, [fileId, user?.token]);

    const handleCleanAction = async (action) => {
        let options = {};
        if (action === 'remove_missing_rows' || action === 'fill_missing_values') {
            if (!selectedColumn) {
                setError('Please select a column first.');
                return;
            }
            options.column = selectedColumn;
        }
        if (action === 'fill_missing_values') {
            options.value = fillValue;
        }

        setIsLoading(true);
        setStatusMessage(`Processing: ${action.replace(/_/g, ' ')}...`);
        setError('');

        try {
            const { data } = await api.post(`/process/clean/${fileId}`, { action, options }, {
                headers: { Authorization: `Bearer ${user.token}` },
            });
            
            if (data.noChange) {
                setStatusMessage(data.message);
            } else {
                setStatusMessage(data.message);
                // Navigate to the new cleaned file's page to see the result
                navigate(`/dashboard/clean/${data.file._id}`);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'An error occurred during cleaning.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !fileData) return <div className="p-8 font-semibold text-center">Loading Data Preview...</div>;
    if (error) return <div className="p-8 text-red-500 font-semibold text-center">{error}</div>;
    if (!fileData) return <div className="p-8 text-center">No data available for this file.</div>;

    const renderToolbar = () => (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-wrap items-center gap-6">
            {/* Remove Duplicates */}
            <button onClick={() => handleCleanAction('remove_duplicates')} className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">Remove Duplicates</button>
            
            {/* Handle Missing Values */}
            <div className="flex items-center gap-2 border-l pl-6">
                <select value={selectedColumn} onChange={(e) => setSelectedColumn(e.target.value)} className="border-gray-300 rounded-md shadow-sm p-2">
                    {columns.map(col => <option key={col} value={col}>{col}</option>)}
                </select>
                <button onClick={() => handleCleanAction('remove_missing_rows')} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Remove Rows with Missing</button>
                <div className="flex items-center gap-2">
                    <input type="text" placeholder="Fill value" value={fillValue} onChange={(e) => setFillValue(e.target.value)} className="border-gray-300 rounded-md shadow-sm p-2 w-28" />
                    <button onClick={() => handleCleanAction('fill_missing_values')} className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Fill Missing</button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold mb-2">Data Preview & Cleaning</h1>
            <p className="text-gray-600 mb-6">Prepare your data for analysis. Your original file will not be changed.</p>
            
            {renderToolbar()}

            {(isLoading || statusMessage) && 
                <div className="mb-4 text-center font-semibold text-indigo-600">
                    {isLoading ? 'Processing...' : statusMessage}
                </div>
            }
            
            <div className="overflow-auto bg-white rounded-lg shadow-md" style={{maxHeight: '70vh'}}>
                <table className="table-auto w-full text-sm text-left">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                        <tr>
                            {columns.map(col => <th key={col} className="p-4 font-semibold whitespace-nowrap">{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {fileData.slice(0, 100).map((row, rowIndex) => (
                            <tr key={rowIndex} className="border-b hover:bg-gray-50">
                                {columns.map(col => (
                                    <td key={col} className="p-3 truncate max-w-xs" title={row[col]}>{String(row[col])}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {fileData.length > 100 && <div className="pt-2 text-center text-sm text-gray-500">Showing the first 100 of {fileData.length} rows.</div>}
        </div>
    );
};

export default DataCleaner; 