import React, { useState } from 'react';
import {
  Box, Paper, Typography, Toolbar, TextField, Button, Grid,
  Chip, Dialog, DialogTitle, DialogContent, DialogActions,
  CircularProgress, Alert, InputAdornment, MenuItem, Select,
  FormControl, InputLabel
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export default function Packages({ toggleTheme, themeMode }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [selected, setSelected] = useState(null);
  const [link, setLink] = useState('');
  const [quantity, setQuantity] = useState('');
  const [orderError, setOrderError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery(
    ['services', search, category],
    () => axios.get(`${API_URL}/services`, { params: { search, category } }).then((r) => r.data),
    { keepPreviousData: true }
  );

  const orderMutation = useMutation(
    (orderData) => axios.post(`${API_URL}/orders`, orderData),
    {
      onSuccess: () => {
        setOrderSuccess('Order placed successfully!');
        setSelected(null);
        setLink('');
        setQuantity('');
        queryClient.invalidateQueries('balance');
        queryClient.invalidateQueries('recentOrders');
      },
      onError: (err) => {
        setOrderError(err.response?.data?.message || 'Failed to place order');
      },
    }
  );

  const handleOrder = () => {
    setOrderError('');
    const qty = parseInt(quantity);
    if (!link.trim()) return setOrderError('Please enter a valid link');
    if (!qty || qty < selected.min || qty > selected.max) {
      return setOrderError(`Quantity must be between ${selected.min} and ${selected.max}`);
    }
    orderMutation.mutate({ serviceId: selected._id, link: link.trim(), quantity: qty });
  };

  const services = data?.services || [];
  const categories = data?.categories || [];
  const price = selected ? ((selected.rate / 1000) * parseInt(quantity || 0)).toFixed(6) : 0;

  return (
    <Box sx={{ display: 'flex' }}>
      <Navbar toggleTheme={toggleTheme} themeMode={themeMode} />
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, p: 3, ml: { md: '220px' } }}>
        <Toolbar />
        <Typography variant="h5" fontWeight={700} mb={3}>📦 SMM Packages</Typography>

        {orderSuccess && <Alert severity="success" onClose={() => setOrderSuccess('')} sx={{ mb: 2 }}>{orderSuccess}</Alert>}

        <Paper sx={{ p: 2, mb: 3, borderRadius: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                placeholder="Search services..."
                fullWidth
                size="small"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Category</InputLabel>
                <Select value={category} onChange={(e) => setCategory(e.target.value)} label="Category">
                  <MenuItem value="">All Categories</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {isLoading ? (
          <Box textAlign="center" py={8}><CircularProgress /></Box>
        ) : services.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Typography color="text.secondary">No services found</Typography>
          </Box>
        ) : (
          <Grid container spacing={2}>
            {services.map((svc) => (
              <Grid item xs={12} sm={6} md={4} key={svc._id}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.5, borderRadius: 2, height: '100%', cursor: 'pointer',
                    transition: 'all 0.2s',
                    '&:hover': { borderColor: 'primary.main', boxShadow: 3 },
                  }}
                  onClick={() => { setSelected(svc); setOrderError(''); setQuantity(String(svc.min)); }}
                >
                  <Chip label={svc.category} size="small" sx={{ mb: 1 }} />
                  <Typography variant="subtitle2" fontWeight={600} gutterBottom>{svc.name}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1, minHeight: 40 }} noWrap>
                    {svc.description || svc.type}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption">💵 ${svc.rate}/1000</Typography>
                    <Typography variant="caption">📊 {svc.min}-{svc.max}</Typography>
                  </Box>
                  <Button variant="contained" size="small" fullWidth sx={{ mt: 1.5 }}>
                    Order Now
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
          <DialogTitle>🛒 Place Order — {selected?.name}</DialogTitle>
          <DialogContent>
            {orderError && <Alert severity="error" sx={{ mb: 2 }}>{orderError}</Alert>}
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Rate: <strong>${selected?.rate}/1000</strong> | Min: {selected?.min} | Max: {selected?.max}
            </Typography>
            <TextField
              label="Target Link (URL)"
              fullWidth
              value={link}
              onChange={(e) => setLink(e.target.value)}
              placeholder="https://..."
              sx={{ mb: 2 }}
            />
            <TextField
              label="Quantity"
              type="number"
              fullWidth
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              inputProps={{ min: selected?.min, max: selected?.max }}
              helperText={`Min: ${selected?.min} | Max: ${selected?.max}`}
            />
            {quantity && parseInt(quantity) > 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Estimated Cost: <strong>${price}</strong>
              </Alert>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setSelected(null)}>Cancel</Button>
            <Button variant="contained" onClick={handleOrder} disabled={orderMutation.isLoading}>
              {orderMutation.isLoading ? <CircularProgress size={20} /> : 'Place Order'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
