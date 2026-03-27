const axios = require('axios');

const smmClient = axios.create({
  baseURL: process.env.SMM_API_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

const smmRequest = async (action, params = {}) => {
  const payload = {
    key: process.env.SMM_API_KEY,
    action,
    ...params,
  };
  const response = await smmClient.post('', payload);
  if (response.data.error) {
    throw new Error(response.data.error);
  }
  return response.data;
};

const smmApi = {
  getServices: () => smmRequest('services'),

  createOrder: ({ service, link, quantity }) =>
    smmRequest('add', { service, link, quantity }),

  getOrderStatus: (orderId) =>
    smmRequest('status', { order: orderId }),

  getMultipleOrderStatuses: (orderIds) =>
    smmRequest('status', { orders: orderIds.join(',') }),

  cancelOrder: (orderId) =>
    smmRequest('cancel', { orders: [orderId] }),

  getBalance: () => smmRequest('balance'),
};

module.exports = smmApi;
