import React, { useEffect } from 'react';
import { AppBar, Toolbar, Typography, IconButton } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import { useLocation, useNavigate } from 'react-router-dom';


interface TopBarProps {
  name: string;
}

const TopBar: React.FC<TopBarProps> = ({ name }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleHomeButtonClick = () => {
    navigate('/');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {name}
        </Typography>
        {location.pathname !== '/' && (
        <IconButton color="inherit" onClick={() => { handleHomeButtonClick() }}>
          <HomeOutlinedIcon fontSize="large" />
        </IconButton>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default TopBar;
