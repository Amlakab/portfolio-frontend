'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  CircularProgress, Chip, IconButton,
  Button, Dialog, DialogTitle,
  DialogContent, DialogActions,
  useMediaQuery, Snackbar, Alert,
  Divider, Stack, Grid,
  Avatar, Badge, Tooltip
} from '@mui/material';
import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import {
  Restaurant, CheckCircle, Pending,
  LocalShipping, Inventory, Receipt,
  AttachMoney, Person, Phone,
  Email, LocationOn, DoneAll,
  Kitchen, Timer, AssignmentInd,
  Cancel, Refresh, ArrowBack,
  Visibility
} from '@mui/icons-material';
import { orderApi } from '@/app/utils/order';
import { Order, OrderStatus } from '@/types/order';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const ChefOrdersPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [activeTab, setActiveTab] = useState<'available' | 'preparing'>('available');

  useEffect(() => {
    if (!user || (user?.role !== 'chef' && user?.role !== 'admin')) {
      router.push('/auth/login?redirect=/chef/orders');
    }
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        status: activeTab === 'available' ? 'CONFIRMED' : 'PREPARING'
      };
      const response = await orderApi.getChefOrders(params);
      setOrders(response.data.data || []);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const handleTakeOrder = async (orderId: string) => {
    try {
      await orderApi.takeOrder(orderId);
      setSuccess('Order taken successfully! Start preparing.');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to take order');
    }
  };

  const handleMarkReady = async (orderId: string) => {
    try {
      await orderApi.markOrderReady(orderId);
      setSuccess('Order marked as ready for delivery!');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to mark order ready');
    }
  };

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setOpenViewDialog(true);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString('am-ET')}`;
  };

  const getStatusChip = (status: OrderStatus) => {
    const configs = {
      PENDING: { color: 'warning', label: 'Pending' },
      CONFIRMED: { color: 'info', label: 'Confirmed' },
      PREPARING: { color: 'primary', label: 'Preparing' },
      READY: { color: 'success', label: 'Ready' },
      DELIVERING: { color: 'info', label: 'Delivering' },
      DELIVERED: { color: 'success', label: 'Delivered' },
      RATED: { color: 'success', label: 'Rated' },
      COMPLETED: { color: 'success', label: 'Completed' },
      CANCELLED: { color: 'error', label: 'Cancelled' },
    };
    const config = configs[status] || configs.PENDING;
    return <Chip label={config.label} color={config.color as any} size="small" />;
  };

  if (!user || (user?.role !== 'chef' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
    }`}>
      {/* <Navbar /> */}
      
      <Box sx={{ pt: 2, px: { xs: 2, sm: 3, md: 4 }, maxWidth: '1400px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
                fontWeight: 'bold',
                color: theme === 'dark' ? '#00ffff' : '#007bff'
              }}>
                Chef Orders
              </Typography>
              <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                {activeTab === 'available' ? 'Orders ready to be prepared' : 'Orders you are preparing'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchOrders}
              sx={{
                borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                color: theme === 'dark' ? '#00ffff' : '#007bff',
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                }
              }}
            >
              Refresh
            </Button>
          </Box>
        </motion.div>

        {/* Tabs */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant={activeTab === 'available' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('available')}
            startIcon={<Inventory />}
            sx={{
              borderRadius: 2,
              ...(activeTab === 'available' ? {
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                  : 'linear-gradient(135deg, #007bff, #0056b3)',
                color: '#fff',
                '&:hover': {
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #00b3b3, #008080)'
                    : 'linear-gradient(135deg, #0056b3, #004080)'
                }
              } : {
                borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                color: theme === 'dark' ? '#00ffff' : '#007bff',
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                }
              })
            }}
          >
            Available Orders
            <Badge 
              badgeContent={orders.length}
              sx={{ ml: 1, '& .MuiBadge-badge': { backgroundColor: '#ff9900', color: 'white' } }}
            />
          </Button>
          <Button
            variant={activeTab === 'preparing' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('preparing')}
            startIcon={<Kitchen />}
            sx={{
              borderRadius: 2,
              ...(activeTab === 'preparing' ? {
                background: theme === 'dark'
                  ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                  : 'linear-gradient(135deg, #007bff, #0056b3)',
                color: '#fff',
                '&:hover': {
                  background: theme === 'dark'
                    ? 'linear-gradient(135deg, #00b3b3, #008080)'
                    : 'linear-gradient(135deg, #0056b3, #004080)'
                }
              } : {
                borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                color: theme === 'dark' ? '#00ffff' : '#007bff',
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                }
              })
            }}
          >
            Preparing
          </Button>
        </Box>

        {/* Orders Grid */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Kitchen sx={{ fontSize: 64, color: theme === 'dark' ? '#334155' : '#cbd5e1' }} />
            <Typography variant="h6" sx={{ mt: 2, color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
              {activeTab === 'available' ? 'No orders available' : 'No orders being prepared'}
            </Typography>
            <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
              {activeTab === 'available' ? 'Check back later for new orders' : 'You have no active orders'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(3, 1fr)'
            },
            gap: 3
            }}>
            {orders.map((order) => (
                <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                >
                <Card sx={{ 
                    height: '100%',
                    borderRadius: 2,
                    backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                    backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none',
                    transition: 'transform 0.2s',
                    '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: theme === 'dark' 
                        ? '0 8px 24px rgba(0, 255, 255, 0.1)' 
                        : '0 8px 24px rgba(0,0,0,0.1)'
                    }
                }}>
                    <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            {order.orderNumber}
                        </Typography>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            {formatDate(order.created_at)}
                        </Typography>
                        </Box>
                        {getStatusChip(order.status)}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mb: 2 }}>
                        <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1 }}>
                        Items:
                        </Typography>
                        {order.items.map((item, index) => (
                        <Box 
                            key={index}
                            sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between',
                            py: 0.5
                            }}
                        >
                            <Typography variant="body2">
                            {item.name} x {item.quantity}
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {formatPrice(item.total)}
                            </Typography>
                        </Box>
                        ))}
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                        Customer: {order.customer.name}
                        </Typography>
                        <Typography variant="h6" sx={{ 
                        fontWeight: 'bold',
                        color: theme === 'dark' ? '#00ffff' : '#007bff'
                        }}>
                        {formatPrice(order.totalAmount)}
                        </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                        size="small"
                        startIcon={<Visibility />}
                        onClick={() => handleViewOrder(order)}
                        fullWidth
                        sx={{
                            color: theme === 'dark' ? '#00ffff' : '#007bff',
                            borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                            '&:hover': {
                            backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                            }
                        }}
                        >
                        View
                        </Button>
                        
                        {activeTab === 'available' && order.status === 'CONFIRMED' && (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<AssignmentInd />}
                            onClick={() => handleTakeOrder(order._id)}
                            fullWidth
                            sx={{
                            background: theme === 'dark'
                                ? 'linear-gradient(135deg, #00ff00, #00b300)'
                                : 'linear-gradient(135deg, #28a745, #218838)',
                            '&:hover': {
                                background: theme === 'dark'
                                ? 'linear-gradient(135deg, #00b300, #008000)'
                                : 'linear-gradient(135deg, #218838, #1e7e34)'
                            }
                            }}
                        >
                            Take Order
                        </Button>
                        )}
                        
                        {activeTab === 'preparing' && order.status === 'PREPARING' && (
                        <Button
                            size="small"
                            variant="contained"
                            startIcon={<DoneAll />}
                            onClick={() => handleMarkReady(order._id)}
                            fullWidth
                            sx={{
                            background: theme === 'dark'
                                ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                                : 'linear-gradient(135deg, #007bff, #0056b3)',
                            '&:hover': {
                                background: theme === 'dark'
                                ? 'linear-gradient(135deg, #00b3b3, #008080)'
                                : 'linear-gradient(135deg, #0056b3, #004080)'
                            }
                            }}
                        >
                            Mark Ready
                        </Button>
                        )}
                    </Box>
                    </CardContent>
                </Card>
                </motion.div>
            ))}
            </Box>
        )}
      </Box>

      {/* View Order Dialog */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
            color: theme === 'dark' ? '#ccd6f6' : '#333333'
          }
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{
              borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              py: 3
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {selectedOrder.orderNumber}
                  </Typography>
                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    {formatDate(selectedOrder.created_at)}
                  </Typography>
                </Box>
                {getStatusChip(selectedOrder.status)}
              </Box>
            </DialogTitle>

            <DialogContent sx={{ p: 3 }}>
              <Stack spacing={3}>
                {/* Order Items */}
                <Box>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    color: theme === 'dark' ? '#00ffff' : '#007bff'
                  }}>
                    Order Items
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {selectedOrder.items.map((item, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between',
                          py: 1,
                          borderBottom: index < selectedOrder.items.length - 1 
                            ? (theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb')
                            : 'none'
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                            {item.name} x {item.quantity}
                          </Typography>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            {formatPrice(item.price)} each
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {formatPrice(item.total)}
                        </Typography>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: 1 }} />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', pt: 1 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold',
                        color: theme === 'dark' ? '#00ffff' : '#007bff'
                      }}>
                        {formatPrice(selectedOrder.totalAmount)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Customer Info */}
                <Box>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    color: theme === 'dark' ? '#00ffff' : '#007bff'
                  }}>
                    Customer Details
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Person fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                      <Typography variant="body2">{selectedOrder.customer.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Phone fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                      <Typography variant="body2">{selectedOrder.customer.phone}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Email fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                      <Typography variant="body2">{selectedOrder.customer.email}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <LocationOn fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                      <Typography variant="body2">{selectedOrder.customer.deliveryAddress}</Typography>
                    </Box>
                  </Stack>
                </Box>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold', 
                      mb: 1,
                      color: theme === 'dark' ? '#00ffff' : '#007bff'
                    }}>
                      Special Instructions
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                      {selectedOrder.specialInstructions}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{
              p: 3,
              borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              justifyContent: 'space-between'
            }}>
              <Button
                onClick={() => setOpenViewDialog(false)}
                sx={{
                  color: theme === 'dark' ? '#00ffff' : '#007bff',
                  '&:hover': {
                    backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                  }
                }}
              >
                Close
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                {selectedOrder.status === 'CONFIRMED' && (
                  <Button
                    variant="contained"
                    startIcon={<AssignmentInd />}
                    onClick={() => {
                      handleTakeOrder(selectedOrder._id);
                      setOpenViewDialog(false);
                    }}
                    sx={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #00ff00, #00b300)'
                        : 'linear-gradient(135deg, #28a745, #218838)',
                      '&:hover': {
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00b300, #008000)'
                          : 'linear-gradient(135deg, #218838, #1e7e34)'
                      }
                    }}
                  >
                    Take Order
                  </Button>
                )}
                
                {selectedOrder.status === 'PREPARING' && (
                  <Button
                    variant="contained"
                    startIcon={<DoneAll />}
                    onClick={() => {
                      handleMarkReady(selectedOrder._id);
                      setOpenViewDialog(false);
                    }}
                    sx={{
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                        : 'linear-gradient(135deg, #007bff, #0056b3)',
                      '&:hover': {
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00b3b3, #008080)'
                          : 'linear-gradient(135deg, #0056b3, #004080)'
                      }
                    }}
                  >
                    Mark Ready
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Snackbars */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" onClose={() => setError('')}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" onClose={() => setSuccess('')}>
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChefOrdersPage;