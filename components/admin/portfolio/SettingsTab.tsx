'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, Snackbar, CircularProgress,
  Divider, IconButton, Stack, Card, CardContent, useMediaQuery,
} from '@mui/material';
import { Add, Delete, CloudUpload, Save } from '@mui/icons-material';
import { useTheme } from '@/lib/theme-context';
import portfolioApi from '@/lib/api/portfolio';

interface Settings {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    profileImages: string[];
    resumeUrl: string;
  };
  about: {
    title: string;
    description: string;
    image?: string;
  };
  contact: {
    email: string;
    phone: string;
    location: string;
    socialLinks: { platform: string; url: string; icon: string }[];
  };
  stats: {
    projectsCompleted: number;
    happyClients: number;
    linesOfCode: number;
    yearsExperience: number;
  };
  seo: {
    title: string;
    description: string;
    keywords: string[];
    ogImage?: string;
  };
}

const initialSettings: Settings = {
  hero: { title: "Hi, I'm Amlakie", subtitle: 'Software Engineer', description: 'I build exceptional digital experiences.', profileImages: [], resumeUrl: '' },
  about: { title: 'About Me', description: '', image: '' },
  contact: { email: 'amlakieab4@gmail.com', phone: '+251 9 12 43 65 73', location: 'Addis Ababa, Ethiopia', socialLinks: [] },
  stats: { projectsCompleted: 25, happyClients: 15, linesOfCode: 50000, yearsExperience: 3 },
  seo: { title: 'Amlakie - Software Developer', description: 'Personal portfolio of Amlakie.', keywords: [], ogImage: '' },
};

export default function SettingsTab() {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const isDark = theme === 'dark';

  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [aboutImage, setAboutImage] = useState<File | null>(null);
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await portfolioApi.getSettingsAdmin();
      const data = res.data.data;
      if (data) {
        setSettings(data);
        if (data.about?.image) setAboutImagePreview(data.about.image);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleChange = (section: keyof Settings, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], [field]: value },
    }));
  };

  const handleSocialLinkChange = (index: number, field: string, value: string) => {
    const newLinks = [...settings.contact.socialLinks];
    newLinks[index] = { ...newLinks[index], [field]: value };
    setSettings(prev => ({ ...prev, contact: { ...prev.contact, socialLinks: newLinks } }));
  };

  const addSocialLink = () => {
    setSettings(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        socialLinks: [...prev.contact.socialLinks, { platform: '', url: '', icon: '' }],
      },
    }));
  };

  const removeSocialLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      contact: {
        ...prev.contact,
        socialLinks: prev.contact.socialLinks.filter((_, i) => i !== index),
      },
    }));
  };

  const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAboutImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setAboutImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      const fd = new FormData();
      fd.append('hero', JSON.stringify(settings.hero));
      fd.append('about', JSON.stringify({ ...settings.about, image: settings.about.image || '' }));
      fd.append('contact', JSON.stringify(settings.contact));
      fd.append('stats', JSON.stringify(settings.stats));
      fd.append('seo', JSON.stringify(settings.seo));
      if (aboutImage) fd.append('aboutImage', aboutImage);

      await portfolioApi.updateSettings(fd);
      setSuccess('Settings updated successfully');
      fetchSettings(); // refresh
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update settings');
    } finally {
      setSaving(false);
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

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress sx={{ color: isDark ? '#00ffff' : '#007bff' }} /></Box>;
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 3, color: isDark ? '#ccd6f6' : '#333' }}>Site Settings</Typography>

      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>Hero Section</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField fullWidth label="Title" value={settings.hero.title} onChange={(e) => handleChange('hero', 'title', e.target.value)} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Subtitle" value={settings.hero.subtitle} onChange={(e) => handleChange('hero', 'subtitle', e.target.value)} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Description" value={settings.hero.description} onChange={(e) => handleChange('hero', 'description', e.target.value)} size="small" sx={textFieldStyle} multiline rows={2} />
          <TextField fullWidth label="Resume URL" value={settings.hero.resumeUrl} onChange={(e) => handleChange('hero', 'resumeUrl', e.target.value)} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Profile Images (comma separated URLs)" value={settings.hero.profileImages.join(', ')} onChange={(e) => handleChange('hero', 'profileImages', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} size="small" sx={textFieldStyle} helperText="e.g. /images/profile1.jpg, /images/profile2.jpg" />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>About Section</Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ position: 'relative', width: 120, height: 120, borderRadius: 2, overflow: 'hidden', border: `2px dashed ${isDark ? '#334155' : '#e5e7eb'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }} onClick={() => document.getElementById('about-image')?.click()}>
              {aboutImagePreview ? <img src={aboutImagePreview} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <CloudUpload sx={{ fontSize: 40, color: isDark ? '#a8b2d1' : '#666' }} />}
            </Box>
            <input id="about-image" type="file" hidden accept="image/*" onChange={handleAboutImageChange} />
            <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666'}>Upload about image (optional)</Typography>
          </Box>
          <TextField fullWidth label="Title" value={settings.about.title} onChange={(e) => handleChange('about', 'title', e.target.value)} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Description" value={settings.about.description} onChange={(e) => handleChange('about', 'description', e.target.value)} size="small" sx={textFieldStyle} multiline rows={4} />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>Contact</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField fullWidth label="Email" value={settings.contact.email} onChange={(e) => handleChange('contact', 'email', e.target.value)} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Phone" value={settings.contact.phone} onChange={(e) => handleChange('contact', 'phone', e.target.value)} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Location" value={settings.contact.location} onChange={(e) => handleChange('contact', 'location', e.target.value)} size="small" sx={textFieldStyle} />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 2, color: isDark ? '#a8b2d1' : '#666' }}>Social Links</Typography>
        {settings.contact.socialLinks.map((link, index) => (
          <Card key={index} sx={{ mb: 2, p: 2, backgroundColor: isDark ? '#1e293b' : '#f8fafc', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
              <TextField label="Platform" value={link.platform} onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)} size="small" sx={textFieldStyle} />
              <TextField label="URL" value={link.url} onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)} size="small" sx={textFieldStyle} />
              <TextField label="Icon" value={link.icon} onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)} size="small" sx={textFieldStyle} helperText="e.g. AiFillLinkedin" />
              <IconButton onClick={() => removeSocialLink(index)} sx={{ color: isDark ? '#ff0000' : '#dc3545' }}><Delete /></IconButton>
            </Box>
          </Card>
        ))}
        <Button startIcon={<Add />} onClick={addSocialLink} sx={{ color: isDark ? '#00ffff' : '#007bff' }}>Add Social Link</Button>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>Stats (visible on homepage)</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField fullWidth label="Projects Completed" type="number" value={settings.stats.projectsCompleted} onChange={(e) => handleChange('stats', 'projectsCompleted', Number(e.target.value))} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Happy Clients" type="number" value={settings.stats.happyClients} onChange={(e) => handleChange('stats', 'happyClients', Number(e.target.value))} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Lines of Code" type="number" value={settings.stats.linesOfCode} onChange={(e) => handleChange('stats', 'linesOfCode', Number(e.target.value))} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Years Experience" type="number" value={settings.stats.yearsExperience} onChange={(e) => handleChange('stats', 'yearsExperience', Number(e.target.value))} size="small" sx={textFieldStyle} />
        </Box>
      </Paper>

      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>SEO</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField fullWidth label="Meta Title" value={settings.seo.title} onChange={(e) => handleChange('seo', 'title', e.target.value)} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Meta Description" value={settings.seo.description} onChange={(e) => handleChange('seo', 'description', e.target.value)} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="Keywords (comma separated)" value={settings.seo.keywords.join(', ')} onChange={(e) => handleChange('seo', 'keywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} size="small" sx={textFieldStyle} />
          <TextField fullWidth label="OG Image URL" value={settings.seo.ogImage} onChange={(e) => handleChange('seo', 'ogImage', e.target.value)} size="small" sx={textFieldStyle} />
        </Box>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="contained" startIcon={<Save />} onClick={handleSubmit} disabled={saving} sx={{ background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)', borderRadius: 1, '&:hover': { background: isDark ? 'linear-gradient(135deg, #00b3b3, #008080)' : 'linear-gradient(135deg, #0056b3, #004080)' }, '&.Mui-disabled': { background: isDark ? '#334155' : '#e5e7eb', color: isDark ? '#94a3b8' : '#94a3b8' } }}>
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
        </Button>
      </Box>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="error" onClose={() => setError('')}>{error}</Alert></Snackbar>
      <Snackbar open={!!success} autoHideDuration={6000} onClose={() => setSuccess('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}><Alert severity="success" onClose={() => setSuccess('')}>{success}</Alert></Snackbar>
    </Box>
  );
}