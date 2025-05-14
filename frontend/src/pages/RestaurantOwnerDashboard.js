import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/Dashboard/DashboardLayout';
import Overview from '../components/Dashboard/Overview';

const RestaurantOwnerDashboard = () => {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<Overview />} />
        <Route path="/bookings" element={<div>Bookings Page</div>} />
        <Route path="/tables" element={<div>Tables Page</div>} />
        <Route path="/restaurant" element={<div>Restaurant Info Page</div>} />
        <Route path="/account" element={<div>Account Page</div>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </DashboardLayout>
  );
};

export default RestaurantOwnerDashboard; 