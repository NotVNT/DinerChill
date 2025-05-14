import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  styled,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  BookOnline as BookingsIcon,
  TableBar as TablesIcon,
  Restaurant as RestaurantIcon,
  Person as AccountIcon,
} from '@mui/icons-material';

const drawerWidth = 240;

const StyledDrawer = styled(Drawer)({
  width: drawerWidth,
  flexShrink: 0,
  '& .MuiDrawer-paper': {
    width: drawerWidth,
    boxSizing: 'border-box',
  },
});

const menuItems = [
  { text: 'Tổng quan', icon: <DashboardIcon />, path: '/dashboard' },
  { text: 'Đơn đặt bàn', icon: <BookingsIcon />, path: '/dashboard/bookings' },
  { text: 'Quản lý bàn', icon: <TablesIcon />, path: '/dashboard/tables' },
  { text: 'Nhà hàng', icon: <RestaurantIcon />, path: '/dashboard/restaurant' },
  { text: 'Tài khoản', icon: <AccountIcon />, path: '/dashboard/account' },
];

const Sidebar = () => {
  const location = useLocation();

  return (
    <StyledDrawer variant="permanent">
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </StyledDrawer>
  );
};

export default Sidebar; 