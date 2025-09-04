import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

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

const ChartRenderer = ({ chartData }) => {
  console.log('ChartRenderer received data:', chartData);
  
  if (!chartData) {
    return <div className="text-red-500">No chart data provided</div>;
  }

  // Handle AI-generated chart data structure
  let chartConfig = null;
  
  if (chartData.chart_type && chartData.labels && chartData.datasets) {
    // AI-generated format - convert to Chart.js format
    chartConfig = {
      type: chartData.chart_type,
      data: {
        labels: chartData.labels,
        datasets: chartData.datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: chartData.title || 'Chart',
          },
        },
      }
    };
  } else if (chartData.type && chartData.data) {
    // Already in Chart.js format
    chartConfig = {
      type: chartData.type,
      data: chartData.data,
      options: chartData.options || {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
          },
          title: {
            display: true,
            text: chartData.data.title || 'Chart',
          },
        },
      }
    };
  }

  if (!chartConfig) {
    console.error('Invalid chart data structure:', chartData);
    return <div className="text-red-500">Invalid chart data structure</div>;
  }

  const { type, data, options } = chartConfig;

  const renderChart = () => {
    switch (type.toLowerCase()) {
      case 'line':
        return <Line data={data} options={options} />;
      case 'bar':
        return <Bar data={data} options={options} />;
      case 'pie':
        return <Pie data={data} options={options} />;
      case 'doughnut':
        return <Doughnut data={data} options={options} />;
      default:
        return <div className="text-red-500">Unsupported chart type: {type}</div>;
    }
  };

  return (
    <div className="chart-container bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
      <div className="w-full h-64">
        {renderChart()}
      </div>
    </div>
  );
};

export default ChartRenderer;
