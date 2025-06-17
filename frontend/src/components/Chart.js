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
    Tooltip,
} from 'chart.js';
import React from 'react';
import { Bar, Line, Pie, Scatter } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend
);

const Chart = ({ data, chartType, xAxis, yAxis }) => {
    const chartData = {
        labels: data.map(item => item[xAxis]),
        datasets: [
            {
                label: yAxis,
                data: data.map(item => item[yAxis]),
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                    'rgba(153, 102, 255, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `${chartType} Chart - ${xAxis} vs ${yAxis}`,
            },
        },
    };

    const renderChart = () => {
        switch (chartType) {
            case 'Bar':
                return <Bar data={chartData} options={options} />;
            case 'Line':
                return <Line data={chartData} options={options} />;
            case 'Pie':
                return <Pie data={chartData} options={options} />;
            case 'Scatter':
                return <Scatter data={chartData} options={options} />;
            default:
                return <Bar data={chartData} options={options} />;
        }
    };

    return (
        <div style={{ width: '100%', height: '400px', marginTop: '20px' }}>
            {renderChart()}
        </div>
    );
};

export default Chart; 