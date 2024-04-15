import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material';
import { RunData } from '../../models/RunData';
import './RunDataTable.css';

const RunDataTable = () => {
  const { id } = useParams();
  const [runDataArr, setRunData] = useState<RunData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/run/${id}/data?mode=average`);
        if (!response.ok) {
          throw new Error('Failed to fetch run data');
        }
        const data = await response.json();
        console.debug(data);
        setRunData(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchData();
  }, [id]);

  const bytesToHumanReadable = (size: number): string => {
    const units: string[] = ["B", "KB", "MB", "GB"];
    const length = units.length;
  
    let i = 0;
    let fSize = size;
  
    if (size >= 1024) {
      for (i = 0; size / 1024 > 0 && i < length - 1; i++, size /= 1024) {
        fSize = size / 1024;
      }
    }
  
    return `${fSize.toFixed(2)} ${units[i]}`;
  }

  return (
    <div>
      {runDataArr ? (
        <TableContainer component={Paper} className="tableContainer1">
          <Table>
            <TableHead>
              <TableRow>
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
                  <TableCell>{runData.fps.toFixed(2)}</TableCell>
                  <TableCell>{runData.cpuTime.toFixed(2)}</TableCell>
                  <TableCell>{runData.gpuTime.toFixed(2)}</TableCell>
                  <TableCell>{runData.memopsAmount.toFixed(2)}</TableCell>
                  <TableCell>{bytesToHumanReadable(runData.memAmount)}</TableCell>
                </TableRow>
              )))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default RunDataTable;