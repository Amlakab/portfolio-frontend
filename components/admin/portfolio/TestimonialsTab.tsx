'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Alert, Snackbar, CircularProgress, 
  Pagination, TextField, IconButton, Rating, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, useMediaQuery, Card, CardContent, 
  Avatar, Divider, Chip
} from '@mui/material';
import { 
  Add, Edit, Delete, Star, StarBorder, CloudUpload, 
  Visibility, ExpandMore, ExpandLess, Search, Refresh, 
  FilterList, Person, Comment, AccessTime, FormatQuote
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import portfolioApi from '@/lib/api/portfolio';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  avatarData?: any;
  rating: number;
  featured: boolean;
  order: number;
  created_at: string;
}

const getImageUrl = (item: Testimonial): string | null => {
  if (item.avatarData?.data) {
    let base64 = '';
    if (typeof item.avatarData.data === 'string') base64 = item.avatarData.data;
    else if (item.avatarData.data?.$binary?.base64) base64 = item.avatarData.data.$binary.base64;
    else if (item.avatarData.data?.data) base64 = Buffer.from(item.avatarData.data.data).toString('base64');
    if (base64) return `data:${item.avatarData.contentType || 'image/jpeg'};base64,${base64}`;
  }
  if (item.avatar?.startsWith('data:image')) return item.avatar;
  return item.avatar || null;
};

export default function TestimonialsTab() {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDark = theme === 'dark';

  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  // View Dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Testimonial | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    rating: '',
    featured: '',
    page: 1,
    limit: 10
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '', role: '', content: '', rating: 5, featured: false, order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Theme styles
  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: isDark ? '#1e293b' : 'white',
      color: isDark ? '#ccd6f6' : '#333',
      '& fieldset': { borderColor: isDark ? '#334155' : '#e5e7eb' },
      '&:hover fieldset': { borderColor: isDark ? '#00ffff' : '#007bff' },
      '&.Mui-focused fieldset': { borderColor: isDark ? '#00ffff' : '#007bff' },
    },
    '& .MuiInputLabel-root': { color: isDark ? '#a8b2d1' : '#666' },
    '& .MuiInputLabel-root.Mui-focused': { color: isDark ? '#00ffff' : '#007bff' },
  };

  const selectStyle = {
    borderRadius: 1,
    backgroundColor: isDark ? '#1e293b' : 'white',
    color: isDark ? '#ccd6f6' : '#333',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#334155' : '#e5e7eb' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#00ffff' : '#007bff' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#00ffff' : '#007bff' },
  };

  const labelStyle = { 
    color: isDark ? '#a8b2d1' : '#666', 
    '&.Mui-focused': { color: isDark ? '#00ffff' : '#007bff' } 
  };

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.rating) params.append('rating', filters.rating);
      if (filters.featured) params.append('featured', filters.featured);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      
      const res = await portfolioApi.getTestimonialsAdmin({ 
        page: filters.page, 
        limit: filters.limit,
        search: filters.search,
        rating: filters.rating,
        featured: filters.featured
      });
      setItems(res.data.data.data || []);
      setPagination(res.data.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const resetForm = () => setFormData({ name: '', role: '', content: '', rating: 5, featured: false, order: 0 });

  const openCreate = () => { 
    resetForm(); 
    setImageFile(null); 
    setImagePreview(null); 
    setDialogMode('create'); 
    setSelected(null); 
    setOpenDialog(true); 
  };
  
  const openEdit = (item: Testimonial) => {
    setSelected(item);
    setFormData({
      name: item.name,
      role: item.role,
      content: item.content,
      rating: item.rating || 5,
      featured: item.featured || false,
      order: item.order || 0,
    });
    setImagePreview(getImageUrl(item));
    setImageFile(null);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const openView = (item: Testimonial) => {
    setViewItem(item);
    setOpenViewDialog(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append('avatar', imageFile);

      if (dialogMode === 'create') {
        await portfolioApi.createTestimonial(fd);
      } else if (selected?._id) {
        await portfolioApi.updateTestimonial(selected._id, fd);
      }

      setSuccess(`Testimonial ${dialogMode === 'create' ? 'created' : 'updated'}`);
      setOpenDialog(false);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (item: Testimonial) => {
    if (!confirm(`Delete testimonial from "${item.name}"?`)) return;
    try {
      await portfolioApi.deleteTestimonial(item._id);
      setSuccess('Testimonial deleted');
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleFeatured = async (item: Testimonial) => {
    try {
      await portfolioApi.toggleTestimonialFeatured(item._id);
      setSuccess(`Featured ${item.featured ? 'disabled' : 'enabled'}`);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle');
    }
  };

  const toggleExpandItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({
      ...prev,
      [field]: value,
      ...(field !== 'page' && { page: 1 })
    }));
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      rating: '',
      featured: '',
      page: 1,
      limit: 10
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Render form section
  const renderFormSection = (title: string, icon: React.ReactNode, content: React.ReactNode) => (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h6" sx={{ 
        color: isDark ? '#00ffff' : '#007bff', 
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1
      }}>
        {icon} {title}
      </Typography>
      {content}
      <Divider sx={{ mt: 2 }} />
    </Box>
  );

  return (
    <Box>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' },
          justifyContent: 'space-between', 
          alignItems: { xs: 'stretch', sm: 'center' },
          mb: 3, 
          gap: 2 
        }}>
          <Box>
            <Typography variant={isMobile ? "h6" : "h5"} sx={{ 
              fontWeight: 'bold', 
              color: isDark ? '#ccd6f6' : '#333333',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <FormatQuote /> Testimonials ({pagination.totalItems})
            </Typography>
            <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
              Manage client testimonials and feedback
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={openCreate}
            sx={{ 
              background: isDark 
                ? 'linear-gradient(135deg, #00ffff, #00b3b3)' 
                : 'linear-gradient(135deg, #007bff, #0056b3)',
              borderRadius: 1,
              boxShadow: isDark 
                ? '0 2px 4px rgba(0, 255, 255, 0.2)'
                : '0 2px 4px rgba(37, 99, 235, 0.2)',
              '&:hover': {
                background: isDark 
                  ? 'linear-gradient(135deg, #00b3b3, #008080)'
                  : 'linear-gradient(135deg, #0056b3, #004080)',
                boxShadow: isDark 
                  ? '0 4px 8px rgba(0, 255, 255, 0.3)'
                  : '0 4px 8px rgba(37, 99, 235, 0.3)'
              }
            }}
          >
            New Testimonial
          </Button>
        </Box>
      </motion.div>

      {/* Filter Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Paper sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: 2,
          backgroundColor: isDark ? '#0f172a80' : 'white',
          border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
          boxShadow: isDark 
            ? '0 2px 8px rgba(0,0,0,0.3)' 
            : '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'stretch', md: 'center' },
            gap: 2,
            mb: 2
          }}>
            <Typography variant="subtitle1" sx={{ 
              fontWeight: 'bold',
              color: isDark ? '#ccd6f6' : '#333333',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}>
              <FilterList /> Filters
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={resetFilters}
              size="small"
              sx={{ 
                borderRadius: 1,
                borderColor: isDark ? '#00ffff' : '#007bff',
                color: isDark ? '#00ffff' : '#007bff',
                '&:hover': {
                  borderColor: isDark ? '#00b3b3' : '#0056b3',
                  backgroundColor: isDark ? '#00ffff20' : '#007bff10'
                }
              }}
            >
              Reset
            </Button>
          </Box>
          
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)'
            },
            gap: 2
          }}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by name..."
              InputProps={{
                startAdornment: <Search sx={{ color: isDark ? '#a8b2d1' : '#666666', mr: 1 }} />,
              }}
              sx={textFieldStyle}
            />
            
            <TextField
              fullWidth
              size="small"
              select
              label="Rating"
              value={filters.rating}
              onChange={(e) => handleFilterChange('rating', e.target.value)}
              sx={textFieldStyle}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">All Ratings</option>
              <option value="5">5 Stars</option>
              <option value="4">4 Stars</option>
              <option value="3">3 Stars</option>
              <option value="2">2 Stars</option>
              <option value="1">1 Star</option>
            </TextField>
            
            <TextField
              fullWidth
              size="small"
              select
              label="Featured"
              value={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.value)}
              sx={textFieldStyle}
              SelectProps={{
                native: true,
              }}
            >
              <option value="">All</option>
              <option value="true">Featured</option>
              <option value="false">Not Featured</option>
            </TextField>
            
            <TextField
              fullWidth
              size="small"
              select
              label="Per Page"
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
              sx={textFieldStyle}
              SelectProps={{
                native: true,
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
            </TextField>
          </Box>
        </Paper>
      </motion.div>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress sx={{ color: isDark ? '#00ffff' : '#007bff' }} />
        </Box>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Mobile View - Cards */}
          {isMobile ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {items.map((item) => {
                const isExpanded = expandedItem === item._id;
                
                return (
                  <Card 
                    key={item._id} 
                    sx={{ 
                      borderRadius: 2,
                      boxShadow: isDark 
                        ? '0 2px 8px rgba(0,0,0,0.3)' 
                        : '0 2px 8px rgba(0,0,0,0.1)',
                      border: isDark 
                        ? '1px solid #334155' 
                        : '1px solid #e5e7eb',
                      backgroundColor: isDark ? '#0f172a80' : 'white',
                      backdropFilter: isDark ? 'blur(10px)' : 'none'
                    }}
                  >
                    <CardContent sx={{ p: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'flex-start',
                        mb: 2
                      }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={getImageUrl(item) || '/api/placeholder/40/40'}
                            alt={item.name}
                            sx={{ width: 50, height: 50 }}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 'bold',
                              color: isDark ? '#ccd6f6' : '#333333',
                              mb: 0.5
                            }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              {item.role}
                            </Typography>
                          </Box>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleExpandItem(item._id)}
                          sx={{ color: isDark ? '#a8b2d1' : '#666666' }}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Rating value={item.rating} readOnly size="small" />
                        {item.featured && (
                          <Chip 
                            label="Featured" 
                            size="small" 
                            sx={{ 
                              height: 20, 
                              fontSize: '0.6rem',
                              backgroundColor: '#f59e0b',
                              color: 'white'
                            }} 
                          />
                        )}
                      </Box>

                      <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ 
                        fontStyle: 'italic',
                        mb: 1
                      }}>
                        "{item.content.substring(0, 80)}..."
                      </Typography>

                      {isExpanded && (
                        <Box sx={{ 
                          pt: 2,
                          borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
                          mt: 2
                        }}>
                          <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 2, fontStyle: 'italic' }}>
                            "{item.content}"
                          </Typography>
                          
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1,
                            mt: 2
                          }}>
                            <Button
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => openView(item)}
                              size="small"
                              sx={{
                                borderRadius: 1,
                                borderColor: isDark ? '#00ffff' : '#007bff',
                                color: isDark ? '#00ffff' : '#007bff',
                                '&:hover': {
                                  backgroundColor: isDark ? '#00ffff20' : '#007bff10'
                                }
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={item.featured ? <StarBorder /> : <Star />}
                              onClick={() => toggleFeatured(item)}
                              size="small"
                              sx={{
                                borderRadius: 1,
                                borderColor: item.featured ? '#f59e0b' : (isDark ? '#00ffff' : '#007bff'),
                                color: item.featured ? '#f59e0b' : (isDark ? '#00ffff' : '#007bff'),
                                '&:hover': {
                                  backgroundColor: item.featured ? '#f59e0b20' : (isDark ? '#00ffff20' : '#007bff10')
                                }
                              }}
                            >
                              {item.featured ? 'Unfeature' : 'Feature'}
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Edit />}
                              onClick={() => openEdit(item)}
                              size="small"
                              sx={{
                                borderRadius: 1,
                                borderColor: isDark ? '#00ffff' : '#007bff',
                                color: isDark ? '#00ffff' : '#007bff',
                                '&:hover': {
                                  backgroundColor: isDark ? '#00ffff20' : '#007bff10'
                                }
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Delete />}
                              onClick={() => handleDelete(item)}
                              size="small"
                              color="error"
                              sx={{ 
                                borderRadius: 1,
                                borderColor: isDark ? '#ff0000' : '#dc3545',
                                color: isDark ? '#ff0000' : '#dc3545',
                                '&:hover': {
                                  backgroundColor: isDark ? '#ff000020' : '#dc354510'
                                }
                              }}
                            >
                              Delete
                            </Button>
                          </Box>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          ) : (
            /* Desktop/Tablet View - Table */
            <TableContainer component={Paper} sx={{ 
              borderRadius: 2,
              backgroundColor: isDark ? '#0f172a80' : 'white',
              border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
              boxShadow: isDark 
                ? '0 4px 12px rgba(0,0,0,0.3)' 
                : '0 4px 12px rgba(0,0,0,0.08)'
            }}>
              <Table>
                <TableHead>
                  <TableRow sx={{ 
                    background: isDark 
                      ? 'linear-gradient(135deg, #00ffff, #00b3b3)' 
                      : 'linear-gradient(135deg, #007bff, #0056b3)'
                  }}>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Name / Role</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Rating</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Featured</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow 
                      key={item._id} 
                      hover 
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc' 
                        } 
                      }}
                    >
                      <TableCell sx={{ py: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            src={getImageUrl(item) || '/api/placeholder/40/40'}
                            alt={item.name}
                            sx={{ width: 40, height: 40 }}
                          >
                            {item.name.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500, 
                              color: isDark ? '#ccd6f6' : '#333333' 
                            }}>
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              {item.role}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Rating value={item.rating} readOnly size="small" />
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleFeatured(item)} 
                          sx={{ 
                            color: item.featured ? '#f59e0b' : (isDark ? '#a8b2d1' : '#666'),
                            '&:hover': {
                              backgroundColor: item.featured ? '#f59e0b20' : (isDark ? '#00ffff20' : '#007bff10')
                            }
                          }}
                        >
                          {item.featured ? <Star /> : <StarBorder />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => openView(item)}
                            sx={{ 
                              color: isDark ? '#00ffff' : '#007bff',
                              '&:hover': {
                                backgroundColor: isDark ? '#00ffff20' : '#007bff10'
                              }
                            }}
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openEdit(item)}
                            sx={{ 
                              color: isDark ? '#00ffff' : '#007bff',
                              '&:hover': {
                                backgroundColor: isDark ? '#00ffff20' : '#007bff10'
                              }
                            }}
                          >
                            <Edit fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDelete(item)}
                            sx={{ 
                              color: isDark ? '#ff0000' : '#dc3545',
                              '&:hover': {
                                backgroundColor: isDark ? '#ff000020' : '#dc354510'
                              }
                            }}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {items.length === 0 && !loading && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 2
            }}>
              <FormatQuote sx={{ 
                fontSize: 64, 
                color: isDark ? '#334155' : '#cbd5e1',
                mb: 2
              }} />
              <Typography variant="h6" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                No testimonials found
              </Typography>
              <Typography variant="body2" color={isDark ? '#94a3b8' : '#999999'}>
                Try adjusting your filters or add a new testimonial
              </Typography>
            </Box>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              mt: 4,
              flexDirection: { xs: 'column', sm: 'row' },
              gap: 2
            }}>
              <Pagination 
                count={pagination.totalPages} 
                page={filters.page} 
                onChange={(_, v) => handleFilterChange('page', v)} 
                color="primary" 
                size={isMobile ? "small" : "medium"}
                showFirstButton
                showLastButton
                sx={{
                  '& .MuiPaginationItem-root': {
                    borderRadius: 1,
                    color: isDark ? '#ccd6f6' : '#333333',
                    '&.Mui-selected': {
                      backgroundColor: isDark ? '#00ffff' : '#007bff',
                      color: isDark ? '#0a192f' : 'white',
                    },
                    '&:hover': {
                      backgroundColor: isDark ? '#00ffff20' : '#007bff10'
                    }
                  }
                }}
              />
              <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} testimonials
              </Typography>
            </Box>
          )}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="md" 
        fullWidth 
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            borderRadius: 2,
            backgroundColor: isDark ? '#0f172a' : 'white',
            color: isDark ? '#ccd6f6' : '#333333'
          }
        }}
      >
        <DialogTitle sx={{ 
          backgroundColor: isDark ? '#0f172a' : 'white',
          borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
          py: 3
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: isDark ? '#ccd6f6' : '#333333' }}>
            {dialogMode === 'create' ? 'Add Testimonial' : 'Edit Testimonial'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Avatar Upload */}
            {renderFormSection(
              "Avatar",
              <Person />,
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box 
                  sx={{ 
                    position: 'relative', 
                    width: 120, 
                    height: 120, 
                    borderRadius: '50%', 
                    overflow: 'hidden', 
                    border: `2px dashed ${isDark ? '#334155' : '#e5e7eb'}`,
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': { 
                      borderColor: isDark ? '#00ffff' : '#007bff',
                      backgroundColor: isDark ? '#00ffff20' : '#007bff10',
                    },
                  }} 
                  onClick={() => document.getElementById('testimonial-avatar')?.click()}
                >
                  {imagePreview ? (
                    <img src={imagePreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <CloudUpload sx={{ fontSize: 40, color: isDark ? '#a8b2d1' : '#666' }} />
                  )}
                </Box>
                <input id="testimonial-avatar" type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Box>
            )}

            {/* Personal Information */}
            {renderFormSection(
              "Personal Information",
              <Person />,
              <>
                <TextField
                  fullWidth
                  label="Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  size="small"
                  sx={textFieldStyle}
                  placeholder="Client's full name"
                />
                <TextField
                  fullWidth
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  size="small"
                  sx={textFieldStyle}
                  placeholder="e.g. CEO, Company Name"
                />
              </>
            )}

            {/* Testimonial Content */}
            {renderFormSection(
              "Testimonial",
              <FormatQuote />,
              <TextField
                fullWidth
                label="Content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                multiline
                rows={4}
                required
                size="small"
                sx={textFieldStyle}
                placeholder="What did the client say?"
              />
            )}

            {/* Rating & Featured */}
            {renderFormSection(
              "Rating & Featured",
              <Star />,
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: isDark ? '#a8b2d1' : '#666' }}>
                    Rating
                  </Typography>
                  <Rating 
                    value={formData.rating} 
                    onChange={(_, v) => setFormData({ ...formData, rating: v || 5 })} 
                    size="large"
                  />
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
                    Featured:
                  </Typography>
                  <Button 
                    variant={formData.featured ? 'contained' : 'outlined'} 
                    size="medium" 
                    onClick={() => setFormData({ ...formData, featured: !formData.featured })}
                    sx={{ 
                      backgroundColor: formData.featured ? '#f59e0b' : 'transparent',
                      color: formData.featured ? 'white' : (isDark ? '#a8b2d1' : '#666'),
                      borderColor: '#f59e0b',
                      borderRadius: 1,
                      '&:hover': { 
                        backgroundColor: formData.featured ? '#d97706' : '#f59e0b20' 
                      }
                    }}
                  >
                    {formData.featured ? '⭐ Featured' : '☆ Not Featured'}
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ 
          p: 3,
          borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
          backgroundColor: isDark ? '#0f172a' : 'white'
        }}>
          <Button 
            onClick={() => setOpenDialog(false)}
            sx={{
              color: isDark ? '#00ffff' : '#007bff',
              '&:hover': {
                backgroundColor: isDark ? '#00ffff20' : '#007bff10'
              }
            }}
          >
            Cancel
          </Button>
          <Button 
            variant="contained" 
            onClick={handleSubmit} 
            disabled={!formData.name || !formData.role || !formData.content}
            sx={{
              background: isDark 
                ? 'linear-gradient(135deg, #00ffff, #00b3b3)' 
                : 'linear-gradient(135deg, #007bff, #0056b3)',
              borderRadius: 1,
              '&:hover': {
                background: isDark 
                  ? 'linear-gradient(135deg, #00b3b3, #008080)'
                  : 'linear-gradient(135deg, #0056b3, #004080)'
              },
              '&.Mui-disabled': {
                background: isDark ? '#334155' : '#e5e7eb',
                color: isDark ? '#94a3b8' : '#94a3b8'
              }
            }}
          >
            {dialogMode === 'create' ? 'Create' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog 
        open={openViewDialog} 
        onClose={() => setOpenViewDialog(false)} 
        maxWidth="md" 
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: { 
            borderRadius: 2,
            backgroundColor: isDark ? '#0f172a' : 'white',
            color: isDark ? '#ccd6f6' : '#333333',
            maxHeight: '90vh',
            overflow: 'hidden'
          }
        }}
      >
        {viewItem && (
          <>
            <DialogTitle sx={{ 
              background: isDark
                ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                : 'linear-gradient(135deg, #007bff, #0056b3)',
              color: 'white',
              py: 3
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  src={getImageUrl(viewItem) || '/api/placeholder/50/50'}
                  alt={viewItem.name}
                  sx={{ width: 50, height: 50 }}
                >
                  {viewItem.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {viewItem.name}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {viewItem.role}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent sx={{ p: 3, overflowY: 'auto' }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <Box sx={{ pt: 2, pb: 2 }}>
                  {/* Testimonial Content */}
                  <Card sx={{ 
                    mb: 3, 
                    borderRadius: 2,
                    boxShadow: isDark 
                      ? '0 2px 8px rgba(0,0,0,0.3)' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    backgroundColor: isDark ? '#0f172a80' : 'white'
                  }}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold',
                        color: isDark ? '#ccd6f6' : '#333333',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <FormatQuote /> Testimonial
                      </Typography>
                      <Typography variant="body1" color={isDark ? '#a8b2d1' : '#666666'} sx={{ 
                        fontStyle: 'italic', 
                        lineHeight: 1.8,
                        fontSize: '1.1rem'
                      }}>
                        "{viewItem.content}"
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* Details */}
                  <Card sx={{ 
                    borderRadius: 2,
                    boxShadow: isDark 
                      ? '0 2px 8px rgba(0,0,0,0.3)' 
                      : '0 2px 8px rgba(0,0,0,0.1)',
                    backgroundColor: isDark ? '#0f172a80' : 'white'
                  }}>
                    <CardContent>
                      <Typography variant="h6" sx={{ 
                        mb: 2, 
                        fontWeight: 'bold',
                        color: isDark ? '#ccd6f6' : '#333333',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Person /> Details
                      </Typography>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 3
                      }}>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Name
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            {viewItem.name}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Role
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            {viewItem.role}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Rating
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Rating value={viewItem.rating} readOnly size="medium" />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Status
                          </Typography>
                          <Box sx={{ mt: 0.5 }}>
                            <Chip 
                              label={viewItem.featured ? '⭐ Featured' : 'Not Featured'} 
                              color={viewItem.featured ? 'warning' : 'default'} 
                              size="small" 
                            />
                          </Box>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Created Date
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            {formatDate(viewItem.created_at)}
                          </Typography>
                        </Box>
                        {viewItem.order !== undefined && (
                          <Box>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              Order
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                              {viewItem.order}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Box>
              </motion.div>
            </DialogContent>
            <DialogActions sx={{ 
              p: 3,
              borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
              backgroundColor: isDark ? '#0f172a' : 'white'
            }}>
              <Button 
                onClick={() => setOpenViewDialog(false)}
                sx={{
                  color: isDark ? '#00ffff' : '#007bff',
                  '&:hover': {
                    backgroundColor: isDark ? '#00ffff20' : '#007bff10'
                  }
                }}
              >
                Close
              </Button>
              <Button 
                onClick={() => {
                  setOpenViewDialog(false);
                  openEdit(viewItem);
                }}
                variant="contained"
                sx={{
                  background: isDark
                    ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                    : 'linear-gradient(135deg, #007bff, #0056b3)',
                  borderRadius: 1,
                  '&:hover': {
                    background: isDark
                      ? 'linear-gradient(135deg, #00b3b3, #008080)'
                      : 'linear-gradient(135deg, #0056b3, #004080)'
                  }
                }}
              >
                Edit Testimonial
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Notifications */}
      <Snackbar 
        open={!!error} 
        autoHideDuration={6000} 
        onClose={() => setError('')} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ 
            borderRadius: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: isDark ? '#0f172a' : 'white',
            color: isDark ? '#ff0000' : '#dc3545'
          }}
        >
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={!!success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess('')} 
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity="success" 
          onClose={() => setSuccess('')}
          sx={{ 
            borderRadius: 1,
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            backgroundColor: isDark ? '#0f172a' : 'white',
            color: isDark ? '#00ff00' : '#28a745'
          }}
        >
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}