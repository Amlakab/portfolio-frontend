'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  CircularProgress, Chip, IconButton,
  Button, Dialog, DialogTitle,
  DialogContent, DialogActions,
  useMediaQuery, Snackbar, Alert,
  Divider, Stack,
  Avatar, Badge, Tooltip
} from '@mui/material';
import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import {
  DeliveryDining, CheckCircle, Pending,
  LocalShipping, Inventory, Receipt,
  AttachMoney, Person, Phone,
  Email, LocationOn, DoneAll,
  Restaurant, Timer, AssignmentReturn,
  Cancel, Refresh, ArrowBack,
  Visibility
} from '@mui/icons-material';
import { orderApi } from '@/app/utils/order';
import { Order, OrderStatus } from '@/types/order';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const WaiterOrdersPage = () => {
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
  const [activeTab, setActiveTab] = useState<'ready' | 'delivering'>('ready');

  useEffect(() => {
    if (!user || (user?.role !== 'waiter' && user?.role !== 'admin')) {
      router.push('/auth/login?redirect=/waiter/orders');
    }
  }, [user, router]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = {
        status: activeTab === 'ready' ? 'READY' : 'DELIVERING'
      };
      const response = await orderApi.getWaiterOrders(params);
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

  const handleTakeDelivery = async (orderId: string) => {
    try {
      await orderApi.takeDelivery(orderId);
      setSuccess('Delivery taken successfully! Order is now DELIVERING.');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to take delivery');
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    try {
      await orderApi.markDelivered(orderId);
      setSuccess('Order marked as delivered!');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to mark delivered');
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
    const configs: Record<OrderStatus, { color: any; label: string }> = {
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
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  if (!user || (user?.role !== 'waiter' && user?.role !== 'admin')) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
    }`}>
      {/* <Navbar /> */}
      
      <Box sx={{ 
        pt: { xs: 0, sm: 2 }, 
        px: { xs: 1, sm: 2, md: 3, lg: 4 }, 
        maxWidth: '1400px', 
        margin: '0 auto',
        width: '100%',
        overflowX: 'hidden'
      }}>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' }, 
            mb: 4,
            gap: 2
          }}>
            <Box>
              <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
                fontWeight: 'bold',
                color: theme === 'dark' ? '#00ffff' : '#007bff'
              }}>
                Waiter Orders
              </Typography>
              <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                {activeTab === 'ready' ? 'Orders ready for delivery' : 'Orders you are delivering'}
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={fetchOrders}
              size={isMobile ? "small" : "medium"}
              sx={{
                borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                color: theme === 'dark' ? '#00ffff' : '#007bff',
                width: { xs: '100%', sm: 'auto' },
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
        <Box sx={{ 
          display: 'flex', 
          gap: { xs: 1, sm: 2 }, 
          mb: 3,
          flexWrap: 'wrap'
        }}>
          <Button
            variant={activeTab === 'ready' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('ready')}
            startIcon={<Inventory />}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              flex: { xs: '1', sm: 'none' },
              ...(activeTab === 'ready' ? {
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
            {isMobile ? 'Ready' : 'Ready for Delivery'}
            <Badge 
              badgeContent={orders.length}
              sx={{ ml: 1, '& .MuiBadge-badge': { backgroundColor: '#ff9900', color: 'white' } }}
            />
          </Button>
          <Button
            variant={activeTab === 'delivering' ? 'contained' : 'outlined'}
            onClick={() => setActiveTab('delivering')}
            startIcon={<DeliveryDining />}
            fullWidth={isMobile}
            sx={{
              borderRadius: 2,
              flex: { xs: '1', sm: 'none' },
              ...(activeTab === 'delivering' ? {
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
            {isMobile ? 'Delivering' : 'Delivering'}
          </Button>
        </Box>

        {/* Orders Grid - Fully Responsive */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <DeliveryDining sx={{ 
              fontSize: { xs: 48, sm: 64 }, 
              color: theme === 'dark' ? '#334155' : '#cbd5e1' 
            }} />
            <Typography variant="h6" sx={{ 
              mt: 2, 
              color: theme === 'dark' ? '#a8b2d1' : '#666666',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}>
              {activeTab === 'ready' ? 'No orders ready for delivery' : 'No orders being delivered'}
            </Typography>
            <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
              {activeTab === 'ready' ? 'Check back later for new orders' : 'You have no active deliveries'}
            </Typography>
          </Box>
        ) : (
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)'
            },
            gap: { xs: 2, sm: 3 }
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
                    transform: isMobile ? 'none' : 'translateY(-4px)',
                    boxShadow: theme === 'dark' 
                      ? '0 8px 24px rgba(0, 255, 255, 0.1)' 
                      : '0 8px 24px rgba(0,0,0,0.1)'
                  }
                }}>
                  <CardContent sx={{ 
                    p: { xs: 2, sm: 2.5, md: 3 },
                    '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } }
                  }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box sx={{ width: '100%' }}>
                        <Typography variant="subtitle1" sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.95rem', sm: '1.05rem' }
                        }}>
                          {order.orderNumber}
                        </Typography>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          {formatDate(order.created_at)}
                        </Typography>
                      </Box>
                      {getStatusChip(order.status)}
                    </Box>

                    <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'medium', mb: 1, fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
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
                          <Typography variant="body2" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {item.name} x {item.quantity}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {formatPrice(item.total)}
                          </Typography>
                        </Box>
                      ))}
                    </Box>

                    <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      justifyContent: 'space-between', 
                      alignItems: { xs: 'flex-start', sm: 'center' }, 
                      mb: 2,
                      gap: { xs: 0.5, sm: 0 }
                    }}>
                      <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        Customer: {order.customer.name}
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold',
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        fontSize: { xs: '1rem', sm: '1.15rem' }
                      }}>
                        {formatPrice(order.totalAmount)}
                      </Typography>
                    </Box>

                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: { xs: 'column', sm: 'row' },
                      gap: { xs: 1, sm: 1 }
                    }}>
                      <Button
                        size={isMobile ? "small" : "medium"}
                        startIcon={<Visibility />}
                        onClick={() => handleViewOrder(order)}
                        fullWidth
                        sx={{
                          color: theme === 'dark' ? '#00ffff' : '#007bff',
                          borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                          fontSize: { xs: '0.7rem', sm: '0.875rem' },
                          padding: { xs: '6px 8px', sm: '6px 16px' },
                          '&:hover': {
                            backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                          }
                        }}
                      >
                        View
                      </Button>
                      
                      {activeTab === 'ready' && order.status === 'READY' && (
                        <Button
                          size={isMobile ? "small" : "medium"}
                          variant="contained"
                          startIcon={<AssignmentReturn />}
                          onClick={() => handleTakeDelivery(order._id)}
                          fullWidth
                          sx={{
                            background: theme === 'dark'
                              ? 'linear-gradient(135deg, #00ff00, #00b300)'
                              : 'linear-gradient(135deg, #28a745, #218838)',
                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            padding: { xs: '6px 8px', sm: '6px 16px' },
                            '&:hover': {
                              background: theme === 'dark'
                                ? 'linear-gradient(135deg, #00b300, #008000)'
                                : 'linear-gradient(135deg, #218838, #1e7e34)'
                            }
                          }}
                        >
                          {isMobile ? 'Take' : 'Take Delivery'}
                        </Button>
                      )}
                      
                      {activeTab === 'delivering' && order.status === 'DELIVERING' && (
                        <Button
                          size={isMobile ? "small" : "medium"}
                          variant="contained"
                          startIcon={<DoneAll />}
                          onClick={() => handleMarkDelivered(order._id)}
                          fullWidth
                          sx={{
                            background: theme === 'dark'
                              ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                              : 'linear-gradient(135deg, #007bff, #0056b3)',
                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            padding: { xs: '6px 8px', sm: '6px 16px' },
                            '&:hover': {
                              background: theme === 'dark'
                                ? 'linear-gradient(135deg, #00b3b3, #008080)'
                                : 'linear-gradient(135deg, #0056b3, #004080)'
                            }
                          }}
                        >
                          {isMobile ? 'Deliver' : 'Mark Delivered'}
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

      {/* View Order Dialog - Fully Responsive */}
      <Dialog
        open={openViewDialog}
        onClose={() => setOpenViewDialog(false)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
            color: theme === 'dark' ? '#ccd6f6' : '#333333',
            width: '100%',
            maxWidth: { xs: '100%', sm: '600px', md: '700px' },
            margin: { xs: 0, sm: 'auto' },
            maxHeight: { xs: '100vh', sm: '90vh' },
            overflow: 'hidden'
          }
        }}
      >
        {selectedOrder && (
          <>
            <DialogTitle sx={{
              borderBottom: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              py: { xs: 2, sm: 2.5, md: 3 },
              px: { xs: 2, sm: 3 }
            }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between', 
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: { xs: 1, sm: 0 }
              }}>
                <Box>
                  <Typography variant="h6" sx={{ 
                    fontWeight: 'bold',
                    fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                  }}>
                    {selectedOrder.orderNumber}
                  </Typography>
                  <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                    {formatDate(selectedOrder.created_at)}
                  </Typography>
                </Box>
                {getStatusChip(selectedOrder.status)}
              </Box>
            </DialogTitle>

            <DialogContent sx={{ 
              p: { xs: 2, sm: 2.5, md: 3 },
              overflowY: 'auto',
              flex: 1
            }}>
              <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Order Items */}
                <Box>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 'bold', 
                    mb: { xs: 1.5, sm: 2 },
                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                    fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' }
                  }}>
                    Order Items
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    {selectedOrder.items.map((item, index) => (
                      <Box 
                        key={index}
                        sx={{ 
                          display: 'flex', 
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 1, sm: 0 },
                          borderBottom: index < selectedOrder.items.length - 1 
                            ? (theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb')
                            : 'none',
                          gap: { xs: 0.5, sm: 0 }
                        }}
                      >
                        <Box>
                          <Typography variant="body2" sx={{ 
                            fontWeight: 'medium',
                            fontSize: { xs: '0.85rem', sm: '0.875rem' }
                          }}>
                            {item.name} x {item.quantity}
                          </Typography>
                          <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                            {formatPrice(item.price)} each
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ 
                          fontWeight: 'bold',
                          fontSize: { xs: '0.85rem', sm: '0.875rem' }
                        }}>
                          {formatPrice(item.total)}
                        </Typography>
                      </Box>
                    ))}
                    
                    <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />
                    
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      pt: { xs: 1, sm: 1.5 },
                      px: { xs: 1, sm: 0 }
                    }}>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.95rem', sm: '1.05rem' }
                      }}>
                        Total
                      </Typography>
                      <Typography variant="h6" sx={{ 
                        fontWeight: 'bold',
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }
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
                    mb: { xs: 1.5, sm: 2 },
                    color: theme === 'dark' ? '#00ffff' : '#007bff',
                    fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' }
                  }}>
                    Customer Details
                  </Typography>
                  <Box sx={{ 
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: { xs: 1, sm: 1.5 }
                  }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Person fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, wordBreak: 'break-word' }}>
                        {selectedOrder.customer.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Phone fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}>
                        {selectedOrder.customer.phone}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, gridColumn: { xs: '1', sm: '1/3' } }}>
                      <Email fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', fontSize: { xs: '1rem', sm: '1.1rem' } }} />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, wordBreak: 'break-word' }}>
                        {selectedOrder.customer.email}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, gridColumn: { xs: '1', sm: '1/3' } }}>
                      <LocationOn fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666', fontSize: { xs: '1rem', sm: '1.1rem' }, mt: 0.3 }} />
                      <Typography variant="body2" sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' }, wordBreak: 'break-word' }}>
                        {selectedOrder.customer.deliveryAddress}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <Box>
                    <Typography variant="subtitle1" sx={{ 
                      fontWeight: 'bold', 
                      mb: 1,
                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                      fontSize: { xs: '0.95rem', sm: '1.05rem', md: '1.1rem' }
                    }}>
                      Special Instructions
                    </Typography>
                    <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ 
                      fontSize: { xs: '0.85rem', sm: '0.875rem' },
                      wordBreak: 'break-word'
                    }}>
                      {selectedOrder.specialInstructions}
                    </Typography>
                  </Box>
                )}
              </Stack>
            </DialogContent>

            <DialogActions sx={{
              p: { xs: 2, sm: 2.5, md: 3 },
              borderTop: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
              justifyContent: 'space-between',
              flexDirection: { xs: 'column-reverse', sm: 'row' },
              gap: { xs: 1, sm: 0 }
            }}>
              <Button
                onClick={() => setOpenViewDialog(false)}
                fullWidth={isMobile}
                sx={{
                  color: theme === 'dark' ? '#00ffff' : '#007bff',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                  }
                }}
              >
                Close
              </Button>
              
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', sm: 'row' },
                gap: { xs: 1, sm: 2 },
                width: { xs: '100%', sm: 'auto' }
              }}>
                {selectedOrder.status === 'READY' && (
                  <Button
                    variant="contained"
                    startIcon={<AssignmentReturn />}
                    onClick={() => {
                      handleTakeDelivery(selectedOrder._id);
                      setOpenViewDialog(false);
                    }}
                    fullWidth={isMobile}
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
                    Take Delivery
                  </Button>
                )}
                
                {selectedOrder.status === 'DELIVERING' && (
                  <Button
                    variant="contained"
                    startIcon={<DoneAll />}
                    onClick={() => {
                      handleMarkDelivered(selectedOrder._id);
                      setOpenViewDialog(false);
                    }}
                    fullWidth={isMobile}
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
                    Mark Delivered
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
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert severity="error" onClose={() => setError('')} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>

      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={() => setSuccess('')}
        anchorOrigin={{ 
          vertical: 'bottom', 
          horizontal: isMobile ? 'center' : 'right' 
        }}
      >
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ width: '100%' }}>
          {success}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default WaiterOrdersPage;