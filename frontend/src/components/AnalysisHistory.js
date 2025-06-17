import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, Form, Modal, Table } from 'react-bootstrap';
import Chart from './Chart';

const AnalysisHistory = () => {
    const [history, setHistory] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [chartType, setChartType] = useState('Bar');
    const [xAxis, setXAxis] = useState('');
    const [yAxis, setYAxis] = useState('');
    const [error, setError] = useState('');
    const [chartData, setChartData] = useState(null);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/analysis/history');
            setHistory(response.data);
        } catch (error) {
            console.error('Error fetching history:', error);
            setError('Failed to fetch analysis history');
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date not available';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return 'Invalid Date';
        return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file && (file.name.endsWith('.xlsx') || file.name.endsWith('.xls'))) {
            setSelectedFile(file);
            setError('');
        } else {
            setError('Please select a valid Excel file (.xlsx or .xls)');
            setSelectedFile(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setError('Please select a file first');
            return;
        }

        if (!xAxis || !yAxis) {
            setError('Please specify both X-axis and Y-axis column names');
            return;
        }

        const formData = new FormData();
        formData.append('excelFile', selectedFile);
        formData.append('chartType', chartType);
        formData.append('xAxis', xAxis.trim());
        formData.append('yAxis', yAxis.trim());

        try {
            console.log('Uploading file:', {
                fileName: selectedFile.name,
                chartType,
                xAxis: xAxis.trim(),
                yAxis: yAxis.trim()
            });

            const response = await axios.post('http://localhost:5000/api/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            
            console.log('Upload response:', response.data);
            
            if (response.data.message) {
                setShowModal(false);
                fetchHistory();
                setSelectedFile(null);
                setChartType('Bar');
                setXAxis('');
                setYAxis('');
                setError('');
            } else {
                setError('Upload failed: Unexpected response from server');
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to upload file';
            setError(`Upload failed: ${errorMessage}`);
        }
    };

    const handleViewChart = async (fileId) => {
        try {
            const response = await axios.get(`http://localhost:5000/api/analysis/data/${fileId}`);
            setChartData(response.data);
        } catch (error) {
            console.error('Error fetching chart data:', error);
            setError('Failed to fetch chart data');
        }
    };

    return (
        <div className="container mt-4">
            <Card>
                <Card.Header className="d-flex justify-content-between align-items-center">
                    <h3>Analysis History</h3>
                    <Button variant="primary" onClick={() => setShowModal(true)}>
                        Upload New File
                    </Button>
                </Card.Header>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Table striped bordered hover>
                        <thead>
                            <tr>
                                <th>File Name</th>
                                <th>Upload Date</th>
                                <th>Chart Type</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.map((item) => (
                                <tr key={item._id}>
                                    <td>{item.fileName}</td>
                                    <td>{formatDate(item.analysisDate)}</td>
                                    <td>{item.chartType}</td>
                                    <td>
                                        <Button
                                            variant="info"
                                            size="sm"
                                            onClick={() => handleViewChart(item.fileId)}
                                        >
                                            View Chart
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </Table>

                    {chartData && (
                        <div className="mt-4">
                            <Chart
                                data={chartData.data}
                                chartType={chartData.chartType}
                                xAxis={chartData.xAxis}
                                yAxis={chartData.yAxis}
                            />
                        </div>
                    )}
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Upload Excel File</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3">
                            <Form.Label>Select File</Form.Label>
                            <Form.Control
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileSelect}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Chart Type</Form.Label>
                            <Form.Select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                            >
                                <option value="Bar">Bar Chart</option>
                                <option value="Line">Line Chart</option>
                                <option value="Pie">Pie Chart</option>
                                <option value="Scatter">Scatter Plot</option>
                            </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>X-Axis Column</Form.Label>
                            <Form.Control
                                type="text"
                                value={xAxis}
                                onChange={(e) => setXAxis(e.target.value)}
                                placeholder="Enter column name for X-axis"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Y-Axis Column</Form.Label>
                            <Form.Control
                                type="text"
                                value={yAxis}
                                onChange={(e) => setYAxis(e.target.value)}
                                placeholder="Enter column name for Y-axis"
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="primary" onClick={handleUpload}>
                        Upload
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default AnalysisHistory; 