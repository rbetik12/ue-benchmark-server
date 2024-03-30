import React from 'react';
import { AppBar, Toolbar, Typography } from '@mui/material';

interface TopBarProps {
  name: string;
}

const TopBar: React.FC<TopBarProps> = ({ name }) => {
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6">
          {name}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
