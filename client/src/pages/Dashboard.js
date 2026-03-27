import React from 'react';
import { Box, Grid, Paper, Typography, Button, Toolbar, CircularProgress } from '@mui/material';
import { Link } from 'react-router-dom';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ReceiptIcon from '@mui/icons-material/Receipt';
import { useQuery } from 'react-query';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import OrderCard from '../components/OrderCard';
import { useAuth } from '../App';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatCard = ({ icon, title, value, color, to }) => (
  <Paper sx={{ p: 3, borderRadius: 3, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
        <Typography variant="h5" fontWeight={700} color={color}>{value}</Typography>
      </Box>
      <Box sx={{ color, opacity: 0.7, fontSize: 40 }}>{icon}</Box>
    </Box>
    {to && (
      <Button component={Link} to={to} size="small" sx={{ mt: 1 }}>View →</Button>
    )}
  </Paper>
);

export default function Dashboard({ toggleTheme, themeMode }) {
  const { user } = useAuth();

  const { data: ordersData, isLoading } = useQuery('recentOrders', () =>
    axios.get(`${API_URL}/orders?limit=5`).then((r) => r.data)
  );

  const { data: balanceData } = useQuery('balance', () =>
    axios.get(`${API_URL}/payments/balance`).then((r) => r.data)
  );

  const balance = balanceData?.balance ?? user?.balance ?? 0;
  const orders = ordersData?.orders || [];
  const totalOrders = ordersData?.total || 0;

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar toggleTheme={toggleTheme} themeMode={themeMode} />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: '220px' } }}>
        <Toolbar />
        <Typography variant="h5" fontWeight={700} mb={3}>
          👋 Welcome back, {user?.username}!
        </Typography>

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<AccountBalanceWalletIcon fontSize="large" />}
              title="Wallet Balance"
              value={`$${balance.toFixed(2)}`}
              color="primary.main"
              to="/wallet"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<ReceiptIcon fontSize="large" />}
              title="Total Orders"
              value={totalOrders}
              color="secondary.main"
              to="/orders"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<TrendingUpIcon fontSize="large" />}
              title="Active Orders"
              value={orders.filter((o) => o.status === 'processing').length}
              color="success.main"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              icon={<ShoppingCartIcon fontSize="large" />}
              title="Browse Packages"
              value="New Order"
              color="warning.main"
              to="/packages"
            />
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" fontWeight={600}>Recent Orders</Typography>
            <Button component={Link} to="/orders" variant="outlined" size="small">View All</Button>
          </Box>
          {isLoading ? (
            <Box textAlign="center" py={4}><CircularProgress /></Box>
          ) : orders.length === 0 ? (
            <Box textAlign="center" py={4}>
              <Typography color="text.secondary">No orders yet</Typography>
              <Button component={Link} to="/packages" variant="contained" sx={{ mt: 2 }}>
                Browse Packages
              </Button>
            </Box>
          ) : (
            orders.map((order) => <OrderCard key={order._id} order={order} />)
          )}
        </Paper>
      </Box>
    </Box>
  );
}
