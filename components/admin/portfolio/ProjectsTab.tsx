'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Chip, Alert, Snackbar, CircularProgress, 
  Pagination, TextField, FormControl, InputLabel, Select, MenuItem,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, 
  Button, Stack, useMediaQuery, Card, CardContent, Avatar, Divider
} from '@mui/material';
import { 
  Add, Edit, Delete, Search, Refresh, Star, StarBorder, 
  CloudUpload, Link, Visibility, ExpandMore, ExpandLess,
  Category, Description, Work, AccessTime, Language,
  GitHub, Web, Folder
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import portfolioApi from '@/lib/api/portfolio';

interface Project {
  _id: string;
  title: string;
  description: string;
  image?: string;
  imageData?: any;
  tags: string[];
  github?: string;
  liveUrl?: string;
  category: string;
  featured: boolean;
  order: number;
  created_at: string;
}

const categories = [
  { value: 'web', label: 'Web' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'design', label: 'Design' },
  { value: 'fullstack', label: 'Full Stack' },
];

const getImageUrl = (project: Project): string | null => {
  if (project.imageData?.data) {
    let base64 = '';
    if (typeof project.imageData.data === 'string') base64 = project.imageData.data;
    else if (project.imageData.data?.$binary?.base64) base64 = project.imageData.data.$binary.base64;
    else if (project.imageData.data?.data) base64 = Buffer.from(project.imageData.data.data).toString('base64');
    if (base64) return `data:${project.imageData.contentType || 'image/jpeg'};base64,${base64}`;
  }
  if (project.image?.startsWith('data:image')) return project.image;
  return project.image || null;
};

export default function ProjectsTab() {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');
  const isDark = theme === 'dark';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
  // View Dialog
  const [openViewDialog, setOpenViewDialog] = useState(false);
  const [viewItem, setViewItem] = useState<Project | null>(null);
  
  const [filters, setFilters] = useState({ search: '', category: '', featured: '', page: 1, limit: 10 });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', tags: [] as string[], 
    github: '', liveUrl: '', featured: false, order: 0,
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

  const fetchProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.search) params.append('search', filters.search);
      if (filters.category) params.append('category', filters.category);
      if (filters.featured) params.append('featured', filters.featured);
      params.append('page', filters.page.toString());
      params.append('limit', filters.limit.toString());
      
      const res = await portfolioApi.getProjectsAdmin(filters);
      const responseData = res.data?.data || {};
      const projectArray = Array.isArray(responseData.data) ? responseData.data : [];
      setProjects(projectArray);
      setPagination(responseData.pagination || { 
        currentPage: 1, 
        totalPages: 1, 
        totalItems: projectArray.length 
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch projects');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleFilterChange = (field: string, value: string | number) => {
    setFilters(prev => ({ ...prev, [field]: value, ...(field !== 'page' && { page: 1 }) }));
  };

  const resetForm = () => {
    setFormData({ 
      title: '', description: '', category: '', tags: [], 
      github: '', liveUrl: '', featured: false, order: 0 
    });
    setImageFile(null);
    setImagePreview(null);
  };

  const openCreateDialog = () => { 
    resetForm(); 
    setDialogMode('create'); 
    setSelectedProject(null); 
    setOpenDialog(true); 
  };
  
  const openEditDialog = (project: Project) => {
    setSelectedProject(project);
    setFormData({
      title: project.title,
      description: project.description,
      category: project.category,
      tags: project.tags || [],
      github: project.github || '',
      liveUrl: project.liveUrl || '',
      featured: project.featured || false,
      order: project.order || 0,
    });
    setImagePreview(getImageUrl(project));
    setImageFile(null);
    setDialogMode('edit');
    setOpenDialog(true);
  };

  const openViewDialogHandler = (project: Project) => {
    setViewItem(project);
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
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'tags') fd.append(k, JSON.stringify(v));
        else fd.append(k, String(v));
      });
      if (imageFile) fd.append('image', imageFile);

      if (dialogMode === 'create') {
        await portfolioApi.createProject(fd);
      } else if (selectedProject?._id) {
        await portfolioApi.updateProject(selectedProject._id, fd);
      }

      setSuccess(`Project ${dialogMode === 'create' ? 'created' : 'updated'} successfully`);
      setOpenDialog(false);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save project');
    }
  };

  const handleDelete = async (project: Project) => {
    if (!confirm(`Delete "${project.title}"?`)) return;
    try {
      await portfolioApi.deleteProject(project._id);
      setSuccess('Project deleted');
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const toggleFeatured = async (project: Project) => {
    try {
      await portfolioApi.toggleFeatured(project._id);
      setSuccess(`Featured ${project.featured ? 'disabled' : 'enabled'}`);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle');
    }
  };

  const toggleExpandItem = (itemId: string) => {
    setExpandedItem(expandedItem === itemId ? null : itemId);
  };

  const resetFilters = () => {
    setFilters({ search: '', category: '', featured: '', page: 1, limit: 10 });
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
      'web': 'primary',
      'mobile': 'secondary',
      'design': 'success',
      'fullstack': 'warning',
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
              <Folder /> Projects ({pagination.totalItems})
            </Typography>
            <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'}>
              Manage your portfolio projects and showcase your work
            </Typography>
          </Box>
          <Button 
            variant="contained" 
            startIcon={<Add />} 
            onClick={openCreateDialog}
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
            New Project
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
              <Search /> Filters
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
              placeholder="Title or description..."
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
                {categories.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
              </Select>
            </FormControl>
            
            <FormControl fullWidth size="small">
              <InputLabel sx={labelStyle}>Featured</InputLabel>
              <Select 
                value={filters.featured} 
                label="Featured" 
                onChange={(e) => handleFilterChange('featured', e.target.value)} 
                sx={selectStyle}
              >
                <MenuItem value="">All</MenuItem>
                <MenuItem value="true">Featured</MenuItem>
                <MenuItem value="false">Not Featured</MenuItem>
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
              {Array.isArray(projects) && projects.map((p) => {
                const isExpanded = expandedItem === p._id;
                
                return (
                  <Card 
                    key={p._id} 
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
                          <Box sx={{ 
                            width: 50, 
                            height: 50, 
                            borderRadius: 1, 
                            overflow: 'hidden',
                            flexShrink: 0,
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc'
                          }}>
                            <img 
                              src={getImageUrl(p) || '/api/placeholder/50/50'} 
                              alt={p.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/50/50'; }} 
                            />
                          </Box>
                          <Box>
                            <Typography variant="subtitle1" sx={{ 
                              fontWeight: 'bold',
                              color: isDark ? '#ccd6f6' : '#333333',
                              mb: 0.5
                            }}>
                              {p.title}
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                              <Chip 
                                label={categories.find(c => c.value === p.category)?.label || p.category} 
                                color={getCategoryColor(p.category)} 
                                size="small" 
                                sx={{ height: 20, fontSize: '0.65rem' }}
                              />
                              {p.featured && (
                                <Chip 
                                  label="⭐ Featured" 
                                  color="warning" 
                                  size="small" 
                                  sx={{ height: 20, fontSize: '0.65rem' }}
                                />
                              )}
                            </Box>
                          </Box>
                        </Box>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleExpandItem(p._id)}
                          sx={{ color: isDark ? '#a8b2d1' : '#666666' }}
                        >
                          {isExpanded ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </Box>
                      
                      <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                        {p.description?.substring(0, 80)}...
                      </Typography>

                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
                        {p.tags?.slice(0, 3).map((t, i) => (
                          <Chip key={i} label={t} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
                        ))}
                        {p.tags && p.tags.length > 3 && (
                          <Chip label={`+${p.tags.length - 3}`} size="small" sx={{ height: 20, fontSize: '0.6rem' }} />
                        )}
                      </Box>

                      {isExpanded && (
                        <Box sx={{ 
                          pt: 2,
                          borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
                          mt: 2
                        }}>
                          <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                            <strong>Description:</strong> {p.description}
                          </Typography>
                          
                          {p.github && (
                            <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                              <strong>GitHub:</strong> {p.github}
                            </Typography>
                          )}
                          
                          {p.liveUrl && (
                            <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 2 }}>
                              <strong>Live URL:</strong> {p.liveUrl}
                            </Typography>
                          )}
                          
                          <Box sx={{ 
                            display: 'grid',
                            gridTemplateColumns: 'repeat(2, 1fr)',
                            gap: 1,
                            mt: 2
                          }}>
                            <Button
                              variant="outlined"
                              startIcon={<Visibility />}
                              onClick={() => openViewDialogHandler(p)}
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
                              startIcon={p.featured ? <StarBorder /> : <Star />}
                              onClick={() => toggleFeatured(p)}
                              size="small"
                              sx={{
                                borderRadius: 1,
                                borderColor: p.featured ? '#f59e0b' : (isDark ? '#00ffff' : '#007bff'),
                                color: p.featured ? '#f59e0b' : (isDark ? '#00ffff' : '#007bff'),
                                '&:hover': {
                                  backgroundColor: p.featured ? '#f59e0b20' : (isDark ? '#00ffff20' : '#007bff10')
                                }
                              }}
                            >
                              {p.featured ? 'Unfeature' : 'Feature'}
                            </Button>
                            <Button
                              variant="outlined"
                              startIcon={<Edit />}
                              onClick={() => openEditDialog(p)}
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
                              onClick={() => handleDelete(p)}
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
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Project</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Category</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Tags</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Featured</TableCell>
                    <TableCell sx={{ color: 'white', fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(projects) && projects.map((p) => (
                    <TableRow 
                      key={p._id} 
                      hover 
                      sx={{ 
                        '&:hover': { 
                          backgroundColor: isDark ? '#1e293b' : '#f8fafc' 
                        } 
                      }}
                    >
                      <TableCell sx={{ py: 2.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Box sx={{ 
                            width: 50, 
                            height: 40, 
                            borderRadius: 1, 
                            overflow: 'hidden', 
                            flexShrink: 0,
                            backgroundColor: isDark ? '#1e293b' : '#f8fafc'
                          }}>
                            <img 
                              src={getImageUrl(p) || '/api/placeholder/50/40'} 
                              alt={p.title} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                              onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/50/40'; }} 
                            />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ 
                              fontWeight: 500, 
                              color: isDark ? '#ccd6f6' : '#333333' 
                            }}>
                              {p.title}
                            </Typography>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              {p.description?.substring(0, 60)}...
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Chip 
                          label={categories.find(c => c.value === p.category)?.label || p.category} 
                          color={getCategoryColor(p.category)} 
                          size="small" 
                        />
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {p.tags?.slice(0, 3).map((t, i) => (
                            <Chip key={i} label={t} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                          ))}
                          {p.tags && p.tags.length > 3 && (
                            <Chip label={`+${p.tags.length - 3}`} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <IconButton 
                          size="small" 
                          onClick={() => toggleFeatured(p)} 
                          sx={{ 
                            color: p.featured ? '#f59e0b' : (isDark ? '#a8b2d1' : '#666'),
                            '&:hover': {
                              backgroundColor: p.featured ? '#f59e0b20' : (isDark ? '#00ffff20' : '#007bff10')
                            }
                          }}
                        >
                          {p.featured ? <Star /> : <StarBorder />}
                        </IconButton>
                      </TableCell>
                      <TableCell sx={{ py: 2.5 }}>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => openViewDialogHandler(p)}
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
                            onClick={() => openEditDialog(p)}
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
                            onClick={() => handleDelete(p)}
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

          {(!Array.isArray(projects) || projects.length === 0) && !loading && (
            <Box sx={{ 
              textAlign: 'center', 
              py: 8,
              px: 2
            }}>
              <Folder sx={{ 
                fontSize: 64, 
                color: isDark ? '#334155' : '#cbd5e1',
                mb: 2
              }} />
              <Typography variant="h6" color={isDark ? '#a8b2d1' : '#666666'} sx={{ mb: 1 }}>
                No projects found
              </Typography>
              <Typography variant="body2" color={isDark ? '#94a3b8' : '#999999'}>
                Try adjusting your filters or create a new project
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
                Showing {((filters.page - 1) * filters.limit) + 1} to {Math.min(filters.page * filters.limit, pagination.totalItems)} of {pagination.totalItems} projects
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
            {dialogMode === 'create' ? 'Create New Project' : 'Edit Project'}
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {/* Image Upload */}
            {renderFormSection(
              "Project Image",
              <CloudUpload />,
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box sx={{ 
                  position: 'relative', 
                  width: '100%', 
                  maxWidth: 400,
                  cursor: 'pointer',
                  '&:hover': {
                    opacity: 0.8
                  }
                }} onClick={() => document.getElementById('project-image')?.click()}>
                  <Box sx={{ 
                    width: '100%', 
                    height: 200, 
                    borderRadius: 2, 
                    overflow: 'hidden', 
                    border: `2px dashed ${isDark ? '#334155' : '#e5e7eb'}`,
                    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Stack alignItems="center" spacing={1}>
                        <CloudUpload sx={{ fontSize: 48, color: isDark ? '#a8b2d1' : '#666' }} />
                        <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666'}>
                          Click to upload image
                        </Typography>
                      </Stack>
                    )}
                  </Box>
                  <input id="project-image" type="file" hidden accept="image/*" onChange={handleImageChange} />
                </Box>
              </Box>
            )}

            {/* Project Information */}
            {renderFormSection(
              "Project Information",
              <Work />,
              <>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  size="small"
                  sx={textFieldStyle}
                />
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  required
                  size="small"
                  sx={textFieldStyle}
                />
              </>
            )}

            {/* Category & Tags */}
            {renderFormSection(
              "Category & Tags",
              <Category />,
              <>
                <Box sx={{ 
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                  gap: 2
                }}>
                  <FormControl fullWidth size="small">
                    <InputLabel sx={labelStyle}>Category</InputLabel>
                    <Select 
                      value={formData.category} 
                      label="Category" 
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      sx={selectStyle}
                    >
                      {categories.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                    </Select>
                  </FormControl>
                  <TextField
                    fullWidth
                    label="Tags (comma separated)"
                    value={formData.tags.join(', ')}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) 
                    })}
                    size="small"
                    sx={textFieldStyle}
                    helperText="e.g. React, TypeScript, Next.js"
                  />
                </Box>
              </>
            )}

            {/* URLs */}
            {renderFormSection(
              "Project Links",
              <Link />,
              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2
              }}>
                <TextField
                  fullWidth
                  label="GitHub URL"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  size="small"
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: <GitHub sx={{ mr: 1, color: isDark ? '#a8b2d1' : '#666', fontSize: '1rem' }} />,
                  }}
                />
                <TextField
                  fullWidth
                  label="Live URL"
                  value={formData.liveUrl}
                  onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                  size="small"
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: <Language sx={{ mr: 1, color: isDark ? '#a8b2d1' : '#666', fontSize: '1rem' }} />,
                  }}
                />
              </Box>
            )}

            {/* Featured Status */}
            {renderFormSection(
              "Featured Status",
              <Star />,
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
            disabled={!formData.title || !formData.description || !formData.category}
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
                  {viewItem.title.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                    {viewItem.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip 
                      label={categories.find(c => c.value === viewItem.category)?.label || viewItem.category} 
                      color={getCategoryColor(viewItem.category)} 
                      size="small" 
                      sx={{ height: 20, fontSize: '0.65rem' }}
                    />
                    {viewItem.featured && (
                      <Chip 
                        label="⭐ Featured" 
                        color="warning" 
                        size="small" 
                        sx={{ height: 20, fontSize: '0.65rem' }}
                      />
                    )}
                  </Box>
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
                  {/* Featured Image */}
                  {getImageUrl(viewItem) && (
                    <Card sx={{ 
                      mb: 3, 
                      borderRadius: 2,
                      overflow: 'hidden',
                      backgroundColor: isDark ? '#1e293b' : '#f8fafc'
                    }}>
                      <img 
                        src={getImageUrl(viewItem) || '/api/placeholder/800/400'} 
                        alt={viewItem.title} 
                        style={{ width: '100%', maxHeight: 400, objectFit: 'cover' }}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/800/400'; }}
                      />
                    </Card>
                  )}

                  {/* Project Details */}
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
                      <Typography variant="body2" color={isDark ? '#a8b2d1' : '#666666'} sx={{ lineHeight: 1.8, mb: 2 }}>
                        {viewItem.description}
                      </Typography>
                      
                      <Divider sx={{ my: 2 }} />
                      
                      <Typography variant="subtitle1" sx={{ 
                        fontWeight: 'bold',
                        color: isDark ? '#ccd6f6' : '#333333',
                        mb: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}>
                        <Link /> Project Links
                      </Typography>
                      <Box sx={{ 
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                        gap: 2
                      }}>
                        {viewItem.github && (
                          <Box>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              <GitHub sx={{ fontSize: 14, mr: 0.5 }} /> GitHub
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                              <a href={viewItem.github} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#00ffff' : '#007bff', textDecoration: 'none' }}>
                                {viewItem.github}
                              </a>
                            </Typography>
                          </Box>
                        )}
                        {viewItem.liveUrl && (
                          <Box>
                            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                              <Web sx={{ fontSize: 14, mr: 0.5 }} /> Live URL
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                              <a href={viewItem.liveUrl} target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#00ffff' : '#007bff', textDecoration: 'none' }}>
                                {viewItem.liveUrl}
                              </a>
                            </Typography>
                          </Box>
                        )}
                      </Box>
                      
                      {viewItem.tags && viewItem.tags.length > 0 && (
                        <Box sx={{ mt: 2 }}>
                          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666666'}>
                            Tags
                          </Typography>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                            {viewItem.tags.map((tag, i) => (
                              <Chip key={i} label={tag} size="small" sx={{ height: 24 }} />
                            ))}
                          </Box>
                        </Box>
                      )}
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
                            Order
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 'medium', color: isDark ? '#ccd6f6' : '#333333' }}>
                            {viewItem.order || 0}
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
                  openEditDialog(viewItem);
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
                Edit Project
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