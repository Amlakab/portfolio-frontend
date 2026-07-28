'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Alert, Snackbar, CircularProgress, 
  Pagination, TextField, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, useMediaQuery,
  Card, CardContent, Avatar, Divider
} from '@mui/material';
import { 
  Add, Edit, Delete, ExpandMore, ExpandLess, 
  Search, Refresh, FilterList, Work, 
  CalendarToday, Description, Business, AccessTime,
  LocationOn, Visibility
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import portfolioApi from '@/lib/api/portfolio';

interface Experience {
  _id: string;
  role: string;
  company: string;
  period: string;
  description: string;
  location?: string;
  order: number;
  created_at: string;
}

export default function ExperiencesTab() {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDark = theme === 'dark';

  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  // View Dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Experience | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    company: '',
    page: 1,
    limit: 10
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    role: '', company: '', period: '', description: '', location: '', order: 0,
  });

  // Theme styles
  const themeStyles = {
    background: isDark 
      ? 'linear-gradient(135deg, #0a192f, #112240)' 
      : 'linear-gradient(135deg, #f0f0f0, #ffffff)',
    textColor: isDark ? '#ccd6f6' : '#333333',
    primaryColor: isDark ? '#00ffff' : '#007bff',
    borderColor: isDark ? '#00ffff' : '#007bff',
    cardBg: isDark ? '#0f172a80' : '#ffffff',
    cardBorder: isDark ? '#334155' : '#e5e7eb',
    headerBg: isDark 
      ? 'linear-gradient(135deg, #00ffff, #00b3b3)' 
      : 'linear-gradient(135deg, #007bff, #0056b3)',
    hoverBg: isDark ? '#1e293b' : '#f8fafc',
  };

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

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.company) params.append('company', filters.company);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      
      const res = await portfolioApi.getExperiencesAdmin({ 
        page: filters.page, 
        limit: filters.limit,
        search: filters.search,
        company: filters.company
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

  const resetForm = () => setFormData({ role: '', company: '', period: '', description: '', location: '', order: 0 });

  const openCreate = () => { resetForm(); setDialogMode('create'); setSelected(null); setOpenDialog(true); };
  
  const openEdit = (item: Experience) => {
    setSelected(item);
    setFormData({
      role: item.role,
      company: item.company,
      period: item.period,
      description: item.description,
      location: item.location || '',
      order: item.order || 0,
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const openView = (item: Experience) => {
    setViewItem(item);
    setOpenViewDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await portfolioApi.createExperience(formData);
      } else if (selected?._id) {
        await portfolioApi.updateExperience(selected._id, formData);
      }
      setSuccess(`Experience ${dialogMode === 'create' ? 'created' : 'updated'}`);
      setOpenDialog(false);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (item: Experience) => {
    if (!confirm(`Delete "${item.role}" at ${item.company}?`)) return;
    try {
      await portfolioApi.deleteExperience(item._id);
      setSuccess('Experience deleted');
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
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
      company: '',
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
              <Work /> Experience ({pagination.totalItems})
            </Typography>
            <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
              Manage your professional work experience
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
            New Experience
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
          mb: 3, 
          p: 3,
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
              md: 'repeat(3, 1fr)'
            },
            gap: 2
          }}>
            <TextField
              fullWidth
              size="small"
              label="Search"
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              placeholder="Search by role or company..."
              InputProps={{
                startAdornment: <Search sx={{ color: isDark ? '#a8b2d1' : '#666666', mr: 1 }} />,
              }}
              sx={textFieldStyle}
            />
            
            <TextField
              fullWidth
              size="small"
              label="Company"
              value={filters.company}
              onChange={(e) => handleFilterChange('company', e.target.value)}
              placeholder="Filter by company"
              sx={textFieldStyle}
            />
            
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
                        <Box>
                          <Typography variant="subtitle1" sx={{ 
                            fontWeight: 'bold',
                            color: isDark ? '#ccd6f6' : '#333333',
                            mb: 0.5
                          }}>
                            {item.role}
                          </Typography>
                          <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
                            {item.company}
                          </Typography>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleExpandItem(item._id)}
                          sx={{ color: isDark ? '#a8b2d1' : '#666666' }}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1.5, 
                        mb: 1.5,
                        flexWrap: 'wrap'
                      }}>
                        <CalendarToday fontSize="small" sx={{ color: isDark ? '#a8b2d1' : '#666666' }} />
                        <Chip label={item.period} size="small" />
                        {item.location && (
                          <>
                            <LocationOn fontSize="small" sx={{ color: isDark ? '#a8b2d1' : '#666666' }} />
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              {item.location}
                            </Typography>
                          </>
                        )}
                      </Box>

                      {isExpanded && (
                        <Box sx={{ 
                          pt: 2,
                          borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
                          mt: 2
                        }}>
                          <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                            <strong>Description:</strong> {item.description}
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
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Role / Company</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Period</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Location</TableCell>
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
                        <Typography variant="body2" sx={{ 
                          fontWeight: 500, 
                          color: isDark ? '#ccd6f6' : '#333333' 
                        }}>
                          {item.role}
                        </Typography>
                        <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                          {item.company}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Chip label={item.period} size="small" />
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
                          {item.location || '—'}
                        </Typography>
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
              <Work sx={{ 
                fontSize: 64, 
                color: isDark ? '#334155' : '#cbd5e1',
                mb: 2
              }} />
              <Typography variant="h6" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                No experience records found
              </Typography>
              <Typography variant="body2" color={isDark ? '#94a3b8' : '#999999'}>
                Try adjusting your filters or add a new experience entry
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
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} entries
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
            {dialogMode === 'create' ? 'Add Experience' : 'Edit Experience'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Experience Information */}
            {renderFormSection(
              "Experience Information",
              <Work />,
              <>
                <TextField
                  fullWidth
                  label="Role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  required
                  size="small"
                  sx={textFieldStyle}
                  placeholder="e.g. Senior Software Developer"
                />
                <TextField
                  fullWidth
                  label="Company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  required
                  size="small"
                  sx={textFieldStyle}
                  placeholder="e.g. Google"
                />
                <TextField
                  fullWidth
                  label="Period"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  required
                  size="small"
                  sx={textFieldStyle}
                  placeholder="e.g. 2025 - Present"
                />
                <TextField
                  fullWidth
                  label="Location (optional)"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  size="small"
                  sx={textFieldStyle}
                  placeholder="e.g. Addis Ababa, Ethiopia"
                />
              </>
            )}

            {/* Description */}
            {renderFormSection(
              "Description",
              <Description />,
              <TextField
                fullWidth
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={4}
                required
                size="small"
                sx={textFieldStyle}
                placeholder="Describe your responsibilities and achievements..."
              />
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
            disabled={!formData.role || !formData.company || !formData.period || !formData.description}
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
                  sx={{ 
                    width: 50, 
                    height: 50,
                    bgcolor: 'rgba(255,255,255,0.2)',
                    fontSize: '1.2rem',
                    fontWeight: 'bold'
                  }}
                >
                  {viewItem.role.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {viewItem.role}
                  </Typography>
                  <Typography variant="body2" sx={{ opacity: 0.9 }}>
                    {viewItem.company}
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
                  {/* Experience Details */}
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
                        <Work /> Experience Details
                      </Typography>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 3
                      }}>
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
                            Company
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            {viewItem.company}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Period
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            <Chip label={viewItem.period} size="small" />
                          </Typography>
                        </Box>
                        {viewItem.location && (
                          <Box>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              Location
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                              <LocationOn sx={{ fontSize: 14, mr: 0.5 }} /> {viewItem.location}
                            </Typography>
                          </Box>
                        )}
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

                  {/* Description */}
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
                        <Description /> Description
                      </Typography>
                      <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ lineHeight: 1.8 }}>
                        {viewItem.description}
                      </Typography>
                    </CardContent>
                  </Card>

                  {/* System Information */}
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
                        <AccessTime /> System Information
                      </Typography>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 3
                      }}>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Created Date
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            {formatDate(viewItem.created_at)}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            ID
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333', fontSize: '0.75rem' }}>
                            {viewItem._id}
                          </Typography>
                        </Box>
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
                Edit Experience
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