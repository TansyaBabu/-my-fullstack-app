import {
    BarElement,
    CategoryScale,
    Chart as ChartJS,
    Legend,
    LinearScale,
    Title,
    Tooltip,
} from 'chart.js';
import React from 'react';
import { Card } from 'react-bootstrap';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Chart = ({ data, chartType = 'Bar' }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Data Analysis Chart',
      },
    },
  };

  return (
    <Card className="mt-4">
      <Card.Body>
        <Bar data={data} options={options} />
      </Card.Body>
    </Card>
  );
};

export default Chart; 