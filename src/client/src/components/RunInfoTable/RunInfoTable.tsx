import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button } from '@mui/material';
import { RunInfo } from '../../models/RunInfo';
import './RunInfoTable.css';

const RunInfoTable: React.FC = () => {
  const [runInfos, setRunInfos] = useState<RunInfo[]>([]);

  useEffect(() => {
    fetchRunInfos();
    const intervalId = setInterval(fetchRunInfos, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchRunInfos = async () => {
    try {
      const response = await fetch('/api/run/all');
      if (!response.ok) {
        throw new Error('Failed to fetch run infos');
      }
      const data = await response.json();
      if (JSON.stringify(data) !== JSON.stringify(runInfos)) {
        setRunInfos(data);
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <TableContainer component={Paper} className="tableContainer">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Run ID</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {runInfos.map((runInfo) => (
              <TableRow key={runInfo.run_id}>
                <TableCell>{runInfo.run_id}</TableCell>
                <TableCell>{runInfo.timestamp}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default RunInfoTable;
