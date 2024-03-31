import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { TextField, Button, Box } from '@mui/material';

const RunData = () => {
  const { runId } = useParams();

  return (
    <div>
        {runId}
    </div>
  );
};

export default RunData;