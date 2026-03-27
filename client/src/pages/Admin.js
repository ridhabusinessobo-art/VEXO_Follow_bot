import React, { useState } from 'react';
import {
  Box, Paper, Typography, Toolbar, Grid, CircularProgress,
  Table, TableBody, TableCell, TableHead, TableRow, Chip,
  Tabs, Tab, Button, TextField, Dialog, DialogTitle,
  DialogContent, DialogActions, Pagination, Alert
} from '@mui/material';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const StatCard = ({ title, value, color }) => (
  <Paper sx={{ p: 3, borderRadius: 3, textAlign: 'center' }}>
    <Typography variant="body2" color="text.secondary">{title}</Typography>
    <Typography variant="h4" fontWeight={700} color={color}>{value}</Typography>
  </Paper>
);

export default function Admin({ toggleTheme, themeMode }) {
  const [tab, setTab] = useState(0);
  const [userPage, setUserPage] = useState(1);
  const [orderPage, setOrderPage] = useState(1);
  const [txPage, setTxPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editUser, setEditUser] = useState(null);
  const [editBalance, setEditBalance] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const queryClient = useQueryClient();

  const { data: stats } = useQuery('adminStats', () =>
    axios.get(`${API_URL}/admin/dashboard`).then((r) => r.data)
  );

  const { data: usersData, isLoading: usersLoading } = useQuery(
    ['adminUsers', userPage, search],
    () => axios.get(`${API_URL}/admin/users`, { params: { page: userPage, search } }).then((r) => r.data),
    { keepPreviousData: true, enabled: tab === 1 }
  );

  const { data: ordersData, isLoading: ordersLoading } = useQuery(
    ['adminOrders', orderPage],
    () => axios.get(`${API_URL}/admin/orders`, { params: { page: orderPage, limit: 10 } }).then((r) => r.data),
    { keepPreviousData: true, enabled: tab === 2 }
  );

  const { data: txData, isLoading: txLoading } = useQuery(
    ['adminTx', txPage],
    () => axios.get(`${API_URL}/admin/transactions`, { params: { page: txPage, limit: 10, status: 'pending' } }).then((r) => r.data),
    { keepPreviousData: true, enabled: tab === 3 }
  );

  const updateUserMutation = useMutation(
    ({ id, data }) => axios.put(`${API_URL}/admin/users/${id}`, data),
    {
      onSuccess: () => {
        setActionMsg('User updated successfully');
        setEditUser(null);
        queryClient.invalidateQueries('adminUsers');
        setTimeout(() => setActionMsg(''), 3000);
      },
    }
  );

  const banMutation = useMutation(
    (id) => axios.post(`${API_URL}/admin/users/${id}/ban`),
    {
      onSuccess: () => {
        setActionMsg('User banned');
        queryClient.invalidateQueries('adminUsers');
        setTimeout(() => setActionMsg(''), 3000);
      },
    }
  );

  const approveDepositMutation = useMutation(
    (id) => axios.post(`${API_URL}/admin/transactions/${id}/approve`),
    {
      onSuccess: () => {
        setActionMsg('Deposit approved!');
        queryClient.invalidateQueries('adminTx');
        setTimeout(() => setActionMsg(''), 3000);
      },
    }
  );

  const syncServicesMutation = useMutation(
    () => axios.post(`${API_URL}/services/sync`),
    {
      onSuccess: (res) => {
        setActionMsg(`Services synced: ${res.data.total} total, ${res.data.created} new, ${res.data.updated} updated`);
        setTimeout(() => setActionMsg(''), 5000);
      },
    }
  );

  const s = stats?.stats || {};
  const users = usersData?.users || [];
  const orders = ordersData?.orders || [];
  const transactions = txData?.transactions || [];

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar toggleTheme={toggleTheme} themeMode={themeMode} />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: '220px' } }}>
        <Toolbar />
        <Typography variant="h5" fontWeight={700} mb={3}>🛡️ Admin Panel</Typography>

        {actionMsg && <Alert severity="success" onClose={() => setActionMsg('')} sx={{ mb: 2 }}>{actionMsg}</Alert>}

        <Grid container spacing={2} mb={3}>
          <Grid item xs={6} md={3}><StatCard title="Total Users" value={s.totalUsers || 0} color="primary.main" /></Grid>
          <Grid item xs={6} md={3}><StatCard title="Total Orders" value={s.totalOrders || 0} color="secondary.main" /></Grid>
          <Grid item xs={6} md={3}><StatCard title="Pending Orders" value={s.pendingOrders || 0} color="warning.main" /></Grid>
          <Grid item xs={6} md={3}><StatCard title="Revenue" value={`$${(s.totalRevenue || 0).toFixed(2)}`} color="success.main" /></Grid>
        </Grid>

        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={() => syncServicesMutation.mutate()} disabled={syncServicesMutation.isLoading} sx={{ mr: 1 }}>
            {syncServicesMutation.isLoading ? <CircularProgress size={20} /> : '🔄 Sync Services'}
          </Button>
        </Box>

        <Paper sx={{ borderRadius: 3 }}>
          <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tab label="Overview" />
            <Tab label="Users" />
            <Tab label="Orders" />
            <Tab label="Deposits" />
          </Tabs>

          <Box sx={{ p: 3 }}>
            {tab === 0 && (
              <>
                <Typography variant="h6" gutterBottom>Recent Orders</Typography>
                {(stats?.recentOrders || []).slice(0, 5).map((o) => (
                  <Box key={o._id} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <Typography variant="body2">{o.userId?.username} — {o.serviceId?.name}</Typography>
                    <Chip label={o.status} size="small" color={o.status === 'completed' ? 'success' : 'warning'} />
                  </Box>
                ))}
              </>
            )}

            {tab === 1 && (
              <>
                <TextField
                  placeholder="Search users..."
                  size="small"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  sx={{ mb: 2 }}
                />
                {usersLoading ? <CircularProgress /> : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>Username</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell>Balance</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map((u) => (
                        <TableRow key={u._id} hover>
                          <TableCell>{u.username}</TableCell>
                          <TableCell>{u.email}</TableCell>
                          <TableCell>${(u.balance || 0).toFixed(2)}</TableCell>
                          <TableCell><Chip label={u.role} size="small" color={u.role === 'admin' ? 'error' : 'default'} /></TableCell>
                          <TableCell><Chip label={u.isBanned ? 'Banned' : 'Active'} size="small" color={u.isBanned ? 'error' : 'success'} /></TableCell>
                          <TableCell>
                            <Button size="small" onClick={() => { setEditUser(u); setEditBalance(String(u.balance || 0)); }}>Edit</Button>
                            {!u.isBanned && <Button size="small" color="error" onClick={() => banMutation.mutate(u._id)}>Ban</Button>}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination count={usersData?.pages || 1} page={userPage} onChange={(_, v) => setUserPage(v)} color="primary" />
                </Box>
              </>
            )}

            {tab === 2 && (
              <>
                {ordersLoading ? <CircularProgress /> : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Service</TableCell>
                        <TableCell>Qty</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {orders.map((o) => (
                        <TableRow key={o._id} hover>
                          <TableCell>{o.userId?.username}</TableCell>
                          <TableCell>{o.serviceId?.name}</TableCell>
                          <TableCell>{o.quantity?.toLocaleString()}</TableCell>
                          <TableCell>${o.price?.toFixed(4)}</TableCell>
                          <TableCell><Chip label={o.status} size="small" color={o.status === 'completed' ? 'success' : 'warning'} /></TableCell>
                          <TableCell>{new Date(o.createdAt).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination count={ordersData?.pages || 1} page={orderPage} onChange={(_, v) => setOrderPage(v)} color="primary" />
                </Box>
              </>
            )}

            {tab === 3 && (
              <>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Pending deposits awaiting approval
                </Typography>
                {txLoading ? <CircularProgress /> : (
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Reference</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map((tx) => (
                        <TableRow key={tx._id} hover>
                          <TableCell>{tx.userId?.username}</TableCell>
                          <TableCell>${tx.amount?.toFixed(2)}</TableCell>
                          <TableCell>{tx.method?.replace('_', ' ')}</TableCell>
                          <TableCell>{tx.reference}</TableCell>
                          <TableCell>{new Date(tx.createdAt).toLocaleDateString()}</TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => approveDepositMutation.mutate(tx._id)}
                              disabled={approveDepositMutation.isLoading}
                            >
                              Approve
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Pagination count={txData?.pages || 1} page={txPage} onChange={(_, v) => setTxPage(v)} color="primary" />
                </Box>
              </>
            )}
          </Box>
        </Paper>

        <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth>
          <DialogTitle>Edit User: {editUser?.username}</DialogTitle>
          <DialogContent>
            <TextField
              label="Balance"
              type="number"
              fullWidth
              value={editBalance}
              onChange={(e) => setEditBalance(e.target.value)}
              sx={{ mt: 1, mb: 2 }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditUser(null)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={() => {
                updateUserMutation.mutate({ id: editUser._id, data: { balance: parseFloat(editBalance) } });
              }}
            >
              Save
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
