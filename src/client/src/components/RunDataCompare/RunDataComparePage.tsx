import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { RunData } from '../../models/RunData';
import { auth, checkAuth } from '../../utils';
import { fetchRunInfo } from "../../utils";
import { RunInfo } from '../../models/RunInfo';

const RunDataTable = () => {
  const { ids } = useParams();
  const [idList, setIdList] = useState<string[]>();
  const [runDataArr, setRunData] = useState<RunData[] | null>(null);
  const [runInfoArr, setRunInfo] = useState<RunInfo[] | null>(null);

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

  return (
    <div>
      {(runDataArr && runInfoArr) ? (
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
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default RunDataTable;