import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  EventSeat as TableIcon,
  BookOnline as BookingIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';

const StatCard = ({ title, value, icon, color }) => (
  <Paper
    sx={{
      p: 2,
      display: 'flex',
      flexDirection: 'column',
      height: 140,
      bgcolor: color,
      color: 'white',
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
      <Typography component="h2" variant="h6" gutterBottom>
        {title}
      </Typography>
      {icon}
    </Box>
    <Typography component="p" variant="h4">
      {value}
    </Typography>
  </Paper>
);

const Overview = () => {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Tổng quan
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={isOpen}
              onChange={(e) => setIsOpen(e.target.checked)}
              color="primary"
            />
          }
          label={isOpen ? 'Đang mở cửa' : 'Đã đóng cửa'}
        />
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Bàn còn trống"
            value="8/12"
            icon={<TableIcon />}
            color="#4caf50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đơn đặt hôm nay"
            value="15"
            icon={<BookingIcon />}
            color="#2196f3"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Đơn đặt tuần này"
            value="45"
            icon={<BookingIcon />}
            color="#ff9800"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Doanh thu hôm nay"
            value="2.5M"
            icon={<MoneyIcon />}
            color="#f44336"
          />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Overview; 