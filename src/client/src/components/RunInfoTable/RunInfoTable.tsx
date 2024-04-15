import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button } from '@mui/material';
import { Link } from 'react-router-dom';
import { RunInfo } from '../../models/RunInfo';
import './RunInfoTable.css';

const RunInfoTable: React.FC = () => {
  const [runInfos, setRunInfos] = useState<RunInfo[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

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

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
            {(rowsPerPage > 0
              ? runInfos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : runInfos
            ).map((runInfo) => (
              <TableRow key={runInfo.runId}>
                <TableCell>{runInfo.runId}</TableCell>
                <TableCell>{runInfo.timestamp}</TableCell>
                <TableCell>
                  <Button component={Link} to={`/run/${runInfo.runId}`} variant="outlined" color="primary">
                    Open
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={runInfos.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </div>
  );
};

export default RunInfoTable;
