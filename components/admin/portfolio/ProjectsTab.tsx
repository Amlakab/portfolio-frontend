'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, Snackbar, CircularProgress, Pagination, TextField, FormControl, InputLabel, Select, MenuItem,
  IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack,
  useMediaQuery,
} from '@mui/material';
import { Add, Edit, Delete, Search, Refresh, Star, StarBorder, CloudUpload, Link } from '@mui/icons-material';
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
  const isDark = theme === 'dark';

  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [filters, setFilters] = useState({ search: '', category: '', featured: '', page: 1, limit: 10 });
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [formData, setFormData] = useState({
    title: '', description: '', category: '', tags: [] as string[], github: '', liveUrl: '', featured: false, order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
  try {
    setLoading(true);
    const res = await portfolioApi.getProjectsAdmin(filters);
    // ✅ Correct extraction
    const responseData = res.data?.data || {};
    const projectArray = Array.isArray(responseData.data) ? responseData.data : [];
    setProjects(projectArray);
    setPagination(responseData.pagination || { currentPage: 1, totalPages: 1, totalItems: projectArray.length });
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
    setFormData({ title: '', description: '', category: '', tags: [], github: '', liveUrl: '', featured: false, order: 0 });
    setImageFile(null);
    setImagePreview(null);
  };

  const openCreateDialog = () => { resetForm(); setDialogMode('create'); setSelectedProject(null); setOpenDialog(true); };
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
      // Corrected from toggleFeaturedProject to toggleFeatured
      await portfolioApi.toggleFeatured(project._id);
      setSuccess(`Featured ${project.featured ? 'disabled' : 'enabled'}`);
      fetchProjects();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to toggle');
    }
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

  const selectStyle = {
    borderRadius: 1,
    backgroundColor: isDark ? '#1e293b' : 'white',
    color: isDark ? '#ccd6f6' : '#333',
    '& .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#334155' : '#e5e7eb' },
    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#00ffff' : '#007bff' },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: isDark ? '#00ffff' : '#007bff' },
  };

  const labelStyle = { color: isDark ? '#a8b2d1' : '#666', '&.Mui-focused': { color: isDark ? '#00ffff' : '#007bff' } };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>Projects ({pagination.totalItems})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreateDialog} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', borderRadius: 1, '&:hover': { background: isDark ? 'linear-gradient(135deg, #00b3b3, #008080)' : 'linear-gradient(135deg, #0056b3, #004080)' } }}>New Project</Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr 1fr' }, gap: 2 }}>
          <TextField size="small" label="Search" value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} placeholder="Title or description..." InputProps={{ startAdornment: <Search sx={{ mr: 1, color: isDark ? '#a8b2d1' : '#666' }} /> }} sx={textFieldStyle} />
          <FormControl fullWidth size="small"><InputLabel sx={labelStyle}>Category</InputLabel><Select value={filters.category} label="Category" onChange={(e) => handleFilterChange('category', e.target.value)} sx={selectStyle}><MenuItem value="">All</MenuItem>{categories.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}</Select></FormControl>
          <FormControl fullWidth size="small"><InputLabel sx={labelStyle}>Featured</InputLabel><Select value={filters.featured} label="Featured" onChange={(e) => handleFilterChange('featured', e.target.value)} sx={selectStyle}><MenuItem value="">All</MenuItem><MenuItem value="true">Featured</MenuItem><MenuItem value="false">Not Featured</MenuItem></Select></FormControl>
          <Button variant="outlined" startIcon={<Refresh />} onClick={() => setFilters({ search: '', category: '', featured: '', page: 1, limit: 10 })} sx={{ borderColor: isDark ? '#00ffff' : '#007bff', color: isDark ? '#00ffff' : '#007bff', '&:hover': { backgroundColor: isDark ? '#00ffff20' : '#007bff10' } }}>Reset</Button>
        </Box>
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: isDark ? '#00ffff' : '#007bff' }} /></Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
            <Table>
              <TableHead><TableRow sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Project</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tags</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Featured</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {Array.isArray(projects) && projects.map((p) => (
                  <TableRow key={p._id} hover sx={{ '&:hover': { backgroundColor: isDark ? '#1e293b' : '#f8fafc' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 50, height: 40, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                          <img src={getImageUrl(p) || '/api/placeholder/50/40'} alt={p.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/50/40'; }} />
                        </Box>
                        <Box><Typography variant="body2" sx={{ fontWeight: 500, color: isDark ? '#ccd6f6' : '#333' }}>{p.title}</Typography><Typography variant="caption" color={isDark ? '#a8b2d1' : '#666'}>{p.description?.substring(0, 60)}...</Typography></Box>
                      </Box>
                    </TableCell>
                    <TableCell><Chip label={categories.find(c => c.value === p.category)?.label || p.category} size="small" /></TableCell>
                    <TableCell><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{p.tags?.map((t, i) => <Chip key={i} label={t} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />)}</Box></TableCell>
                    <TableCell><IconButton size="small" onClick={() => toggleFeatured(p)} sx={{ color: p.featured ? '#f59e0b' : isDark ? '#a8b2d1' : '#666' }}>{p.featured ? <Star /> : <StarBorder />}</IconButton></TableCell>
                    <TableCell><Box sx={{ display: 'flex', gap: 1 }}><IconButton size="small" onClick={() => openEditDialog(p)} sx={{ color: isDark ? '#00ffff' : '#007bff' }}><Edit fontSize="small" /></IconButton><IconButton size="small" onClick={() => handleDelete(p)} sx={{ color: isDark ? '#ff0000' : '#dc3545' }}><Delete fontSize="small" /></IconButton></Box></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {(!Array.isArray(projects) || projects.length === 0) && !loading && <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h6" color={isDark ? '#a8b2d1' : '#666'}>No projects found</Typography></Box>}
          {pagination.totalPages > 1 && <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}><Pagination count={pagination.totalPages} page={filters.page} onChange={(_, v) => handleFilterChange('page', v)} color="primary" sx={{ '& .MuiPaginationItem-root': { color: isDark ? '#ccd6f6' : '#333', '&.Mui-selected': { backgroundColor: isDark ? '#00ffff' : '#007bff', color: isDark ? '#0a192f' : 'white' } } }} /></Box>}
        </>
      )}

      {/* Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle component="div" sx={{ borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
          <Typography variant="h6" component="div" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>{dialogMode === 'create' ? 'Create New Project' : 'Edit Project'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                <Box sx={{ width: '100%', height: 180, borderRadius: 2, overflow: 'hidden', border: `2px dashed ${isDark ? '#334155' : '#e5e7eb'}`, backgroundColor: isDark ? '#1e293b' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { borderColor: isDark ? '#00ffff' : '#007bff' } }} onClick={() => document.getElementById('project-image')?.click()}>
                  {imagePreview ? <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Stack alignItems="center" spacing={1}><CloudUpload sx={{ fontSize: 40, color: isDark ? '#a8b2d1' : '#666' }} /><Typography variant="body2" color={isDark ? '#a8b2d1' : '#666'}>Upload image</Typography></Stack>}
                </Box>
                <input id="project-image" type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Box>
            </Box>
            <TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} size="small" sx={textFieldStyle} />
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <FormControl fullWidth size="small"><InputLabel sx={labelStyle}>Category</InputLabel><Select value={formData.category} label="Category" onChange={(e) => setFormData({ ...formData, category: e.target.value })} sx={selectStyle}>{categories.map(c => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}</Select></FormControl>
              <TextField fullWidth label="Tags (comma separated)" value={formData.tags.join(', ')} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} size="small" sx={textFieldStyle} helperText="e.g. React, TypeScript, Next.js" />
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
              <TextField fullWidth label="GitHub URL" value={formData.github} onChange={(e) => setFormData({ ...formData, github: e.target.value })} size="small" sx={textFieldStyle} InputProps={{ startAdornment: <Link sx={{ mr: 1, color: isDark ? '#a8b2d1' : '#666', fontSize: '1rem' }} /> }} />
              <TextField fullWidth label="Live URL" value={formData.liveUrl} onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })} size="small" sx={textFieldStyle} />
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}><Typography variant="body2" color={isDark ? '#a8b2d1' : '#666'}>Featured:</Typography><Button variant={formData.featured ? 'contained' : 'outlined'} size="small" onClick={() => setFormData({ ...formData, featured: !formData.featured })} sx={{ backgroundColor: formData.featured ? '#f59e0b' : 'transparent', color: formData.featured ? 'white' : isDark ? '#a8b2d1' : '#666', borderColor: '#f59e0b', '&:hover': { backgroundColor: formData.featured ? '#d97706' : '#f59e0b20' } }}>{formData.featured ? '⭐ Featured' : '☆ Not Featured'}</Button></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb', p: 2 }}><Button onClick={() => setOpenDialog(false)} sx={{ color: isDark ? '#00ffff' : '#007bff' }}>Cancel</Button><Button variant="contained" onClick={handleSubmit} disabled={!formData.title || !formData.description || !formData.category} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', '&:hover': { background: isDark ? 'linear-gradient(135deg, #00b3b3, #008080)' : 'linear-gradient(135deg, #0056b3, #004080)' }, '&.Mui-disabled': { background: isDark ? '#334155' : '#e5e7eb', color: isDark ? '#94a3b8' : '#94a3b8' } }}>{dialogMode === 'create' ? 'Create' : 'Update'}</Button></DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert></Snackbar>
    </Box>
  );
}