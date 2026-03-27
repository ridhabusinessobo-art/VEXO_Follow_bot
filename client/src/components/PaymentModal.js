import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, ToggleButton, ToggleButtonGroup,
  Typography, Box, Alert, CircularProgress
} from '@mui/material';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import CurrencyBitcoinIcon from '@mui/icons-material/CurrencyBitcoin';
import PaymentIcon from '@mui/icons-material/Payment';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const methods = [
  { value: 'stripe', label: 'Credit Card', icon: <CreditCardIcon /> },
  { value: 'paypal', label: 'PayPal', icon: <PaymentIcon /> },
  { value: 'crypto', label: 'Crypto', icon: <CurrencyBitcoinIcon /> },
  { value: 'bank_transfer', label: 'Bank Transfer', icon: <AccountBalanceIcon /> },
];

export default function PaymentModal({ open, onClose, onSuccess }) {
  const [method, setMethod] = useState('stripe');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [paymentData, setPaymentData] = useState(null);

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) < 1) {
      setError('Minimum deposit is $1');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.post(`${API_URL}/payments/deposit`, {
        amount: parseFloat(amount),
        method,
      });
      setPaymentData(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!paymentData?.reference) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/payments/confirm`, { reference: paymentData.reference });
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Confirmation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setPaymentData(null);
    setAmount('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>💳 Add Funds to Wallet</DialogTitle>
      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {!paymentData ? (
          <>
            <Typography variant="subtitle2" gutterBottom>Select Payment Method</Typography>
            <ToggleButtonGroup value={method} exclusive onChange={(_, v) => v && setMethod(v)} fullWidth sx={{ mb: 3, flexWrap: 'wrap' }}>
              {methods.map((m) => (
                <ToggleButton key={m.value} value={m.value} sx={{ gap: 1, flex: '1 1 40%' }}>
                  {m.icon} {m.label}
                </ToggleButton>
              ))}
            </ToggleButtonGroup>
            <TextField
              label="Amount (USD)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              inputProps={{ min: 1, step: 0.01 }}
              helperText="Minimum deposit: $1.00"
            />
          </>
        ) : (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              <Typography variant="subtitle2">Payment Instructions</Typography>
              <Typography variant="body2">{paymentData.instructions}</Typography>
              {paymentData.walletAddress && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Wallet:</strong> {paymentData.walletAddress}
                </Typography>
              )}
              {paymentData.bankAccount && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <strong>Account:</strong> {paymentData.bankAccount}
                </Typography>
              )}
              <Typography variant="body2" sx={{ mt: 1 }}>
                <strong>Reference:</strong> {paymentData.reference}
              </Typography>
            </Alert>
            <Typography variant="body2" color="text.secondary">
              After completing payment, click "I've Paid" below to confirm.
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {!paymentData ? (
          <Button variant="contained" onClick={handleDeposit} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Proceed'}
          </Button>
        ) : (
          <Button variant="contained" color="success" onClick={handleConfirm} disabled={loading}>
            {loading ? <CircularProgress size={20} /> : "I've Paid"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
