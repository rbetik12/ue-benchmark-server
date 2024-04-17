import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { RunData } from '../../models/RunData';
import './RunDataTable.css';
import { auth, checkAuth } from '../../utils';
import { fetchRunInfo } from "../../utils";
import { RunInfo } from '../../models/RunInfo';

const RunDataTable = () => {
  const { id } = useParams();
  const [runInfo, setRunInfo] = useState<RunInfo | null>(null);
  const [runDataArr, setRunData] = useState<RunData[] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!await checkAuth()) {
        await auth();
      }

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

      const newRunInfo = await fetchRunInfo(id as string);
      if (newRunInfo) {
        setRunInfo(newRunInfo);
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
      {(runDataArr && runInfo) ? (
        <div>
          <h1>Run name: {runInfo.name}</h1>
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
          <Button component={Link} to={`/run/${id}/graph`} variant="outlined" color="primary">
          Open Graph
          </Button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default RunDataTable;