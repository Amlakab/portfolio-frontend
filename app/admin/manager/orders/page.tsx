'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Card, CardContent,
  Tabs, Tab, CircularProgress,
  Chip, IconButton, Button,
  Dialog, DialogTitle, DialogContent,
  DialogActions, TextField,
  useMediaQuery, Snackbar, Alert,
  Divider, Stack, TableContainer,
  Table, TableHead, TableRow, TableCell,
  TableBody, Paper, MenuItem,
  Select, FormControl, InputLabel,
  Avatar, Tooltip, Badge
} from '@mui/material';
import { useTheme } from '@/lib/theme-context';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import { OrderProgress } from '@/components/OrderProgress';
import {
  Restaurant, Visibility, CheckCircle,
  Pending, LocalShipping, Inventory,
  Receipt, AttachMoney, Person,
  Phone, Email, LocationOn,
  Close, Refresh, FilterList,
  AssignmentInd, AssignmentReturn,
  DoneAll, Cancel, Search,
  Print, Download
} from '@mui/icons-material';
import api from '@/app/utils/api';
import { orderApi } from '@/app/utils/order';
import { Order, OrderStatus } from '@/types/order';
import { useAuth } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const AdminOrdersPage = () => {
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
  const [openAssignChefDialog, setOpenAssignChefDialog] = useState(false);
  const [openAssignWaiterDialog, setOpenAssignWaiterDialog] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedChef, setSelectedChef] = useState('');
  const [selectedWaiter, setSelectedWaiter] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalOrders: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    if (!user || (user?.role !== 'admin' && user?.role !== 'manager')) {
      router.push('/auth/login?redirect=/admin/orders');
    }
  }, [user, router]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params: any = { page: 1, limit: 20 };
      if (tabValue > 0) {
        const statusMap = ['ALL', 'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED'];
        params.status = statusMap[tabValue];
      }
      if (searchTerm) {
        params.search = searchTerm;
      }
      const response = await orderApi.getAllOrders(params);
      setOrders(response.data.data.orders || []);
      setPagination(response.data.data.pagination);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [tabValue, searchTerm]);

  const handleViewOrder = async (order: Order) => {
    try {
      const response = await orderApi.getOrderById(order._id);
      setSelectedOrder(response.data.data);
      setOpenViewDialog(true);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to fetch order details');
    }
  };

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await orderApi.confirmOrder(orderId);
      setSuccess('Order confirmed successfully');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to confirm order');
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await orderApi.rejectOrder(orderId, 'Rejected by manager');
      setSuccess('Order rejected successfully');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to reject order');
    }
  };

  const handleAssignChef = async () => {
    if (!selectedOrder || !selectedChef) return;
    try {
      await orderApi.assignChef(selectedOrder._id, selectedChef);
      setSuccess('Chef assigned successfully');
      setOpenAssignChefDialog(false);
      setSelectedChef('');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign chef');
    }
  };

  const handleAssignWaiter = async () => {
    if (!selectedOrder || !selectedWaiter) return;
    try {
      await orderApi.assignWaiter(selectedOrder._id, selectedWaiter);
      setSuccess('Waiter assigned successfully');
      setOpenAssignWaiterDialog(false);
      setSelectedWaiter('');
      fetchOrders();
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to assign waiter');
    }
  };

  const getStatusChip = (status: OrderStatus) => {
    const configs = {
      PENDING: { color: 'warning', label: 'Pending', icon: <Pending fontSize="small" /> },
      CONFIRMED: { color: 'info', label: 'Confirmed', icon: <CheckCircle fontSize="small" /> },
      PREPARING: { color: 'primary', label: 'Preparing', icon: <Restaurant fontSize="small" /> },
      READY: { color: 'success', label: 'Ready', icon: <LocalShipping fontSize="small" /> },
      DELIVERING: { color: 'success', label: 'Delivering', icon: <LocalShipping fontSize="small" /> },
      RATED: { color: 'success', label: 'Rated', icon: <DoneAll fontSize="small" /> },
      DELIVERED: { color: 'success', label: 'Delivered', icon: <CheckCircle fontSize="small" /> },
      COMPLETED: { color: 'success', label: 'Completed', icon: <DoneAll fontSize="small" /> },
      CANCELLED: { color: 'error', label: 'Cancelled', icon: <Cancel fontSize="small" /> },
    };
    const config = configs[status] || configs.PENDING;
    return (
      <Chip
        label={config.label}
        color={config.color as any}
        size="small"
        icon={config.icon}
        sx={{ height: 28 }}
      />
    );
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

  const tabs = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Confirmed', value: 'CONFIRMED' },
    { label: 'Preparing', value: 'PREPARING' },
    { label: 'Ready', value: 'READY' },
    { label: 'Delivered', value: 'DELIVERED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  const getChefs = () => users.filter(u => u.role === 'chef' || u.role === 'admin');
  const getWaiters = () => users.filter(u => u.role === 'waiter' || u.role === 'admin');

  if (!user || (user?.role !== 'admin' && user?.role !== 'manager')) {
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
            <Typography variant={isMobile ? "h5" : "h4"} sx={{ 
              fontWeight: 'bold',
              color: theme === 'dark' ? '#00ffff' : '#007bff'
            }}>
              Order Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
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
          </Box>
        </motion.div>

        {/* Search and Filters */}
        <Card sx={{ 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
          border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
          backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none'
        }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                size="small"
                placeholder="Search orders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />,
                }}
                sx={{
                  flex: 1,
                  minWidth: 200,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                    '& fieldset': {
                      borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                    }
                  }
                }}
              />
            </Box>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={(e, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                color: theme === 'dark' ? '#a8b2d1' : '#666666',
                '&.Mui-selected': {
                  color: theme === 'dark' ? '#00ffff' : '#007bff',
                },
              },
              '& .MuiTabs-indicator': {
                backgroundColor: theme === 'dark' ? '#00ffff' : '#007bff',
              },
            }}
          >
            {tabs.map((tab, index) => (
              <Tab 
                key={index} 
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {tab.label}
                    {tab.value !== 'ALL' && (
                      <Badge 
                        badgeContent={orders.filter(o => o.status === tab.value).length}
                        color="primary"
                        sx={{
                          '& .MuiBadge-badge': {
                            backgroundColor: theme === 'dark' ? '#00ffff' : '#007bff',
                            color: theme === 'dark' ? '#0a192f' : 'white',
                          }
                        }}
                      />
                    )}
                  </Box>
                } 
                value={index} 
              />
            ))}
          </Tabs>
        </Box>

        {/* Orders Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <CircularProgress sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }} />
          </Box>
        ) : orders.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Receipt sx={{ fontSize: 64, color: theme === 'dark' ? '#334155' : '#cbd5e1' }} />
            <Typography variant="h6" sx={{ mt: 2, color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>
              No orders found
            </Typography>
            <Typography variant="body2" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
              {tabValue === 0 ? 'No orders placed yet' : `No ${tabs[tabValue].label.toLowerCase()} orders`}
            </Typography>
          </Box>
        ) : (
          <Paper sx={{ 
            borderRadius: 2,
            overflow: 'hidden',
            backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
            border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
            backdropFilter: theme === 'dark' ? 'blur(10px)' : 'none'
          }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: theme === 'dark'
                      ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                      : 'linear-gradient(135deg, #007bff, #0056b3)'
                  }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Order #</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Customer</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Items</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Total</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Assigned To</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow 
                      key={order._id}
                      hover
                      sx={{ 
                        '&:hover': {
                          backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc'
                        }
                      }}
                    >
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {order.orderNumber}
                        </Typography>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          {formatDate(order.created_at)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{order.customer.name}</Typography>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          {order.customer.phone}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {order.items.map(item => item.name).join(', ')}
                        </Typography>
                        <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                          {order.items.length} items
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold', color: theme === 'dark' ? '#00ffff' : '#007bff' }}>
                          {formatPrice(order.totalAmount)}
                        </Typography>
                      </TableCell>
                      <TableCell>{getStatusChip(order.status)}</TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {order.assignedChef && (
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Chef: {order.assignedChef.name}
                            </Typography>
                          )}
                          {order.assignedWaiter && (
                            <Typography variant="caption" color={theme === 'dark' ? '#a8b2d1' : '#666666'}>
                              Waiter: {order.assignedWaiter.name}
                            </Typography>
                          )}
                          {!order.assignedChef && !order.assignedWaiter && (
                            <Typography variant="caption" color={theme === 'dark' ? '#94a3b8' : '#999999'}>
                              Unassigned
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewOrder(order)}
                              sx={{ 
                                color: theme === 'dark' ? '#00ffff' : '#007bff',
                                '&:hover': {
                                  backgroundColor: theme === 'dark' ? '#00ffff20' : '#007bff10'
                                }
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {order.status === 'PENDING' && (
                            <>
                              <Tooltip title="Confirm Order">
                                <IconButton
                                  size="small"
                                  onClick={() => handleConfirmOrder(order._id)}
                                  sx={{ 
                                    color: '#28a745',
                                    '&:hover': {
                                      backgroundColor: '#28a74520'
                                    }
                                  }}
                                >
                                  <CheckCircle fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Reject Order">
                                <IconButton
                                  size="small"
                                  onClick={() => handleRejectOrder(order._id)}
                                  sx={{ 
                                    color: '#dc3545',
                                    '&:hover': {
                                      backgroundColor: '#dc354520'
                                    }
                                  }}
                                >
                                  <Close fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                          
                          {order.status === 'CONFIRMED' && !order.assignedChef && (
                            <Tooltip title="Assign Chef">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setOpenAssignChefDialog(true);
                                }}
                                sx={{ 
                                  color: '#ff9900',
                                  '&:hover': {
                                    backgroundColor: '#ff990020'
                                  }
                                }}
                              >
                                <AssignmentInd fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {order.status === 'READY' && !order.assignedWaiter && (
                            <Tooltip title="Assign Waiter">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setOpenAssignWaiterDialog(true);
                                }}
                                sx={{ 
                                  color: '#007bff',
                                  '&:hover': {
                                    backgroundColor: '#007bff20'
                                  }
                                }}
                              >
                                <AssignmentReturn fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
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
                {/* Progress */}
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  backgroundColor: theme === 'dark' ? '#1e293b' : '#f8fafc',
                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb'
                }}>
                  <OrderProgress 
                    status={selectedOrder.status}
                    completedAt={selectedOrder.deliveredAt || selectedOrder.completedAt}
                    theme={theme}
                  />
                </Box>

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

                {/* Staff Assignment */}
                <Box>
                  <Typography variant="subtitle1" sx={{ 
                    fontWeight: 'bold', 
                    mb: 2,
                    color: theme === 'dark' ? '#00ffff' : '#007bff'
                  }}>
                    Staff Assignment
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Restaurant fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                      <Typography variant="body2">
                        Chef: {selectedOrder.assignedChef?.name || 'Not assigned yet'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <LocalShipping fontSize="small" sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }} />
                      <Typography variant="body2">
                        Waiter: {selectedOrder.assignedWaiter?.name || 'Not assigned yet'}
                      </Typography>
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
                {selectedOrder.status === 'PENDING' && (
                  <>
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<Close />}
                      onClick={() => {
                        handleRejectOrder(selectedOrder._id);
                        setOpenViewDialog(false);
                      }}
                    >
                      Reject
                    </Button>
                    <Button
                      variant="contained"
                      startIcon={<CheckCircle />}
                      onClick={() => {
                        handleConfirmOrder(selectedOrder._id);
                        setOpenViewDialog(false);
                      }}
                      sx={{
                        background: 'linear-gradient(135deg, #28a745, #1e7e34)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #1e7e34, #155724)'
                        }
                      }}
                    >
                      Confirm
                    </Button>
                  </>
                )}
              </Box>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Assign Chef Dialog */}
      <Dialog
        open={openAssignChefDialog}
        onClose={() => {
          setOpenAssignChefDialog(false);
          setSelectedChef('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
            Assign Chef
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 3 }}>
            Select a chef to assign to this order.
          </Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Select Chef</InputLabel>
            <Select
              value={selectedChef}
              onChange={(e) => setSelectedChef(e.target.value)}
              sx={{
                backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                }
              }}
            >
              {getChefs().map((chef) => (
                <MenuItem key={chef._id} value={chef._id}>
                  {chef.name} ({chef.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpenAssignChefDialog(false);
              setSelectedChef('');
            }}
            sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignChef}
            disabled={!selectedChef}
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
            Assign Chef
          </Button>
        </DialogActions>
      </Dialog>

      {/* Assign Waiter Dialog */}
      <Dialog
        open={openAssignWaiterDialog}
        onClose={() => {
          setOpenAssignWaiterDialog(false);
          setSelectedWaiter('');
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            backgroundColor: theme === 'dark' ? '#0f172a' : 'white'
          }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ color: theme === 'dark' ? '#ccd6f6' : '#333333' }}>
            Assign Waiter
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color={theme === 'dark' ? '#a8b2d1' : '#666666'} sx={{ mb: 3 }}>
            Select a waiter to deliver this order.
          </Typography>
          <FormControl fullWidth>
            <InputLabel sx={{ color: theme === 'dark' ? '#a8b2d1' : '#666666' }}>Select Waiter</InputLabel>
            <Select
              value={selectedWaiter}
              onChange={(e) => setSelectedWaiter(e.target.value)}
              sx={{
                backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
                color: theme === 'dark' ? '#ccd6f6' : '#333333',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
                }
              }}
            >
              {getWaiters().map((waiter) => (
                <MenuItem key={waiter._id} value={waiter._id}>
                  {waiter.name} ({waiter.email})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setOpenAssignWaiterDialog(false);
              setSelectedWaiter('');
            }}
            sx={{ color: theme === 'dark' ? '#00ffff' : '#007bff' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleAssignWaiter}
            disabled={!selectedWaiter}
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
            Assign Waiter
          </Button>
        </DialogActions>
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

export default AdminOrdersPage;