'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Alert, Snackbar, CircularProgress, Pagination, TextField, IconButton, Rating,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, useMediaQuery,
} from '@mui/material';
import { Add, Edit, Delete, Star, StarBorder, CloudUpload } from '@mui/icons-material';
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
  const isDark = theme === 'dark';

  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    name: '', role: '', content: '', rating: 5, featured: false, order: 0,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await portfolioApi.getTestimonialsAdmin({ page, limit: 10 });
      setItems(res.data.data.data || []);
      setPagination(res.data.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const resetForm = () => setFormData({ name: '', role: '', content: '', rating: 5, featured: false, order: 0 });

  const openCreate = () => { resetForm(); setImageFile(null); setImagePreview(null); setDialogMode('create'); setSelected(null); setOpenDialog(true); };
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

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h6" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>Testimonials ({pagination.totalItems})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', borderRadius: 1 }}>New Testimonial</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: isDark ? '#00ffff' : '#007bff' }} /></Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
            <Table>
              <TableHead><TableRow sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name / Role</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Rating</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Featured</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} hover sx={{ '&:hover': { backgroundColor: isDark ? '#1e293b' : '#f8fafc' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                          <img src={getImageUrl(item) || '/api/placeholder/40/40'} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/40/40'; }} />
                        </Box>
                        <Box><Typography variant="body2" sx={{ fontWeight: 500, color: isDark ? '#ccd6f6' : '#333' }}>{item.name}</Typography><Typography variant="caption" color={isDark ? '#a8b2d1' : '#666'}>{item.role}</Typography></Box>
                      </Box>
                    </TableCell>
                    <TableCell><Rating value={item.rating} readOnly size="small" /></TableCell>
                    <TableCell><IconButton size="small" onClick={() => toggleFeatured(item)} sx={{ color: item.featured ? '#f59e0b' : isDark ? '#a8b2d1' : '#666' }}>{item.featured ? <Star /> : <StarBorder />}</IconButton></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: isDark ? '#00ffff' : '#007bff' }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item)} sx={{ color: isDark ? '#ff0000' : '#dc3545' }}><Delete fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {items.length === 0 && !loading && <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h6" color={isDark ? '#a8b2d1' : '#666'}>No testimonials found</Typography></Box>}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" sx={{ '& .MuiPaginationItem-root': { color: isDark ? '#ccd6f6' : '#333', '&.Mui-selected': { backgroundColor: isDark ? '#00ffff' : '#007bff', color: isDark ? '#0a192f' : 'white' } } }} />
            </Box>
          )}
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle component="div" sx={{ borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
          <Typography variant="h6" component="div" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>{dialogMode === 'create' ? 'Create Testimonial' : 'Edit Testimonial'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 200 }}>
                <Box sx={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', border: `2px dashed ${isDark ? '#334155' : '#e5e7eb'}`, backgroundColor: isDark ? '#1e293b' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', mx: 'auto', '&:hover': { borderColor: isDark ? '#00ffff' : '#007bff' } }} onClick={() => document.getElementById('testimonial-avatar')?.click()}>
                  {imagePreview ? <img src={imagePreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <CloudUpload sx={{ fontSize: 40, color: isDark ? '#a8b2d1' : '#666' }} />}
                </Box>
                <input id="testimonial-avatar" type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Box>
            </Box>
            <TextField fullWidth label="Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} multiline rows={3} size="small" sx={textFieldStyle} />
            <Box><Typography variant="body2" sx={{ mb: 1, color: isDark ? '#a8b2d1' : '#666' }}>Rating</Typography><Rating value={formData.rating} onChange={(_, v) => setFormData({ ...formData, rating: v || 5 })} /></Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}><Typography variant="body2" color={isDark ? '#a8b2d1' : '#666'}>Featured:</Typography><Button variant={formData.featured ? 'contained' : 'outlined'} size="small" onClick={() => setFormData({ ...formData, featured: !formData.featured })} sx={{ backgroundColor: formData.featured ? '#f59e0b' : 'transparent', color: formData.featured ? 'white' : isDark ? '#a8b2d1' : '#666', borderColor: '#f59e0b', '&:hover': { backgroundColor: formData.featured ? '#d97706' : '#f59e0b20' } }}>{formData.featured ? '⭐ Featured' : '☆ Not Featured'}</Button></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb', p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: isDark ? '#00ffff' : '#007bff' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.name || !formData.role || !formData.content} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', '&:hover': { background: isDark ? 'linear-gradient(135deg, #00b3b3, #008080)' : 'linear-gradient(135deg, #0056b3, #004080)' }, '&.Mui-disabled': { background: isDark ? '#334155' : '#e5e7eb', color: isDark ? '#94a3b8' : '#94a3b8' } }}>{dialogMode === 'create' ? 'Create' : 'Update'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert></Snackbar>
    </Box>
  );
}