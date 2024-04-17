import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useParams } from 'react-router-dom';
import { RunData } from '../../models/RunData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface GraphDataPoint {
  x: number;
  y: number;
}

const RunDataGraphPage: React.FC = () => {
  const { id } = useParams();
  const [runData, setRunData] = useState<RunData[]>([]);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/run/${id}/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch graph data');
      }
      const runData: RunData[] = await response.json();
      setRunData(runData);

      const dataPoints: GraphDataPoint[] = runData.map((data, index) => ({
        x: index * 0.5,
        y: data.fps
      }));
      setGraphData(dataPoints);

      console.debug(dataPoints);

    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    }
  };

  const chartData = {
    labels: graphData.map((point) => point.x),
    datasets: [
      {
        label: 'FPS over time (second after run start)',
        data: graphData.map((point) => point.y),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div>
      <h1>Graph Page</h1>
      <Line data={chartData} />
    </div>
  );
};

export default RunDataGraphPage;
