import React from 'react';
import { Card, CardContent, Chip, Typography, Box, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SyncIcon from '@mui/icons-material/Sync';
import ErrorIcon from '@mui/icons-material/Error';
import CancelIcon from '@mui/icons-material/Cancel';

const statusConfig = {
  pending: { color: 'warning', icon: <HourglassEmptyIcon fontSize="small" />, label: 'Pending' },
  processing: { color: 'info', icon: <SyncIcon fontSize="small" />, label: 'Processing' },
  completed: { color: 'success', icon: <CheckCircleIcon fontSize="small" />, label: 'Completed' },
  failed: { color: 'error', icon: <ErrorIcon fontSize="small" />, label: 'Failed' },
  cancelled: { color: 'default', icon: <CancelIcon fontSize="small" />, label: 'Cancelled' },
  partial: { color: 'secondary', icon: <SyncIcon fontSize="small" />, label: 'Partial' },
};

export default function OrderCard({ order }) {
  const status = statusConfig[order.status] || statusConfig.pending;
  const service = order.serviceId;
  const progress = order.startCount && order.quantity
    ? Math.min(100, ((order.quantity - (order.remains || 0)) / order.quantity) * 100)
    : null;

  return (
    <Card variant="outlined" sx={{ mb: 2, borderRadius: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              {service?.category || 'SMM Service'}
            </Typography>
            <Typography variant="body1" fontWeight={600}>
              {service?.name || 'Unknown Service'}
            </Typography>
          </Box>
          <Chip
            icon={status.icon}
            label={status.label}
            color={status.color}
            size="small"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" noWrap sx={{ mb: 1 }}>
          🔗 {order.link}
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
          <Typography variant="body2">
            📊 Qty: <strong>{order.quantity?.toLocaleString()}</strong>
          </Typography>
          <Typography variant="body2">
            💰 Price: <strong>${order.price?.toFixed(4)}</strong>
          </Typography>
        </Box>
        {progress !== null && (
          <Box sx={{ mt: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="caption">Progress</Typography>
              <Typography variant="caption">{progress.toFixed(0)}%</Typography>
            </Box>
            <LinearProgress variant="determinate" value={progress} color={status.color} />
          </Box>
        )}
        {order.externalOrderId && (
          <Typography variant="caption" color="text.secondary">
            Order ID: #{order.externalOrderId}
          </Typography>
        )}
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {new Date(order.createdAt).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
}
