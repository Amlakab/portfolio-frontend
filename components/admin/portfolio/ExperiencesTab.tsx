'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Chip, Alert, Snackbar, CircularProgress, Pagination, TextField, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, Button, useMediaQuery,
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
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
  const isDark = theme === 'dark';

  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0 });
  const [page, setPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selected, setSelected] = useState<Experience | null>(null);
  const [formData, setFormData] = useState({
    role: '', company: '', period: '', description: '', location: '', order: 0,
  });

  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const res = await portfolioApi.getExperiencesAdmin({ page, limit: 10 });
      setItems(res.data.data.data || []);
      setPagination(res.data.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch');
    } finally {
      setLoading(false);
    }
  }, [page]);

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
        <Typography variant="h6" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>Experiences ({pagination.totalItems})</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', borderRadius: 1 }}>New Experience</Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: isDark ? '#00ffff' : '#007bff' }} /></Box>
      ) : (
        <>
          <TableContainer component={Paper} sx={{ backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
            <Table>
              <TableHead><TableRow sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)' }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Role / Company</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Period</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Location</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Actions</TableCell>
              </TableRow></TableHead>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item._id} hover sx={{ '&:hover': { backgroundColor: isDark ? '#1e293b' : '#f8fafc' } }}>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500, color: isDark ? '#ccd6f6' : '#333' }}>{item.role}</Typography>
                      <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666'}>{item.company}</Typography>
                    </TableCell>
                    <TableCell><Chip label={item.period} size="small" /></TableCell>
                    <TableCell>{item.location || '—'}</TableCell>
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
          {items.length === 0 && !loading && <Box sx={{ textAlign: 'center', py: 8 }}><Typography variant="h6" color={isDark ? '#a8b2d1' : '#666'}>No experiences found</Typography></Box>}
          {pagination.totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination count={pagination.totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" sx={{ '& .MuiPaginationItem-root': { color: isDark ? '#ccd6f6' : '#333', '&.Mui-selected': { backgroundColor: isDark ? '#00ffff' : '#007bff', color: isDark ? '#0a192f' : 'white' } } }} />
            </Box>
          )}
        </>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth fullScreen={isMobile}>
        <DialogTitle component="div" sx={{ borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
          <Typography variant="h6" component="div" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>{dialogMode === 'create' ? 'Create Experience' : 'Edit Experience'}</Typography>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField fullWidth label="Role" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Company" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Period (e.g. 2025 - Present)" value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} size="small" sx={textFieldStyle} />
            <TextField fullWidth label="Location (optional)" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} size="small" sx={textFieldStyle} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb', p: 2 }}>
          <Button onClick={() => setOpenDialog(false)} sx={{ color: isDark ? '#00ffff' : '#007bff' }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit} disabled={!formData.role || !formData.company || !formData.period || !formData.description} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', '&:hover': { background: isDark ? 'linear-gradient(135deg, #00b3b3, #008080)' : 'linear-gradient(135deg, #0056b3, #004080)' }, '&.Mui-disabled': { background: isDark ? '#334155' : '#e5e7eb', color: isDark ? '#94a3b8' : '#94a3b8' } }}>{dialogMode === 'create' ? 'Create' : 'Update'}</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert></Snackbar>
    </Box>
  );
}