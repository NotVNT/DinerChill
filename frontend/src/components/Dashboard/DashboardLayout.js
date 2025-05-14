import React from 'react';
import { Box, styled } from '@mui/material';
import Sidebar from './Sidebar';

const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginLeft: 240, // Same as drawer width
  [theme.breakpoints.down('sm')]: {
    marginLeft: 0,
  },
}));

const DashboardLayout = ({ children }) => {
  return (
    <Box sx={{ display: 'flex' }}>
      <Sidebar />
      <MainContent>
        {children}
      </MainContent>
    </Box>
  );
};

export default DashboardLayout; 