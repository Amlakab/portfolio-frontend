'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  useMediaQuery,
  Snackbar,
  Alert,
  Divider,
  Stack,
  Rating,
  IconButton
} from '@mui/material';
import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import { OrderProgress } from '@/components/OrderProgress';
import {
  Restaurant,
  Visibility,
  Cancel,
  CheckCircle,
  Pending,
  LocalShipping,
  Receipt,
  Phone,
  Email,
  LocationOn,
  Person,
  DoneAll,
  Star,
  StarBorder
} from '@mui/icons-material';
import { orderApi } from '@/app/utils/order';
import { Order, OrderStatus } from '@/types/order';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const MyOrdersPage = () => {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user } = useAuth();
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [openViewDialog, setOpenViewDialog] = useState<boolean>(false);
  const [openCancelDialog, setOpenCancelDialog] = useState<boolean>(false);
  const [openRateDialog, setOpenRateDialog] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [tabValue, setTabValue] = useState<number>(0);
  const [ratingValue, setRatingValue] = useState<number | null>(null);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [ratingLoading, setRatingLoading] = useState<boolean>(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/auth/login?redirect=/customer/my-orders');
    }
  }, [user, router]);

  const fetchOrders = useCallback(async (status?: string) => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 10 };
      if (status && status !== 'ALL') {
        params.status = status;
      }
      const response = await orderApi.getMyOrders(params);
      setOrders(response.data.data.orders || []);
      setError('');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
  if (user) {
    const status = tabs[tabValue].value;
    fetchOrders(status);
  }
}, [tabValue, user, fetchOrders]);

  const handleViewOrder = async (order: Order) => {
    try {
      const response = await orderApi.getMyOrder(order._id);
      setSelectedOrder(response.data.data);
      setOpenViewDialog(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch order details');
    }
  };

  const handleCancelOrder = async () => {
    if (!selectedOrder) return;

    try {
      await orderApi.cancelOrder(selectedOrder._id, cancelReason || 'Cancelled by customer');
      setSuccess('Order cancelled successfully');
      setOpenCancelDialog(false);
      setSelectedOrder(null);
      setCancelReason('');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to cancel order');
    }
  };

  const handleRateOrder = async () => {
    if (!selectedOrder || !ratingValue) return;

    setRatingLoading(true);
    try {
      await orderApi.rateOrder(selectedOrder._id, ratingValue, ratingComment);
      setSuccess('Thank you for rating this order!');
      setOpenRateDialog(false);
      setRatingValue(null);
      setRatingComment('');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to rate order');
    } finally {
      setRatingLoading(false);
    }
  };

  const getStatusChip = (status: OrderStatus) => {
    const configs: Record<OrderStatus, { color: 'warning' | 'info' | 'primary' | 'success' | 'error'; label: string; icon: JSX.Element }> = {
      PENDING: { color: 'warning', label: 'Pending', icon: <Pending fontSize="small" /> },
      CONFIRMED: { color: 'info', label: 'Confirmed', icon: <CheckCircle fontSize="small" /> },
      PREPARING: { color: 'primary', label: 'Preparing', icon: <Restaurant fontSize="small" /> },
      READY: { color: 'success', label: 'Ready', icon: <LocalShipping fontSize="small" /> },
      DELIVERING: { color: 'info', label: 'Delivering', icon: <LocalShipping fontSize="small" /> },
      DELIVERED: { color: 'success', label: 'Delivered', icon: <CheckCircle fontSize="small" /> },
      RATED: { color: 'success', label: 'Rated ⭐', icon: <Star fontSize="small" /> },
      COMPLETED: { color: 'success', label: 'Completed', icon: <DoneAll fontSize="small" /> },
      CANCELLED: { color: 'error', label: 'Cancelled', icon: <Cancel fontSize="small" /> },
    };
    const config = configs[status] || configs.PENDING;
    return (
      <Chip
        label={config.label}
        color={config.color}
        size="small"
        icon={config.icon}
        sx={{
          height: isMobile ? 24 : 28,
          fontSize: isMobile ? '0.65rem' : '0.75rem',
          '& .MuiChip-label': {
            px: isMobile ? 0.5 : 1,
          }
        }}
      />
    );
  };

  const formatDate = (dateString: string): string => {
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

  const formatPrice = (price: number): string => {
    return `ETB ${price.toLocaleString('am-ET')}`;
  };

 const tabs: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Confirmed', value: 'CONFIRMED' },  // Add this
  { label: 'Preparing', value: 'PREPARING' },
  { label: 'Ready', value: 'READY' },
  { label: 'Delivering', value: 'DELIVERING' },
  { label: 'Delivered', value: 'DELIVERED' },
  { label: 'Rated', value: 'RATED' },
  { label: 'Cancelled', value: 'CANCELLED' }
];

  if (!user) {
    return null;
  }

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === 'dark'
          ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white'
          : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
      }`}
    >
      {/* <Navbar /> */}

      <Box
        sx={{
          pt: { xs: 0, sm: 2 },
          px: { xs: 1, sm: 2, md: 3, lg: 4 },
          maxWidth: '1400px',
          margin: '0 auto',
          width: '100%',
          overflowX: 'hidden'
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between',
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: 3,
              gap: 2
            }}
          >
            <Typography
              variant={isMobile ? 'h5' : 'h4'}
              sx={{
                fontWeight: 'bold',
                color: theme === 'dark' ? '#00ffff' : '#007bff',
                fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
              }}
            >
              My Orders
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Restaurant />}
              onClick={() => router.push('/menu')}
              size={isMobile ? 'small' : 'medium'}
              sx={{
                borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
                color: theme === 'dark' ? '#00ffff' : '#007bff',
                width: { xs: '100%', sm: 'auto' },
                '&:hover': {
                  backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                }
              }}
            >
              Order More
            </Button>
          </Box>
        </motion.div>

        {/* Tabs - Horizontal scroll with no scrollbar */}
        <Box
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 3,
            width: '100%',
            overflowX: 'auto',
            '&::-webkit-scrollbar': {
              height: 0,
              display: 'none'
            },
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}
        >
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons={isMobile ? false : 'auto'}
            allowScrollButtonsMobile={false}
            sx={{
              minHeight: { xs: 40, sm: 48 },
              '& .MuiTab-root': {
                color: theme === 'dark' ? '#a8b2d1' : '#666666',
                fontSize: { xs: '0.65rem', sm: '0.875rem' },
                minWidth: { xs: 'auto', sm: 90 },
                padding: { xs: '6px 10px', sm: '12px 16px' },
                minHeight: { xs: 36, sm: 48 },
                '&.Mui-selected': {
                  color: theme === 'dark' ? '#00ffff' : '#007bff'
                }
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme === 'dark' ? '#00ffff' : '#007bff',
                height: { xs: 2, sm: 3 }
              }
            }}
          >
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {tab.label}
                  </Box>
                }
                value={index}
              />
            ))}
          </Tabs>
        </Box>

        {/* Orders List */}
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: 400
            }}
          >
            <CircularProgress
              sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}
            />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8, px: 2 }}>
            <Receipt
              sx={{
                fontSize: { xs: 48, sm: 64 },
                color: theme === 'dark' ? '#334155' : '#cbd5e1'
              }}
            />
            <Typography
              variant="h6"
              sx={{
                mt: 2,
                color: theme === 'dark' ? '#a8b2d1' : '#666666',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              No orders found
            </Typography>
            <Typography
              variant="body2"
              color={theme === 'dark' ? '#94a3b8' : '#999999'}
              sx={{ mt: 1 }}
            >
              {tabValue === 0
                ? 'Start ordering delicious food!'
                : `No ${tabs[tabValue].label.toLowerCase()} orders`}
            </Typography>
            <Button
              variant="contained"
              startIcon={<Restaurant />}
              onClick={() => router.push('/menu')}
              sx={{
                mt: 3,
                background:
                  theme === 'dark'
                    ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                    : 'linear-gradient(135deg, #007bff, #0056b3)',
                '&:hover': {
                  background:
                    theme === 'dark'
                      ? 'linear-gradient(135deg, #00b3b3, #008080)'
                      : 'linear-gradient(135deg, #0056b3, #004080)'
                },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Browse Menu
            </Button>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 3 } }}>
            {orders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ width: '100%' }}
              >
                <Card
                  sx={{
                    borderRadius: 2,
                    backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                    border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                    backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none',
                    transition: 'transform 0.2s',
                    width: '100%',
                    overflow: 'hidden',
                    '&:hover': {
                      transform: isMobile ? 'none' : 'translateY(-2px)',
                      boxShadow:
                        theme === 'dark'
                          ? '0 8px 24px rgba(0, 255, 255, 0.1)'
                          : '0 8px 24px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <CardContent
                    sx={{
                      p: { xs: 2, sm: 2.5, md: 3 },
                      '&:last-child': { pb: { xs: 2, sm: 2.5, md: 3 } }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        mb: 2,
                        gap: { xs: 1, sm: 0 }
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#ccd6f6' : '#333333',
                            fontSize: { xs: '0.95rem', sm: '1.1rem', md: '1.25rem' }
                          }}
                        >
                          {order.orderNumber}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={theme === 'dark' ? '#a8b2d1' : '#666666'}
                        >
                          {formatDate(order.created_at)}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'row', sm: 'row' },
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          gap: { xs: 1, sm: 2 },
                          width: { xs: '100%', sm: 'auto' },
                          justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                        }}
                      >
                        {getStatusChip(order.status)}
                        {order.rating && (
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 0.5
                            }}
                          >
                            <Star
                              sx={{
                                color: '#ff9900',
                                fontSize: { xs: 16, sm: 20 }
                              }}
                            />
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 'bold',
                                color: '#ff9900'
                              }}
                            >
                              {order.rating}
                            </Typography>
                          </Box>
                        )}
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: 'bold',
                            color: theme === 'dark' ? '#00ffff' : '#007bff',
                            fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' }
                          }}
                        >
                          {formatPrice(order.totalAmount)}
                        </Typography>
                      </Box>
                    </Box>

                    <Divider sx={{ my: { xs: 1.5, sm: 2 } }} />

                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        justifyContent: 'space-between',
                        alignItems: { xs: 'flex-start', sm: 'center' },
                        gap: { xs: 1.5, sm: 1 }
                      }}
                    >
                      <Box sx={{ width: '100%' }}>
                        <Typography
                          variant="body2"
                          color={theme === 'dark' ? '#a8b2d1' : '#666666'}
                          sx={{
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            wordBreak: 'break-word'
                          }}
                        >
                          {order.items.map((item) => item.name).join(', ')}
                          {order.items.length > 1 &&
                            ` (${order.items.length} items)`}
                        </Typography>
                        <Typography
                          variant="caption"
                          color={theme === 'dark' ? '#94a3b8' : '#999999'}
                          sx={{
                            display: 'block',
                            fontSize: { xs: '0.7rem', sm: '0.75rem' }
                          }}
                        >
                          {order.customer.name} • {order.customer.phone}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: { xs: 1, sm: 1.5 },
                          width: { xs: '100%', sm: 'auto' },
                          justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                        }}
                      >
                        <Button
                          size={isMobile ? 'small' : 'medium'}
                          startIcon={<Visibility />}
                          onClick={() => handleViewOrder(order)}
                          sx={{
                            color: theme === 'dark' ? '#00ffff' : '#007bff',
                            fontSize: { xs: '0.7rem', sm: '0.875rem' },
                            padding: { xs: '4px 10px', sm: '6px 16px' },
                            '&:hover': {
                              backgroundColor:
                                theme === 'dark'
                                  ? '#00ffff20'
                                  : '#007bff10'
                            }
                          }}
                        >
                          {isMobile ? '' : 'View'}
                        </Button>

                        {order.status === 'PENDING' && (
                          <Button
                            size={isMobile ? 'small' : 'medium'}
                            startIcon={<Cancel />}
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenCancelDialog(true);
                            }}
                            color="error"
                            sx={{
                              fontSize: { xs: '0.7rem', sm: '0.875rem' },
                              padding: { xs: '4px 10px', sm: '6px 16px' }
                            }}
                          >
                            {isMobile ? '' : 'Cancel'}
                          </Button>
                        )}

                        {order.status === 'DELIVERED' && (
                          <Button
                            size={isMobile ? 'small' : 'medium'}
                            startIcon={<Star />}
                            onClick={() => {
                              setSelectedOrder(order);
                              setOpenRateDialog(true);
                            }}
                            sx={{
                              color: '#ff9900',
                              fontSize: { xs: '0.7rem', sm: '0.875rem' },
                              padding: { xs: '4px 10px', sm: '6px 16px' },
                              '&:hover': {
                                backgroundColor: '#ff990020'
                              }
                            }}
                          >
                            {isMobile ? '' : 'Rate'}
                          </Button>
                        )}
                      </Box>
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
            <DialogTitle
              sx={{
                borderBottom:
                  theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                py: { xs: 2, sm: 2.5, md: 3 },
                px: { xs: 2, sm: 3 }
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'space-between',
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: { xs: 1, sm: 0 }
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: 'bold',
                      fontSize: {
                        xs: '1rem',
                        sm: '1.1rem',
                        md: '1.25rem'
                      }
                    }}
                  >
                    {selectedOrder.orderNumber}
                  </Typography>
                  <Typography
                    variant="caption"
                    color={theme === 'dark' ? '#a8b2d1' : '#666666'}
                  >
                    {formatDate(selectedOrder.created_at)}
                  </Typography>
                </Box>
                {getStatusChip(selectedOrder.status)}
              </Box>
            </DialogTitle>

            <DialogContent
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                overflowY: 'auto',
                flex: 1
              }}
            >
              <Stack spacing={{ xs: 2, sm: 2.5, md: 3 }}>
                {/* Progress */}
                <Box
                  sx={{
                    p: { xs: 1.5, sm: 2 },
                    borderRadius: 2,
                    backgroundColor:
                      theme === 'dark' ? '#1e293b' : '#f8fafc',
                    border:
                      theme === 'dark'
                        ? '1px solid #334155'
                        : '1px solid #e5e7eb',
                    overflow: 'hidden',
                    width: '100%'
                  }}
                >
                  <OrderProgress
                    status={selectedOrder.status}
                    completedAt={
                      selectedOrder.deliveredAt || selectedOrder.completedAt
                    }
                    theme={theme}
                  />
                </Box>

                {/* Rating Display */}
                {selectedOrder.rating && (
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      backgroundColor:
                        theme === 'dark' ? '#1e293b' : '#f8fafc',
                      border:
                        theme === 'dark'
                          ? '1px solid #334155'
                          : '1px solid #e5e7eb',
                      textAlign: 'center'
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        mb: 1
                      }}
                    >
                      Your Rating
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: 1,
                        flexWrap: 'wrap'
                      }}
                    >
                      <Rating
                        value={selectedOrder.rating}
                        readOnly
                        size={isMobile ? 'medium' : 'large'}
                      />
                      <Typography
                        variant="h6"
                        sx={{ color: '#ff9900', fontWeight: 'bold' }}
                      >
                        {selectedOrder.rating}/5
                      </Typography>
                    </Box>
                    {selectedOrder.ratingComment && (
                      <Typography
                        variant="body2"
                        color={theme === 'dark' ? '#a8b2d1' : '#666666'}
                        sx={{ mt: 1, wordBreak: 'break-word' }}
                      >
                        "{selectedOrder.ratingComment}"
                      </Typography>
                    )}
                  </Box>
                )}

                {/* Order Items */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'bold',
                      mb: { xs: 1.5, sm: 2 },
                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                      fontSize: {
                        xs: '0.95rem',
                        sm: '1.05rem',
                        md: '1.1rem'
                      }
                    }}
                  >
                    Order Items
                  </Typography>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5
                    }}
                  >
                    {selectedOrder.items.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          justifyContent: 'space-between',
                          py: { xs: 1, sm: 1.5 },
                          px: { xs: 1, sm: 0 },
                          borderBottom:
                            index < selectedOrder.items.length - 1
                              ? theme === 'dark'
                                ? '1px solid #334155'
                                : '1px solid #e5e7eb'
                              : 'none',
                          gap: { xs: 0.5, sm: 0 }
                        }}
                      >
                        <Box>
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 'medium',
                              fontSize: { xs: '0.85rem', sm: '0.875rem' }
                            }}
                          >
                            {item.name} x {item.quantity}
                          </Typography>
                          <Typography
                            variant="caption"
                            color={theme === 'dark' ? '#a8b2d1' : '#666666'}
                          >
                            {formatPrice(item.price)} each
                          </Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 'bold',
                            fontSize: { xs: '0.85rem', sm: '0.875rem' }
                          }}
                        >
                          {formatPrice(item.total)}
                        </Typography>
                      </Box>
                    ))}

                    <Divider sx={{ my: { xs: 1, sm: 1.5 } }} />

                    <Box
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        pt: { xs: 1, sm: 1.5 },
                        px: { xs: 1, sm: 0 }
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 'bold',
                          fontSize: { xs: '0.95rem', sm: '1.05rem' }
                        }}
                      >
                        Total
                      </Typography>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 'bold',
                          color: theme === 'dark' ? '#00ffff' : '#007bff',
                          fontSize: {
                            xs: '1rem',
                            sm: '1.15rem',
                            md: '1.25rem'
                          }
                        }}
                      >
                        {formatPrice(selectedOrder.totalAmount)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Customer Info */}
                <Box>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 'bold',
                      mb: { xs: 1.5, sm: 2 },
                      color: theme === 'dark' ? '#00ffff' : '#007bff',
                      fontSize: {
                        xs: '0.95rem',
                        sm: '1.05rem',
                        md: '1.1rem'
                      }
                    }}
                  >
                    Delivery Details
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                      gap: { xs: 1, sm: 1.5 }
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }}
                    >
                      <Person
                        fontSize="small"
                        sx={{
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {selectedOrder.customer.name}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5
                      }}
                    >
                      <Phone
                        fontSize="small"
                        sx={{
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' }
                        }}
                      >
                        {selectedOrder.customer.phone}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        gridColumn: { xs: '1', sm: '1/3' }
                      }}
                    >
                      <Email
                        fontSize="small"
                        sx={{
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          fontSize: { xs: '1rem', sm: '1.1rem' }
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {selectedOrder.customer.email}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                        gridColumn: { xs: '1', sm: '1/3' }
                      }}
                    >
                      <LocationOn
                        fontSize="small"
                        sx={{
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          fontSize: { xs: '1rem', sm: '1.1rem' },
                          mt: 0.3
                        }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          fontSize: { xs: '0.8rem', sm: '0.875rem' },
                          wordBreak: 'break-word'
                        }}
                      >
                        {selectedOrder.customer.deliveryAddress}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* Special Instructions */}
                {selectedOrder.specialInstructions && (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        fontSize: {
                          xs: '0.95rem',
                          sm: '1.05rem',
                          md: '1.1rem'
                        }
                      }}
                    >
                      Special Instructions
                    </Typography>
                    <Typography
                      variant="body2"
                      color={theme === 'dark' ? '#a8b2d1' : '#666666'}
                      sx={{
                        fontSize: { xs: '0.85rem', sm: '0.875rem' },
                        wordBreak: 'break-word'
                      }}
                    >
                      {selectedOrder.specialInstructions}
                    </Typography>
                  </Box>
                )}

                {/* Staff Info */}
                {(selectedOrder.assignedChef || selectedOrder.assignedWaiter) && (
                  <Box>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 'bold',
                        mb: 1,
                        color: theme === 'dark' ? '#00ffff' : '#007bff',
                        fontSize: {
                          xs: '0.95rem',
                          sm: '1.05rem',
                          md: '1.1rem'
                        }
                      }}
                    >
                      Staff Assignment
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', sm: 'row' },
                        flexWrap: 'wrap',
                        gap: { xs: 1, sm: 2 }
                      }}
                    >
                      {selectedOrder.assignedChef && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            backgroundColor:
                              theme === 'dark' ? '#1e293b' : '#f8fafc',
                            padding: { xs: '8px 12px', sm: '6px 12px' },
                            borderRadius: 1,
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          <Restaurant
                            fontSize="small"
                            sx={{
                              color: theme === 'dark' ? '#00ffff' : '#007bff',
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              fontWeight: 'medium'
                            }}
                          >
                            Chef: {selectedOrder.assignedChef.name}
                          </Typography>
                        </Box>
                      )}
                      {selectedOrder.assignedWaiter && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            backgroundColor:
                              theme === 'dark' ? '#1e293b' : '#f8fafc',
                            padding: { xs: '8px 12px', sm: '6px 12px' },
                            borderRadius: 1,
                            width: { xs: '100%', sm: 'auto' }
                          }}
                        >
                          <LocalShipping
                            fontSize="small"
                            sx={{
                              color: theme === 'dark' ? '#00ffff' : '#007bff',
                              fontSize: { xs: '1rem', sm: '1.1rem' }
                            }}
                          />
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: '0.8rem', sm: '0.875rem' },
                              fontWeight: 'medium'
                            }}
                          >
                            Waiter: {selectedOrder.assignedWaiter.name}
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </Box>
                )}
              </Stack>
            </DialogContent>

            <DialogActions
              sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                borderTop:
                  theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
                justifyContent: 'space-between',
                flexDirection: { xs: 'column-reverse', sm: 'row' },
                gap: { xs: 1, sm: 0 }
              }}
            >
              <Button
                onClick={() => setOpenViewDialog(false)}
                fullWidth={isMobile}
                sx={{
                  color: theme === 'dark' ? '#00ffff' : '#007bff',
                  width: { xs: '100%', sm: 'auto' },
                  '&:hover': {
                    backgroundColor:
                      theme === 'dark' ? '#00ffff20' : '#007bff10'
                  }
                }}
              >
                Close
              </Button>

              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 2 },
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                {selectedOrder.status === 'PENDING' && (
                  <Button
                    variant="contained"
                    color="error"
                    startIcon={<Cancel />}
                    fullWidth={isMobile}
                    onClick={() => {
                      setOpenViewDialog(false);
                      setOpenCancelDialog(true);
                    }}
                    sx={{ width: { xs: '100%', sm: 'auto' } }}
                  >
                    Cancel Order
                  </Button>
                )}

                {selectedOrder.status === 'DELIVERED' && (
                  <Button
                    variant="contained"
                    startIcon={<Star />}
                    fullWidth={isMobile}
                    onClick={() => {
                      setOpenViewDialog(false);
                      setOpenRateDialog(true);
                    }}
                    sx={{
                      background:
                        theme === 'dark'
                          ? 'linear-gradient(135deg, #ff9900, #e68a00)'
                          : 'linear-gradient(135deg, #ff9900, #e68a00)',
                      '&:hover': {
                        background:
                          theme === 'dark'
                            ? 'linear-gradient(135deg, #e68a00, #cc7a00)'
                            : 'linear-gradient(135deg, #e68a00, #cc7a00)'
                      },
                      width: { xs: '100%', sm: 'auto' }
                    }}
                  >
                    Rate Order
                  </Button>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Cancel Order Dialog */}
      <Dialog
        open={openCancelDialog}
        onClose={() => {
          setOpenCancelDialog(false);
          setCancelReason('');
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
            width: '100%',
            maxWidth: { xs: '100%', sm: '450px' },
            margin: { xs: 0, sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              color: theme === 'dark' ? '#ccd6f6' : '#333333',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Cancel Order
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 1 } }}>
          <Typography
            variant="body2"
            color={theme === 'dark' ? '#a8b2d1' : '#666666'}
            sx={{ mb: 2 }}
          >
            Are you sure you want to cancel this order?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            label="Reason (optional)"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Tell us why you're cancelling..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                '& fieldset': {
                  borderColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                },
                '&:hover fieldset': {
                  borderColor: theme === 'dark' ? '#00ffff' : '#007bff'
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme === 'dark' ? '#00ffff' : '#007bff'
                }
              },
              '& .MuiInputLabel-root': {
                color: theme === 'dark' ? '#a8b2d1' : '#666666'
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme === 'dark' ? '#00ffff' : '#007bff'
              }
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            pt: { xs: 1, sm: 1 },
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}
        >
          <Button
            onClick={() => {
              setOpenCancelDialog(false);
              setCancelReason('');
            }}
            fullWidth={isMobile}
            sx={{
              color: theme === 'dark' ? '#00ffff' : '#007bff',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Keep Order
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleCancelOrder}
            fullWidth={isMobile}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Yes, Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Rate Order Dialog */}
      <Dialog
        open={openRateDialog}
        onClose={() => {
          setOpenRateDialog(false);
          setRatingValue(null);
          setRatingComment('');
        }}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 2 },
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white',
            width: '100%',
            maxWidth: { xs: '100%', sm: '450px' },
            margin: { xs: 0, sm: 'auto' }
          }
        }}
      >
        <DialogTitle sx={{ p: { xs: 2, sm: 3 } }}>
          <Typography
            variant="h6"
            sx={{
              color: theme === 'dark' ? '#ccd6f6' : '#333333',
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            Rate Your Order
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, sm: 3 }, pt: { xs: 1, sm: 1 } }}>
          <Typography
            variant="body2"
            color={theme === 'dark' ? '#a8b2d1' : '#666666'}
            sx={{ mb: 3 }}
          >
            How was your experience with this order?
          </Typography>

          {/* Star Rating */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              gap: 0.5,
              mb: 2
            }}
          >
            {[1, 2, 3, 4, 5].map((star) => {
              const isActive = ratingValue !== null && ratingValue >= star;
              const isHovered = hoverRating !== null && hoverRating >= star;
              const isFilled = isActive || isHovered;

              return (
                <IconButton
                  key={star}
                  onClick={() => setRatingValue(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(null)}
                  sx={{
                    fontSize: { xs: 40, sm: 48 },
                    color: isFilled ? '#ff9900' : (theme === 'dark' ? '#334155' : '#e5e7eb'),
                    transition: 'color 0.15s ease, transform 0.15s ease',
                    '&:hover': {
                      transform: 'scale(1.15)',
                      color: '#ff9900'
                    },
                    '&:active': {
                      transform: 'scale(0.95)'
                    }
                  }}
                >
                  {isFilled ? (
                    <Star fontSize="inherit" />
                  ) : (
                    <StarBorder fontSize="inherit" />
                  )}
                </IconButton>
              );
            })}
          </Box>

          {ratingValue !== null && (
            <Typography
              variant="body2"
              sx={{
                textAlign: 'center',
                mb: 2,
                color: '#ff9900',
                fontWeight: 'bold',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              {ratingValue === 1 && '😞 Poor - Needs improvement'}
              {ratingValue === 2 && '😕 Fair - Could be better'}
              {ratingValue === 3 && '😐 Good - Satisfactory'}
              {ratingValue === 4 && '😊 Very Good - Impressed'}
              {ratingValue === 5 && '🌟 Excellent - Outstanding!'}
            </Typography>
          )}

          <TextField
            fullWidth
            multiline
            rows={2}
            label="Comment (Optional)"
            value={ratingComment}
            onChange={(e) => setRatingComment(e.target.value)}
            placeholder="Share your experience with this order..."
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                '& fieldset': {
                  borderColor: theme === 'dark' ? '#334155' : '#e5e7eb'
                },
                '&:hover fieldset': {
                  borderColor: theme === 'dark' ? '#00ffff' : '#007bff'
                },
                '&.Mui-focused fieldset': {
                  borderColor: theme === 'dark' ? '#00ffff' : '#007bff'
                }
              },
              '& .MuiInputLabel-root': {
                color: theme === 'dark' ? '#a8b2d1' : '#666666'
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: theme === 'dark' ? '#00ffff' : '#007bff'
              }
            }}
          />
        </DialogContent>
        <DialogActions
          sx={{
            p: { xs: 2, sm: 3 },
            pt: { xs: 1, sm: 1 },
            flexDirection: { xs: 'column-reverse', sm: 'row' },
            gap: { xs: 1, sm: 0 }
          }}
        >
          <Button
            onClick={() => {
              setOpenRateDialog(false);
              setRatingValue(null);
              setRatingComment('');
            }}
            fullWidth={isMobile}
            sx={{
              color: theme === 'dark' ? '#00ffff' : '#007bff',
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            Skip
          </Button>
          <Button
            variant="contained"
            onClick={handleRateOrder}
            disabled={ratingLoading || !ratingValue}
            fullWidth={isMobile}
            startIcon={
              ratingLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <Star />
              )
            }
            sx={{
              background:
                theme === 'dark'
                  ? 'linear-gradient(135deg, #ff9900, #e68a00)'
                  : 'linear-gradient(135deg, #ff9900, #e68a00)',
              '&:hover': {
                background:
                  theme === 'dark'
                    ? 'linear-gradient(135deg, #e68a00, #cc7a00)'
                    : 'linear-gradient(135deg, #e68a00, #cc7a00)'
              },
              '&.Mui-disabled': {
                background: theme === 'dark' ? '#334155' : '#e5e7eb',
                color: theme === 'dark' ? '#94a3b8' : '#94a3b8'
              },
              width: { xs: '100%', sm: 'auto' }
            }}
          >
            {ratingLoading ? 'Submitting...' : 'Submit Rating'}
          </Button>
        </DialogActions>
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

export default MyOrdersPage;