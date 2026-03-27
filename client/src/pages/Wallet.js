import React, { useState } from 'react';
import {
  Box, Paper, Typography, Toolbar, Button, Grid,
  Chip, Table, TableBody, TableCell, TableHead, TableRow,
  CircularProgress, Pagination, Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useQueryClient } from 'react-query';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import PaymentModal from '../components/PaymentModal';
import { useAuth } from '../App';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const typeColors = {
  deposit: 'success',
  withdrawal: 'error',
  order: 'warning',
  refund: 'info',
};

export default function Wallet({ toggleTheme, themeMode }) {
  const { user, setUser } = useAuth();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: balanceData, refetch: refetchBalance } = useQuery('balance', () =>
    axios.get(`${API_URL}/payments/balance`).then((r) => r.data)
  );

  const { data: txData, isLoading, refetch: refetchTx } = useQuery(
    ['transactions', page],
    () => axios.get(`${API_URL}/payments/transactions`, { params: { page, limit: 10 } }).then((r) => r.data),
    { keepPreviousData: true }
  );

  const balance = balanceData?.balance ?? user?.balance ?? 0;
  const transactions = txData?.transactions || [];
  const totalPages = txData?.pages || 1;

  const handlePaymentSuccess = () => {
    setSuccessMsg('Deposit confirmed! Your balance has been updated.');
    refetchBalance();
    refetchTx();
    queryClient.invalidateQueries('balance');
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar toggleTheme={toggleTheme} themeMode={themeMode} />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: '220px' } }}>
        <Toolbar />
        <Typography variant="h5" fontWeight={700} mb={3}>💰 My Wallet</Typography>

        {successMsg && <Alert severity="success" onClose={() => setSuccessMsg('')} sx={{ mb: 2 }}>{successMsg}</Alert>}

        <Grid container spacing={3} mb={4}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 3, borderRadius: 3, background: 'linear-gradient(135deg, #6c63ff, #5a52d5)' }}>
              <Typography variant="body2" sx={{ opacity: 0.8, color: 'white' }}>Available Balance</Typography>
              <Typography variant="h4" fontWeight={700} color="white">${balance.toFixed(2)}</Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setPaymentOpen(true)}
                sx={{ mt: 2, bgcolor: 'rgba(255,255,255,0.2)', '&:hover': { bgcolor: 'rgba(255,255,255,0.3)' } }}
              >
                Add Funds
              </Button>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={8}>
            <Paper sx={{ p: 3, borderRadius: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>Payment Methods</Typography>
              <Grid container spacing={1}>
                {['Credit Card', 'PayPal', 'Crypto', 'Bank Transfer'].map((m) => (
                  <Grid item key={m}>
                    <Chip
                      label={m}
                      variant="outlined"
                      onClick={() => setPaymentOpen(true)}
                      sx={{ cursor: 'pointer' }}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>Transaction History</Typography>
          {isLoading ? (
            <Box textAlign="center" py={4}><CircularProgress /></Box>
          ) : transactions.length === 0 ? (
            <Typography color="text.secondary" textAlign="center" py={4}>No transactions yet</Typography>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Method</TableCell>
                    <TableCell>Amount</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Reference</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx._id} hover>
                      <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip label={tx.type} color={typeColors[tx.type] || 'default'} size="small" />
                      </TableCell>
                      <TableCell sx={{ textTransform: 'capitalize' }}>{tx.method.replace('_', ' ')}</TableCell>
                      <TableCell>
                        <Typography color={tx.amount >= 0 ? 'success.main' : 'error.main'} fontWeight={600}>
                          {tx.amount >= 0 ? '+' : ''}${Math.abs(tx.amount).toFixed(4)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip label={tx.status} color={tx.status === 'completed' ? 'success' : tx.status === 'pending' ? 'warning' : 'error'} size="small" />
                      </TableCell>
                      <TableCell>{tx.reference || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
              </Box>
            </>
          )}
        </Paper>

        <PaymentModal open={paymentOpen} onClose={() => setPaymentOpen(false)} onSuccess={handlePaymentSuccess} />
      </Box>
    </Box>
  );
}
