'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, Snackbar, CircularProgress, Pagination, TextField, IconButton, Switch,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, Stack, useMediaQuery,
} from '@mui/material';
import { Add, Edit, Delete, CloudUpload, Visibility, VisibilityOff } from '@mui/icons-material';
import { useTheme } from '@/lib/theme-context';
import portfolioApi from '@/lib/api/portfolio';

interface BlogPost {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image?: string;
  imageData?: any;
  category: string;
  tags: string[];
  published: boolean;
  views: number;
  publishedAt?: string;
  created_at: string;
}

const getImageUrl = (item: BlogPost): string | null => {
  if (item.imageData?.data) {
    let base64 = '';
    if (typeof item.imageData.data === 'string') base64 = item.imageData.data;
    else if (item.imageData.data?.$binary?.base64) base64 = item.imageData.data.$binary.base64;
    else if (item.imageData.data?.data) base64 = Buffer.from(item.imageData.data.data).toString('base64');
    if (base64) return `data:${item.imageData.contentType || 'image/jpeg'};base64,${base64}`;
  }
  if (item.image?.startsWith('data:image')) return item.image;
  return item.image || null;
};

export default function BlogTab() {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDark = theme === 'dark';

  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState({
    title: '', slug: '', excerpt: '', content: '', category: '', tags: [] as string[], published: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await portfolioApi.getBlogPostsAdmin({ page, limit: 10 });
      setItems(res.data.data.data || []);
      setPagination(res.data.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { fetchItems(); }, [fetchItems]);

  const resetForm = () => setFormData({ title: '', slug: '', excerpt: '', content: '', category: '', tags: [], published: false });

  const openCreate = () => { resetForm(); setImageFile(null); setImagePreview(null); setDialogMode('create'); setSelected(null); setOpenDialog(true); };
  const openEdit = (item: BlogPost) => {
    setSelected(item);
    setFormData({
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      content: item.content,
      category: item.category,
      tags: item.tags || [],
      published: item.published || false,
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
      Object.entries(formData).forEach(([k, v]) => {
        if (k === 'tags') fd.append(k, JSON.stringify(v));
        else fd.append(k, String(v));
      });
      if (imageFile) fd.append('image', imageFile);

      if (dialogMode === 'create') {
        await portfolioApi.createBlogPost(fd);
      } else if (selected?._id) {
        await portfolioApi.updateBlogPost(selected._id, fd);
      }

      setSuccess(`Blog post ${dialogMode === 'create' ? 'created' : 'updated'}`);
      setOpenDialog(false);
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save');
    }
  };

  const handleDelete = async (item: BlogPost) => {
    if (!confirm(`Delete "${item.title}"?`)) return;
    try {
      await portfolioApi.deleteBlogPost(item._id);
      setSuccess('Blog post deleted');
      fetchItems();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete');
    }
  };

  const togglePublish = async (item: BlogPost) => {
    try {
      await portfolioApi.togglePublish(item._id);
      setSuccess(`Published ${item.published ? 'disabled' : 'enabled'}`);
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
        <Typography variant="h6" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>Blog Posts ({pagination.totalItems})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', borderRadius: 1 }}>New Post</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: isDark ? '#00ffff' : '#007bff' }} /></Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
            <Table>
              <TableHead><TableRow sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title / Category</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Tags</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} hover sx={{ '&:hover': { backgroundColor: isDark ? '#1e293b' : '#f8fafc' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Box sx={{ width: 50, height: 40, borderRadius: 1, overflow: 'hidden', flexShrink: 0 }}>
                          <img src={getImageUrl(item) || '/api/placeholder/50/40'} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = '/api/placeholder/50/40'; }} />
                        </Box>
                        <Box><Typography variant="body2" sx={{ fontWeight: 500, color: isDark ? '#ccd6f6' : '#333' }}>{item.title}</Typography><Typography variant="caption" color={isDark ? '#a8b2d1' : '#666'}>{item.category}</Typography></Box>
                      </Box>
                    </TableCell>
                    <TableCell><Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>{item.tags?.map((t, i) => <Chip key={i} label={t} size="small" sx={{ height: 20, fontSize: '0.65rem' }} />)}</Box></TableCell>
                    <TableCell><Chip label={item.published ? 'Published' : 'Draft'} color={item.published ? 'success' : 'default'} size="small" /></TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" onClick={() => togglePublish(item)} sx={{ color: item.published ? isDark ? '#00ff00' : '#28a745' : isDark ? '#a8b2d1' : '#666' }}>{item.published ? <Visibility /> : <VisibilityOff />}</IconButton>
                        <IconButton size="small" onClick={() => openEdit(item)} sx={{ color: isDark ? '#00ffff' : '#007bff' }}><Edit fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDelete(item)} sx={{ color: isDark ? '#ff0000' : '#dc3545' }}><Delete fontSize="small" /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          {items.length === 0 && !loading && <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h6" color={isDark ? '#a8b2d1' : '#666'}>No blog posts found</Typography></Box>}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" sx={{ '& .MuiPaginationItem-root': { color: isDark ? '#ccd6f6' : '#333', '&.Mui-selected': { backgroundColor: isDark ? '#00ffff' : '#007bff', color: isDark ? '#0a192f' : 'white' } } }} />
            </Box>
          )}
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle component="div" sx={{ borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
          <Typography variant="h6" component="div" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>{dialogMode === 'create' ? 'Create Blog Post' : 'Edit Blog Post'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Box sx={{ position: 'relative', width: '100%', maxWidth: 400 }}>
                <Box sx={{ width: '100%', height: 150, borderRadius: 2, overflow: 'hidden', border: `2px dashed ${isDark ? '#334155' : '#e5e7eb'}`, backgroundColor: isDark ? '#1e293b' : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', '&:hover': { borderColor: isDark ? '#00ffff' : '#007bff' } }} onClick={() => document.getElementById('blog-image')?.click()}>
                  {imagePreview ? <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <Stack alignItems="center" spacing={1}><CloudUpload sx={{ fontSize: 40, color: isDark ? '#a8b2d1' : '#666' }} /><Typography variant="body2" color={isDark ? '#a8b2d1' : '#666'}>Upload image</Typography></Stack>}
                </Box>
                <input id="blog-image" type="file" hidden accept="image/*" onChange={handleImageChange} />
              </Box>
            </Box>
            <TextField fullWidth label="Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Slug (auto-generated if empty)" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} size="small" sx={textFieldStyle} helperText="Leave blank to auto-generate from title" />
            <TextField fullWidth label="Excerpt" value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} multiline rows={2} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Content" value={formData.content} onChange={(e) => setFormData({ ...formData, content: e.target.value })} multiline rows={4} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Tags (comma separated)" value={formData.tags.join(', ')} onChange={(e) => setFormData({ ...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} size="small" sx={textFieldStyle} helperText="e.g. React, JavaScript" />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}><Typography variant="body2" color={isDark ? '#a8b2d1' : '#666'}>Published:</Typography><Switch checked={formData.published} onChange={(e) => setFormData({ ...formData, published: e.target.checked })} /></Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb', p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: isDark ? '#00ffff' : '#007bff' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.title || !formData.excerpt || !formData.content || !formData.category} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', '&:hover': { background: isDark ? 'linear-gradient(135deg, #00b3b3, #008080)' : 'linear-gradient(135deg, #0056b3, #004080)' }, '&.Mui-disabled': { background: isDark ? '#334155' : '#e5e7eb', color: isDark ? '#94a3b8' : '#94a3b8' } }}>{dialogMode === 'create' ? 'Create' : 'Update'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert></Snackbar>
    </Box>
  );
}