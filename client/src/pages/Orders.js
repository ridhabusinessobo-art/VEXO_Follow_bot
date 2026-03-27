import React, { useState } from 'react';
import {
  Box, Paper, Typography, Toolbar, CircularProgress,
  Pagination, MenuItem, Select, FormControl, InputLabel,
  Button, Alert
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import OrderCard from '../components/OrderCard';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Orders({ toggleTheme, themeMode }) {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [syncMsg, setSyncMsg] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['orders', page, status],
    () => axios.get(`${API_URL}/orders`, { params: { page, limit: 10, status: status || undefined } }).then((r) => r.data),
    { keepPreviousData: true }
  );

  const syncMutation = useMutation(
    (orderId) => axios.post(`${API_URL}/orders/${orderId}/sync`),
    {
      onSuccess: () => {
        setSyncMsg('Order status updated!');
        queryClient.invalidateQueries('orders');
        setTimeout(() => setSyncMsg(''), 3000);
      },
    }
  );

  const cancelMutation = useMutation(
    (orderId) => axios.delete(`${API_URL}/orders/${orderId}`),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('orders');
        queryClient.invalidateQueries('balance');
      },
    }
  );

  const orders = data?.orders || [];
  const totalPages = data?.pages || 1;

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar toggleTheme={toggleTheme} themeMode={themeMode} />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: '220px' } }}>
        <Toolbar />
        <Typography variant="h5" fontWeight={700} mb={3}>📋 My Orders</Typography>

        {syncMsg && <Alert severity="success" sx={{ mb: 2 }}>{syncMsg}</Alert>}

        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>Filter by Status</InputLabel>
            <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }} label="Filter by Status">
              <MenuItem value="">All</MenuItem>
              {['pending', 'processing', 'completed', 'failed', 'cancelled', 'partial'].map((s) => (
                <MenuItem key={s} value={s} sx={{ textTransform: 'capitalize' }}>{s}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {isLoading ? (
          <Box textAlign="center" py={8}><CircularProgress /></Box>
        ) : orders.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography color="text.secondary">No orders found</Typography>
          </Box>
        ) : (
          <>
            {orders.map((order) => (
              <Box key={order._id} sx={{ position: 'relative' }}>
                <OrderCard order={order} />
                <Box sx={{ display: 'flex', gap: 1, mb: 2, ml: 1 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => syncMutation.mutate(order._id)}
                    disabled={syncMutation.isLoading}
                  >
                    🔄 Sync Status
                  </Button>
                  {['pending', 'processing'].includes(order.status) && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => cancelMutation.mutate(order._id)}
                      disabled={cancelMutation.isLoading}
                    >
                      ❌ Cancel
                    </Button>
                  )}
                </Box>
              </Box>
            ))}
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, v) => setPage(v)}
                color="primary"
              />
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
