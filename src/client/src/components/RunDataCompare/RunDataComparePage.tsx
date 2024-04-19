import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { Link } from 'react-router-dom';
import { RunData } from '../../models/RunData';
import { auth, checkAuth } from '../../utils';
import { fetchRunInfo } from "../../utils";
import { RunInfo } from '../../models/RunInfo';
import { GraphDataPoint } from '../../models/GraphDataPoint';
import { ChartData, Dataset } from '../../models/ChartData';
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

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const RunDataTable = () => {
  const { ids } = useParams();
  const [idList, setIdList] = useState<string[]>();
  const [runDataArr, setRunData] = useState<RunData[] | null>(null);
  const [runInfoArr, setRunInfo] = useState<RunInfo[] | null>(null);
  const [selectedMetric, setSelectedMetric] = useState<string>('fps');
  const [chartData, setChartData] = useState<ChartData>();

  useEffect(() => {
    const fetchData = async () => {
      if (!await checkAuth()) {
        await auth();
      }

      const list = ids!!.split('_')
      list.pop();
      setIdList(list);

      let newRunDataArr: RunData[] = [];
      let newRunInfoArr: RunInfo[] = [];

      for (let runId of list!!) {
        try {
            const response = await fetch(`/api/run/${runId}/data?mode=average`);

            if (!response.ok) {
              throw new Error('Failed to fetch run data');
            }

            const data = await response.json();
            newRunDataArr.push(data[0]);
        } catch (error) {
            console.error(error);
        }

        const newRunInfo: RunInfo = await fetchRunInfo(runId as string);
        if (newRunInfo) {
            newRunInfoArr.push(newRunInfo);
        }
      }

      setRunData(newRunDataArr);
      setRunInfo(newRunInfoArr);
    };

    fetchData();
  }, [ids]);

  useEffect(() => {
    updateGraphsData("fps");
  }, [runInfoArr, runDataArr, idList]);

  const bytesToHumanReadable = (size: number): string => {
    const units: string[] = ["B", "KB", "MB", "GB"];
    const length = units.length;
    const isNegative = size < 0;

    size = Math.abs(size);
  
    let i = 0;
    let fSize = size;
  
    if (size >= 1024) {
      for (i = 0; size / 1024 > 0 && i < length - 1; i++, size /= 1024) {
        fSize = size / 1024;
      }
    }
  
    return `${isNegative ? -fSize.toFixed(2) : fSize.toFixed(2)} ${units[i]}`;
  }

  const formatedValue = (baseValue: number, curValue: number, isBytes: boolean = false) => {
    if (isBytes) {
        return `${bytesToHumanReadable(curValue)} (${bytesToHumanReadable(curValue - baseValue)} / ${((curValue - baseValue) / baseValue * 100).toFixed(2)}%)`
    }
    return `${curValue.toFixed(2)} (${(curValue - baseValue).toFixed(2)} / ${((curValue - baseValue) / baseValue * 100).toFixed(2)}%)`
  }

  const isIncreased = (baseValue: number, curValue: number) => {
    return baseValue - curValue < 0
  }

  const getCellColor = (baseValue: number, curValue: number) => {
    return { color: isIncreased(baseValue, curValue) ? 'red' : 'green' }
  }

  const handleMetricChange = (event: any) => {
    setSelectedMetric(event.target.value as string);
    updateGraphsData(event.target.value);
  };

  const updateGraphsData = async (metric: string) => {
    if (!idList || !runInfoArr) {
      return;
    }

    let allRunData: RunData[][] = [];

    for (let runId of idList!!) {
        try {
            const response = await fetch(`/api/run/${runId}/data`);

            if (!response.ok) {
              throw new Error('Failed to fetch run data');
            }

            const data = await response.json();
            allRunData.push(data);
        } catch (error) {
            console.error(error);
        }
    }

    let dataPoints: GraphDataPoint[][] = [];
    if (metric === "fps") {
        for (const data of allRunData) {
            dataPoints.push(data.map((value, index) => ({
                x: index * 0.5,
                y: value.fps
            })));
        }
    }

    if (metric === "cpuTime") {
        for (const data of allRunData) {
            dataPoints.push(data.map((value, index) => ({
                x: index * 0.5,
                y: value.cpuTime
            })));
        }
    }

    if (metric === "gpuTime") {
        for (const data of allRunData) {
            dataPoints.push(data.map((value, index) => ({
                x: index * 0.5,
                y: value.cpuTime
            })));
        }
    }

    if (metric === "memops") {
        for (const data of allRunData) {
            dataPoints.push(data.map((value, index) => ({
                x: index * 0.5,
                y: value.memopsAmount
            })));
        }
    }

    if (metric === "memory") {
        for (const data of allRunData) {
            dataPoints.push(data.map((value, index) => ({
                x: index * 0.5,
                y: value.memAmount
            })));
        }
    }

    
    let data: ChartData = {
        labels: dataPoints[0].map((point) => point.x),
        datasets: []
    };

    const colorPalletes = ["#e60049", "#0bb4ff", "#50e991", "#e6d800", "#9b19f5", "#ffa300", "#dc0ab4", "#b3d4ff", "#00bfa0"];

    for (let i in dataPoints) {
        let dataEntry = dataPoints[i];

        dataEntry.shift();

        data.datasets.push({
            label: `${selectedMetric} over time (second after run start) [${runInfoArr!![i].name}]`,
            data: dataEntry.map((point) => point.y),
            fill: false,
            borderColor: colorPalletes[i],
            tension: 0.1,
        });
    }

    setChartData(data);
  }

  return (
    <div className="margin2">
      {(runDataArr && runInfoArr && chartData) ? (
        <div>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Run Name</TableCell>
                  <TableCell>FPS</TableCell>
                  <TableCell>CPU Time</TableCell>
                  <TableCell>GPU Time</TableCell>
                  <TableCell>Memory Operations Amount</TableCell>
                  <TableCell>Memory Amount</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(runDataArr.map((runData, index) => (
                  <TableRow key={index}>
                    <TableCell>{runInfoArr[index].name}</TableCell>
                    <TableCell style={getCellColor(runDataArr[0].fps, runData.fps)}>{formatedValue(runDataArr[0].fps, runData.fps)}</TableCell>
                    <TableCell style={getCellColor(runDataArr[0].cpuTime, runData.cpuTime)}>{formatedValue(runDataArr[0].cpuTime, runData.cpuTime)}</TableCell>
                    <TableCell style={getCellColor(runDataArr[0].gpuTime, runData.gpuTime)}>{formatedValue(runDataArr[0].gpuTime, runData.gpuTime)}</TableCell>
                    <TableCell style={getCellColor(runDataArr[0].memopsAmount, runData.memopsAmount)}>{formatedValue(runDataArr[0].memopsAmount, runData.memopsAmount)}</TableCell>
                    <TableCell style={getCellColor(runDataArr[0].memAmount, runData.memAmount)}>{formatedValue(runDataArr[0].memAmount, runData.memAmount, true)}</TableCell>
                  </TableRow>
                )))}
              </TableBody>
            </Table>
          </TableContainer>
          <h1>Stats graph</h1>
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
          <br/>
          <div className="graph-padding">
            <Line data={chartData as ChartData} />
          </div>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default RunDataTable;