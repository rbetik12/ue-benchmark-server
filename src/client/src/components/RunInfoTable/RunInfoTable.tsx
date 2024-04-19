import React, { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, TablePagination, Button, TextField, Checkbox } from '@mui/material';
import { Link } from 'react-router-dom';
import { RunInfo } from '../../models/RunInfo';
import './RunInfoTable.css';
import { auth, checkAuth } from '../../utils';

const RunInfoTable: React.FC = () => {
  const [runInfos, setRunInfos] = useState<RunInfo[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const cb = async () => {
      if (!await checkAuth()) {
        await auth();
      }

      fetchRunInfos();
    }

    cb();
    const intervalId = setInterval(fetchRunInfos, 6000);
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

  const handleNameChange = async (index: number, newValue: string) => {
    const updatedRunInfos = [...runInfos];
    updatedRunInfos[index].name = newValue;
    setRunInfos(updatedRunInfos);

    const updatedRunInfo = updatedRunInfos[index];

    try {
      const response = await fetch(`/api/run/${updatedRunInfo.runId}?name=${updatedRunInfo.name}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
      });
      if (!response.ok) {
        throw new Error('Failed to change run info');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const [selectedRows, setSelectedRows] = useState<string[]>([]); // State to keep track of selected rows

  const handleRowSelect = (runId: string) => {
    if (selectedRows.length > 4) {
      return;
    }
    const selectedIndex = selectedRows.indexOf(runId);
    let newSelected: string[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedRows, runId);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelected = newSelected.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelected);
  };

  const isSelected = (runId: string) => selectedRows.indexOf(runId) !== -1;

  const getLinkCompareId = () => {
    let linkId = ""

    for (let id of selectedRows) {
      linkId += id + "_";
    }

    return linkId;
  }

  return (
    <div className="margin2">
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Select</TableCell>
              <TableCell>Run ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Timestamp</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {(rowsPerPage > 0
              ? runInfos.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              : runInfos
            ).map((runInfo, index) => {
              const isItemSelected = isSelected(runInfo.runId);
              const labelId = `checkbox-${runInfo.runId}`;

              return (
                <TableRow key={runInfo.runId}>
                  <TableCell>
                    <Checkbox
                      checked={isItemSelected}
                      inputProps={{ 'aria-labelledby': labelId }}
                      onClick={() => handleRowSelect(runInfo.runId)}
                    />
                  </TableCell>
                  <TableCell>{runInfo.runId}</TableCell>
                  <TableCell>
                    <TextField
                      value={runInfo.name}
                      onChange={(newValue) => handleNameChange(index, newValue.target.value)}
                    />
                  </TableCell>
                  <TableCell>{runInfo.timestamp}</TableCell>
                  <TableCell>
                    <Button component={Link} to={`/run/${runInfo.runId}`} variant="outlined" color="primary">
                      Open
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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
      <br/>
      {(selectedRows.length > 1) ? (
        <div>
          <Button component={Link} to={`/compare/${getLinkCompareId()}`} variant="outlined" color="primary">
            Compare runs
          </Button>
        </div>
      ) : (
        <div></div>
      )}
    </div>
  );
};

export default RunInfoTable;
