'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Alert, Snackbar, CircularProgress, 
  Pagination, TextField, IconButton, Dialog, DialogTitle, 
  DialogContent, DialogActions, Button, FormControl, InputLabel, 
  Select, MenuItem, useMediaQuery, Card, CardContent, Avatar, Divider,
  Slider
} from '@mui/material';
import { 
  Add, Edit, Delete, ExpandMore, ExpandLess, 
  Search, Refresh, FilterList, Code, 
  Category, Percent, Visibility, AccessTime
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import portfolioApi from '@/lib/api/portfolio';

interface Skill {
  _id: string;
  name: string;
  value: number;
  icon: string;
  category: string;
  order: number;
  created_at: string;
}

const categories = ['frontend', 'backend', 'design', 'tools'];
const iconOptions = [
  'FaHtml5', 'FaCss3Alt', 'FaJs', 'FaReact', 'SiNextdotjs', 
  'SiTailwindcss', 'SiBootstrap', 'SiTypescript', 'SiPhp', 
  'SiMysql', 'SiSpringboot', 'FaJava', 'FaNodeJs', 'SiMongodb', 
  'SiPostgresql', 'FaPython'
];

export default function SkillsTab() {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDark = theme === 'dark';

  const [items, setItems] = useState<Skill[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  // View Dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Skill | null>(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    page: 1,
    limit: 10
  });
  
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Skill | null>(null);
  const [formData, setFormData] = useState({
    name: '', value: 50, icon: '', category: '', order: 0,
  });

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
      if (filters.category) params.append('category', filters.category);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      
      const res = await portfolioApi.getSkillsAdmin({ 
        page: filters.page, 
        limit: filters.limit,
        search: filters.search,
        category: filters.category
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

  const resetForm = () => setFormData({ name: '', value: 50, icon: '', category: '', order: 0 });

  const openCreate = () => { resetForm(); setDialogMode('create'); setSelected(null); setOpenDialog(true); };
  
  const openEdit = (item: Skill) => {
    setSelected(item);
    setFormData({
      name: item.name,
      value: item.value,
      icon: item.icon,
      category: item.category,
      order: item.order || 0,
    });
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const openView = (item: Skill) => {
    setViewItem(item);
    setOpenViewDialog(true);
  };

  const handleSubmit = async () => {
    try {
      if (dialogMode === 'create') {
        await portfolioApi.createSkill(formData);
      } else if (selected?._id) {
        await portfolioApi.updateSkill(selected._id, formData);
      }

      setSuccess(`Skill ${dialogMode === 'create' ? 'created' : 'updated'}`);
      setOpenDialog(false);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (item: Skill) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await portfolioApi.deleteSkill(item._id);
      setSuccess('Skill deleted');
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
      category: '',
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

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'info' | 'error' | 'default' } = {
      'frontend': 'primary',
      'backend': 'secondary',
      'design': 'success',
      'tools': 'warning',
    };
    return colors[category] || 'default';
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
              <Code /> Skills ({pagination.totalItems})
            </Typography>
            <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
              Manage your technical skills and expertise
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
            New Skill
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
              placeholder="Search by skill name..."
              InputProps={{
                startAdornment: <Search sx={{ color: isDark ? '#a8b2d1' : '#666666', mr: 1 }} />,
              }}
              sx={textFieldStyle}
            />
            
            <FormControl fullWidth size="small">
              <InputLabel sx={labelStyle}>Category</InputLabel>
              <Select 
                value={filters.category} 
                label="Category" 
                onChange={(e) => handleFilterChange('category', e.target.value)} 
                sx={selectStyle}
              >
                <MenuItem value="">All</MenuItem>
                {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel sx={labelStyle}>Per Page</InputLabel>
              <Select 
                value={filters.limit} 
                label="Per Page" 
                onChange={(e) => handleFilterChange('limit', Number(e.target.value))} 
                sx={selectStyle}
              >
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={25}>25</MenuItem>
                <MenuItem value={50}>50</MenuItem>
              </Select>
            </FormControl>
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
                            {item.name}
                          </Typography>
                          <Chip 
                            label={item.category} 
                            color={getCategoryColor(item.category)} 
                            size="small" 
                            sx={{ height: 24 }}
                          />
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleExpandItem(item._id)}
                          sx={{ color: isDark ? '#a8b2d1' : '#666666' }}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      
                      <Box sx={{ mb: 1 }}>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mb: 0.5
                        }}>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Proficiency
                          </Typography>
                          <Typography variant="caption" sx={{ fontWeight: 'bold', color: isDark ? '#00ffff' : '#007bff' }}>
                            {item.value}%
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          width: '100%', 
                          height: 8, 
                          borderRadius: 4, 
                          backgroundColor: isDark ? '#1e293b' : '#e5e7eb',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            width: `${item.value}%`, 
                            height: '100%', 
                            borderRadius: 4,
                            background: isDark 
                              ? 'linear-gradient(90deg, #00ffff, #00b3b3)'
                              : 'linear-gradient(90deg, #007bff, #0056b3)',
                            transition: 'width 0.3s ease'
                          }} />
                        </Box>
                      </Box>

                      {isExpanded && (
                        <Box sx={{ 
                          pt: 2,
                          borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
                          mt: 2
                        }}>
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              Icon
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                              {item.icon}
                            </Typography>
                          </Box>
                          
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
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Name</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Category</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Value</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Icon</TableCell>
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
                          {item.name}
                        </Typography>
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Chip 
                          label={item.category} 
                          color={getCategoryColor(item.category)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Box sx={{ minWidth: 80 }}>
                          <Box sx={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            mb: 0.5
                          }}>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              {item.value}%
                            </Typography>
                          </Box>
                          <Box sx={{ 
                            width: '100%', 
                            height: 6, 
                            borderRadius: 3, 
                            backgroundColor: isDark ? '#1e293b' : '#e5e7eb',
                            overflow: 'hidden'
                          }}>
                            <Box sx={{ 
                              width: `${item.value}%`, 
                              height: '100%', 
                              borderRadius: 3,
                              background: isDark 
                                ? 'linear-gradient(90deg, #00ffff, #00b3b3)'
                                : 'linear-gradient(90deg, #007bff, #0056b3)',
                              transition: 'width 0.3s ease'
                            }} />
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Chip label={item.icon} size="small" variant="outlined" />
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
              <Code sx={{ 
                fontSize: 64, 
                color: isDark ? '#334155' : '#cbd5e1',
                mb: 2
              }} />
              <Typography variant="h6" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                No skills found
              </Typography>
              <Typography variant="body2" color={isDark ? '#94a3b8' : '#999999'}>
                Try adjusting your filters or add a new skill
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
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} skills
              </Typography>
            </Box>
          )}
        </motion.div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)} 
        maxWidth="sm" 
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
            {dialogMode === 'create' ? 'Add New Skill' : 'Edit Skill'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Skill Information */}
            {renderFormSection(
              "Skill Information",
              <Code />,
              <>
                <TextField
                  fullWidth
                  label="Skill Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  size="small"
                  sx={textFieldStyle}
                  placeholder="e.g. React, TypeScript, Node.js"
                />
                <FormControl fullWidth size="small">
                  <InputLabel sx={labelStyle}>Category</InputLabel>
                  <Select 
                    value={formData.category} 
                    label="Category" 
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    sx={selectStyle}
                  >
                    {categories.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
                <FormControl fullWidth size="small">
                  <InputLabel sx={labelStyle}>Icon</InputLabel>
                  <Select 
                    value={formData.icon} 
                    label="Icon" 
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    required
                    sx={selectStyle}
                  >
                    {iconOptions.map(i => <MenuItem key={i} value={i}>{i}</MenuItem>)}
                  </Select>
                </FormControl>
              </>
            )}

            {/* Proficiency Level */}
            {renderFormSection(
              "Proficiency Level",
              <Percent />,
              <>
                <Box sx={{ px: 1 }}>
                  <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                    Value: {formData.value}%
                  </Typography>
                  <Slider
                    value={formData.value}
                    onChange={(_, value) => setFormData({ ...formData, value: value as number })}
                    min={0}
                    max={100}
                    step={5}
                    sx={{
                      color: isDark ? '#00ffff' : '#007bff',
                      '& .MuiSlider-thumb': {
                        '&:hover': {
                          boxShadow: isDark 
                            ? '0 0 0 8px rgba(0, 255, 255, 0.16)'
                            : '0 0 0 8px rgba(0, 123, 255, 0.16)',
                        },
                      },
                    }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>Beginner</Typography>
                    <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>Expert</Typography>
                  </Box>
                </Box>
              </>
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
            disabled={!formData.name || !formData.category || !formData.icon || formData.value < 0 || formData.value > 100}
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
        maxWidth="sm" 
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
                  {viewItem.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {viewItem.name}
                  </Typography>
                  <Chip 
                    label={viewItem.category} 
                    color={getCategoryColor(viewItem.category)} 
                    size="small" 
                    sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }}
                  />
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
                  {/* Proficiency Level */}
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
                        <Percent /> Proficiency Level
                      </Typography>
                      <Box>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          mb: 1
                        }}>
                          <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
                            {viewItem.value}% - {viewItem.value >= 80 ? 'Expert' : viewItem.value >= 60 ? 'Advanced' : viewItem.value >= 40 ? 'Intermediate' : 'Beginner'}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'bold', color: isDark ? '#00ffff' : '#007bff' }}>
                            {viewItem.value}%
                          </Typography>
                        </Box>
                        <Box sx={{ 
                          width: '100%', 
                          height: 12, 
                          borderRadius: 6, 
                          backgroundColor: isDark ? '#1e293b' : '#e5e7eb',
                          overflow: 'hidden'
                        }}>
                          <Box sx={{ 
                            width: `${viewItem.value}%`, 
                            height: '100%', 
                            borderRadius: 6,
                            background: isDark 
                              ? 'linear-gradient(90deg, #00ffff, #00b3b3)'
                              : 'linear-gradient(90deg, #007bff, #0056b3)',
                            transition: 'width 0.3s ease'
                          }} />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>

                  {/* Skill Details */}
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
                        <Code /> Skill Details
                      </Typography>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Skill Name
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            {viewItem.name}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Category
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            <Chip 
                              label={viewItem.category} 
                              color={getCategoryColor(viewItem.category)} 
                              size="small" 
                            />
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Icon
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            <Chip label={viewItem.icon} size="small" variant="outlined" />
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
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
                Edit Skill
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