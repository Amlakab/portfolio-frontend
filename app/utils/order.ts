import api from './api';

export const orderApi = {
  // Customer
  createOrder: (data: any) => api.post('/orders', data),
  getMyOrders: (params?: any) => api.get('/orders/my-orders', { params }),
  getMyOrder: (id: string) => api.get(`/orders/my-orders/${id}`),
  cancelOrder: (id: string, reason?: string) => api.patch(`/orders/my-orders/${id}/cancel`, { reason }),
  rateOrder: (id: string, rating: number, comment?: string) => 
    api.patch(`/orders/my-orders/${id}/rate`, { rating, comment }),
  getOrderRating: (id: string) => api.get(`/orders/${id}/rating`),
  
  // Admin/Manager
  getAllOrders: (params?: any) => api.get('/orders/admin/all', { params }),
  getOrderById: (id: string) => api.get(`/orders/admin/${id}`),
  confirmOrder: (id: string) => api.patch(`/orders/admin/${id}/confirm`),
  rejectOrder: (id: string, reason?: string) => api.patch(`/orders/admin/${id}/reject`, { reason }),
  assignChef: (id: string, chefId: string) => api.patch(`/orders/admin/${id}/assign-chef`, { chefId }),
  assignWaiter: (id: string, waiterId: string) => api.patch(`/orders/admin/${id}/assign-waiter`, { waiterId }),
  getOrderStats: () => api.get('/orders/admin/stats'),
  updateOrderStatus: (id: string, status: string, reason?: string) => 
    api.patch(`/orders/admin/${id}/status`, { status, reason }),
  
  // Chef
  getChefOrders: (params?: any) => api.get('/orders/chef/orders', { params }),
  takeOrder: (id: string) => api.patch(`/orders/chef/${id}/take`),
  markOrderReady: (id: string) => api.patch(`/orders/chef/${id}/ready`),
  
  // Waiter
  getWaiterOrders: (params?: any) => api.get('/orders/waiter/orders', { params }),
  takeDelivery: (id: string) => api.patch(`/orders/waiter/${id}/take`),
  markDelivered: (id: string) => api.patch(`/orders/waiter/${id}/deliver`),
  
  // Common
  getStatuses: () => api.get('/orders/statuses'),
};