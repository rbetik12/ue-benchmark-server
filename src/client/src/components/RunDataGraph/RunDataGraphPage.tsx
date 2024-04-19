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
import { RunInfo } from '../../models/RunInfo';
import { fetchRunInfo } from "../../utils";
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { GraphDataPoint } from '../../models/GraphDataPoint';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const RunDataGraphPage: React.FC = () => {
  const { id } = useParams<string>();
  const [runInfo, setRunInfo] = useState<RunInfo>();
  const [runData, setRunData] = useState<RunData[]>([]);
  const [graphData, setGraphData] = useState<GraphDataPoint[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>('fps');

  useEffect(() => {
    fetchData();
  }, [id]);
  
  useEffect(() => {
    updateGraphData(selectedMetric);
  }, [runData]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/run/${id}/data`);
      if (!response.ok) {
        throw new Error('Failed to fetch graph data');
      }
      const runData: RunData[] = await response.json();
      setRunData(runData);

    } catch (error) {
      console.error('Failed to fetch graph data:', error);
    }

    const newRunInfo = await fetchRunInfo(id as string);
    if (newRunInfo) {
      setRunInfo(newRunInfo);
    }
  };

  const updateGraphData = (metric: string) => {
    let dataPoints: GraphDataPoint[] = [];
    if (metric === "fps") {
      dataPoints = runData.map((data, index) => ({
        x: index * 0.5,
        y: data.fps
      }));
    }

    if (metric === "cpuTime") {
      dataPoints = runData.map((data, index) => ({
        x: index * 0.5,
        y: data.cpuTime
      }));
    }

    if (metric === "gpuTime") {
      dataPoints = runData.map((data, index) => ({
        x: index * 0.5,
        y: data.gpuTime
      }));
    }

    if (metric === "memops") {
      dataPoints = runData.map((data, index) => ({
        x: index * 0.5,
        y: data.memopsAmount
      }));
    }

    if (metric === "memory") {
      dataPoints = runData.map((data, index) => ({
        x: index * 0.5,
        y: data.memAmount
      }));
    }

    dataPoints.shift();
     
    setGraphData(dataPoints);
  }

  const handleMetricChange = (event: any) => {
    setSelectedMetric(event.target.value as string);
    updateGraphData(event.target.value);
  };

  const chartData = {
    labels: graphData.map((point) => point.x),
    datasets: [
      {
        label: `${selectedMetric} over time (second after run start)`,
        data: graphData.map((point) => point.y),
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
      },
    ],
  };

  return (
    <div className="margin2">
      <h1>Run name: {runInfo?.name}</h1>
        <InputLabel id="metric-select-label">Select Metric</InputLabel>
        <Select
          labelId="metric-select-label"
          id="metric-select"
          value={selectedMetric}
          onChange={handleMetricChange}
        >
          <MenuItem value="fps">FPS</MenuItem>
          <MenuItem value="cpuTime">CPU Time</MenuItem>
          <MenuItem value="gpuTime">GPU Time</MenuItem>
          <MenuItem value="memops">Memops</MenuItem>
          <MenuItem value="memory">Memory</MenuItem>
        </Select>
      <div className="graph-padding">
        <Line data={chartData} />
      </div>
    </div>
  );
};

export default RunDataGraphPage;
