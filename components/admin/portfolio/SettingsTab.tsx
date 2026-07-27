'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Box, Typography, Paper, TextField, Button, Alert, Snackbar, CircularProgress,
  Divider, IconButton, Card, useMediaQuery,
} from '@mui/material';
import { Add, Delete, CloudUpload, Save, Close, Refresh } from '@mui/icons-material';
import { useTheme } from '@/lib/theme-context';
import portfolioApi from '@/lib/api/portfolio';

interface Settings {
  hero: {
    title: string;
    subtitle: string;
    description: string;
    profileImages: string[];
    profileImagesData?: any[];
    resumeUrl: string;
  };
  about: {
    title: string;
    description: string;
    image?: string;
    imageData?: any;
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
  hero: {
    title: "Hi, I'm Amlakie",
    subtitle: 'Software Engineer',
    description: 'I build exceptional digital experiences.',
    profileImages: [],
    profileImagesData: [],
    resumeUrl: ''
  },
  about: { title: 'About Me', description: '', image: '' },
  contact: {
    email: 'amlakieab4@gmail.com',
    phone: '+251 9 12 43 65 73',
    location: 'Addis Ababa, Ethiopia',
    socialLinks: []
  },
  stats: { projectsCompleted: 25, happyClients: 15, linesOfCode: 50000, yearsExperience: 3 },
  seo: { title: 'Amlakie - Software Developer', description: 'Personal portfolio of Amlakie.', keywords: [], ogImage: '' },
};

// Helper function to convert image data to URL
const getImageUrl = (item: any): string | null => {
  if (!item) return null;

  // Check for imageData
  if (item.imageData) {
    let base64 = '';
    
    // Handle different data formats
    if (typeof item.imageData.data === 'string') {
      base64 = item.imageData.data;
    } else if (item.imageData.data?.$binary?.base64) {
      base64 = item.imageData.data.$binary.base64;
    } else if (item.imageData.data?.data) {
      try {
        if (typeof item.imageData.data.data === 'string') {
          base64 = item.imageData.data.data;
        } else if (item.imageData.data.data instanceof Buffer || Array.isArray(item.imageData.data.data)) {
          base64 = Buffer.from(item.imageData.data.data).toString('base64');
        }
      } catch (e) {
        console.warn('Failed to convert imageData:', e);
      }
    } else if (item.imageData.data instanceof Buffer) {
      base64 = item.imageData.data.toString('base64');
    } else if (item.imageData.data && typeof item.imageData.data === 'object') {
      try {
        const dataStr = JSON.stringify(item.imageData.data);
        base64 = Buffer.from(dataStr).toString('base64');
      } catch (e) {
        console.warn('Failed to convert complex imageData:', e);
      }
    }
    
    if (base64) {
      return `data:${item.imageData.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }

  // Handle image URL
  if (item.image) {
    if (item.image.startsWith('data:image')) {
      return item.image;
    }
    if (item.image.startsWith('/uploads/')) {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      return `${base}${item.image}`;
    }
    if (item.image.startsWith('/images/')) {
      return item.image;
    }
    return item.image;
  }

  return null;
};

// Helper function to get profile image URL
const getProfileImageUrl = (profileImage: any): string | null => {
  if (!profileImage) return null;

  // If it's a string URL
  if (typeof profileImage === 'string') {
    if (profileImage.startsWith('data:')) return profileImage;
    if (profileImage.startsWith('/uploads/')) {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      return `${base}${profileImage}`;
    }
    if (profileImage.startsWith('/images/')) {
      return profileImage;
    }
    return profileImage;
  }

  // If it's an object with imageData
  if (profileImage.imageData) {
    let base64 = '';
    const data = profileImage.imageData;
    
    if (typeof data.data === 'string') {
      base64 = data.data;
    } else if (data.data?.$binary?.base64) {
      base64 = data.data.$binary.base64;
    } else if (data.data?.data) {
      try {
        if (typeof data.data.data === 'string') {
          base64 = data.data.data;
        } else if (data.data.data instanceof Buffer || Array.isArray(data.data.data)) {
          base64 = Buffer.from(data.data.data).toString('base64');
        }
      } catch (e) {
        console.warn('Failed to convert profile image:', e);
      }
    } else if (data.data instanceof Buffer) {
      base64 = data.data.toString('base64');
    }
    
    if (base64) {
      return `data:${data.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }

  // If it's directly the image data object
  if (profileImage.data) {
    let base64 = '';
    const data = profileImage;
    
    if (typeof data.data === 'string') {
      base64 = data.data;
    } else if (data.data?.$binary?.base64) {
      base64 = data.data.$binary.base64;
    } else if (data.data?.data) {
      try {
        if (typeof data.data.data === 'string') {
          base64 = data.data.data;
        } else if (data.data.data instanceof Buffer || Array.isArray(data.data.data)) {
          base64 = Buffer.from(data.data.data).toString('base64');
        }
      } catch (e) {
        console.warn('Failed to convert profile image:', e);
      }
    } else if (data.data instanceof Buffer) {
      base64 = data.data.toString('base64');
    }
    
    if (base64) {
      return `data:${data.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }

  return null;
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
  const [existingAboutImage, setExistingAboutImage] = useState<string | null>(null);

  const [profileImages, setProfileImages] = useState<File[]>([]);
  const [profileImagePreviews, setProfileImagePreviews] = useState<string[]>([]);
  const [existingProfileImages, setExistingProfileImages] = useState<string[]>([]);

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await portfolioApi.getSettingsAdmin();
      const data = res.data.data;
      
      console.log('📥 Settings data received:', data);
      
      if (data) {
        setSettings(data);

        // Handle about image
        if (data.about?.imageData) {
          const preview = getImageUrl({ imageData: data.about.imageData });
          console.log('📸 About imageData preview:', preview ? 'Generated' : 'Failed');
          if (preview) {
            setExistingAboutImage(preview);
            setAboutImagePreview(preview);
          }
        } else if (data.about?.image) {
          const preview = getImageUrl({ image: data.about.image });
          console.log('📸 About image preview:', preview ? 'Generated' : 'Failed');
          if (preview) {
            setExistingAboutImage(preview);
            setAboutImagePreview(preview);
          }
        }

        // Handle profile images
        if (data.hero?.profileImagesData && data.hero.profileImagesData.length > 0) {
          console.log('📸 Profile imagesData count:', data.hero.profileImagesData.length);
          const previews = data.hero.profileImagesData
            .map((img: any) => getProfileImageUrl({ imageData: img }))
            .filter((p: string | null) => p !== null);
          
          console.log('📸 Generated profile previews:', previews.length);
          setExistingProfileImages(previews);
          setProfileImagePreviews(previews);
        } else if (data.hero?.profileImages && data.hero.profileImages.length > 0) {
          console.log('📸 Profile images count:', data.hero.profileImages.length);
          const previews = data.hero.profileImages
            .map((img: string) => getProfileImageUrl(img))
            .filter((p: string | null) => p !== null);
          
          console.log('📸 Generated profile previews from URLs:', previews.length);
          setExistingProfileImages(previews);
          setProfileImagePreviews(previews);
        }
      }
    } catch (err: any) {
      console.error('❌ Failed to load settings:', err);
      setError(err.response?.data?.message || 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    fetchSettings(); 
  }, [fetchSettings]);

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
      reader.onloadend = () => {
        setAboutImagePreview(reader.result as string);
        setExistingAboutImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAboutImage = () => {
    setAboutImage(null);
    setAboutImagePreview(null);
    setExistingAboutImage(null);
  };

  const handleProfileImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      setProfileImages(prev => [...prev, ...fileArray]);

      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setProfileImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeProfileImage = (index: number) => {
    if (index < existingProfileImages.length) {
      setExistingProfileImages(prev => prev.filter((_, i) => i !== index));
      setProfileImagePreviews(prev => prev.filter((_, i) => i !== index));
    } else {
      const newImageIndex = index - existingProfileImages.length;
      setProfileImages(prev => prev.filter((_, i) => i !== newImageIndex));
      setProfileImagePreviews(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setError('');

      const fd = new FormData();

      const heroData = { 
        ...settings.hero,
        profileImagesData: undefined 
      };

      const aboutData = { 
        ...settings.about,
        imageData: undefined 
      };

      fd.append('hero', JSON.stringify(heroData));
      fd.append('about', JSON.stringify(aboutData));
      fd.append('contact', JSON.stringify(settings.contact));
      fd.append('stats', JSON.stringify(settings.stats));
      fd.append('seo', JSON.stringify(settings.seo));

      if (aboutImage) {
        fd.append('aboutImage', aboutImage);
        console.log('📎 New about image:', aboutImage.name);
      }

      profileImages.forEach(file => {
        fd.append('profileImages', file);
        console.log('📎 New profile image:', file.name);
      });

      console.log('📤 Sending settings update...');
      console.log('📎 About image:', aboutImage ? aboutImage.name : 'None');
      console.log('📎 Profile images:', profileImages.length);

      const response = await portfolioApi.updateSettings(fd);
      console.log('✅ Settings updated successfully:', response);

      setSuccess('Settings updated successfully');
      
      setAboutImage(null);
      setProfileImages([]);
      
      await fetchSettings();
    } catch (err: any) {
      console.error('❌ Failed to update settings:', err);
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
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress sx={{ color: isDark ? '#00ffff' : '#007bff' }} />
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" sx={{ color: isDark ? '#ccd6f6' : '#333' }}>
          Site Settings
        </Typography>
        <Button
          variant="outlined"
          startIcon={<Refresh />}
          onClick={fetchSettings}
          sx={{
            borderColor: isDark ? '#00ffff' : '#007bff',
            color: isDark ? '#00ffff' : '#007bff',
            '&:hover': {
              backgroundColor: isDark ? '#00ffff20' : '#007bff10',
            },
          }}
        >
          Refresh
        </Button>
      </Box>

      {/* Hero Section */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>
          Hero Section
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle2" sx={{ mb: 1, color: isDark ? '#a8b2d1' : '#666' }}>
            Profile Images ({profileImagePreviews.length})
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {profileImagePreviews.map((preview, index) => (
              <Box
                key={index}
                sx={{
                  position: 'relative',
                  width: 100,
                  height: 100,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `2px solid ${isDark ? '#334155' : '#e5e7eb'}`,
                }}
              >
                <img
                  src={preview || '/images/placeholder.jpg'}
                  alt={`Profile ${index + 1}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    console.error('Failed to load profile image:', preview);
                    (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                  }}
                />
                <IconButton
                  size="small"
                  onClick={() => removeProfileImage(index)}
                  sx={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    '&:hover': { backgroundColor: 'rgba(255,0,0,0.8)' },
                    padding: '4px',
                  }}
                >
                  <Close sx={{ fontSize: 16, color: '#fff' }} />
                </IconButton>
              </Box>
            ))}
            <Box
              sx={{
                width: 100,
                height: 100,
                borderRadius: 2,
                border: `2px dashed ${isDark ? '#334155' : '#e5e7eb'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                '&:hover': { borderColor: isDark ? '#00ffff' : '#007bff' },
              }}
              onClick={() => document.getElementById('profile-images')?.click()}
            >
              <CloudUpload sx={{ fontSize: 40, color: isDark ? '#a8b2d1' : '#666' }} />
            </Box>
            <input
              id="profile-images"
              type="file"
              hidden
              accept="image/*"
              multiple
              onChange={handleProfileImagesChange}
            />
          </Box>
          <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666'} sx={{ mt: 1, display: 'block' }}>
            Upload 1-3 profile images (JPG, PNG, WEBP). New images will be added to existing ones.
          </Typography>
        </Box>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            fullWidth
            label="Title"
            value={settings.hero.title}
            onChange={(e) => handleChange('hero', 'title', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Subtitle"
            value={settings.hero.subtitle}
            onChange={(e) => handleChange('hero', 'subtitle', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Description"
            value={settings.hero.description}
            onChange={(e) => handleChange('hero', 'description', e.target.value)}
            size="small"
            sx={textFieldStyle}
            multiline
            rows={2}
          />
          <TextField
            fullWidth
            label="Resume URL"
            value={settings.hero.resumeUrl}
            onChange={(e) => handleChange('hero', 'resumeUrl', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
        </Box>
      </Paper>

      {/* About Section */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>
          About Section
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
            <Box 
              sx={{ 
                position: 'relative', 
                width: 120, 
                height: 120, 
                borderRadius: 2, 
                overflow: 'hidden', 
                border: `2px dashed ${isDark ? '#334155' : '#e5e7eb'}`, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                cursor: 'pointer' 
              }} 
              onClick={() => document.getElementById('about-image')?.click()}
            >
              {aboutImagePreview ? (
                <>
                  <img
                    src={aboutImagePreview}
                    alt="About"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={(e) => {
                      console.error('Failed to load about image:', aboutImagePreview);
                      (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                    }}
                  />
                  <IconButton
                    size="small"
                    onClick={(e) => { e.stopPropagation(); removeAboutImage(); }}
                    sx={{
                      position: 'absolute',
                      top: 4,
                      right: 4,
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      '&:hover': { backgroundColor: 'rgba(255,0,0,0.8)' },
                      padding: '4px',
                    }}
                  >
                    <Close sx={{ fontSize: 16, color: '#fff' }} />
                  </IconButton>
                </>
              ) : (
                <CloudUpload sx={{ fontSize: 40, color: isDark ? '#a8b2d1' : '#666' }} />
              )}
            </Box>
            <input id="about-image" type="file" hidden accept="image/*" onChange={handleAboutImageChange} />
            <Box>
              <Typography variant="caption" color={isDark ? '#a8b2d1' : '#666'} display="block">
                Upload about image (optional)
              </Typography>
              {existingAboutImage && !aboutImage && (
                <Typography variant="caption" sx={{ color: isDark ? '#00ffff' : '#007bff' }}>
                  Current image loaded
                </Typography>
              )}
              {aboutImage && (
                <Typography variant="caption" sx={{ color: isDark ? '#00ffff' : '#007bff' }}>
                  New image selected: {aboutImage.name}
                </Typography>
              )}
            </Box>
          </Box>
          <TextField
            fullWidth
            label="Title"
            value={settings.about.title}
            onChange={(e) => handleChange('about', 'title', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Description"
            value={settings.about.description}
            onChange={(e) => handleChange('about', 'description', e.target.value)}
            size="small"
            sx={textFieldStyle}
            multiline
            rows={4}
          />
        </Box>
      </Paper>

      {/* Contact Section */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>
          Contact
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            fullWidth
            label="Email"
            value={settings.contact.email}
            onChange={(e) => handleChange('contact', 'email', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Phone"
            value={settings.contact.phone}
            onChange={(e) => handleChange('contact', 'phone', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Location"
            value={settings.contact.location}
            onChange={(e) => handleChange('contact', 'location', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
        </Box>
        <Divider sx={{ my: 2 }} />
        <Typography variant="subtitle2" sx={{ mb: 2, color: isDark ? '#a8b2d1' : '#666' }}>
          Social Links
        </Typography>
        {settings.contact.socialLinks.map((link, index) => (
          <Card key={index} sx={{ mb: 2, p: 2, backgroundColor: isDark ? '#1e293b' : '#f8fafc', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1fr auto' }, gap: 2, alignItems: 'center' }}>
              <TextField
                label="Platform"
                value={link.platform}
                onChange={(e) => handleSocialLinkChange(index, 'platform', e.target.value)}
                size="small"
                sx={textFieldStyle}
              />
              <TextField
                label="URL"
                value={link.url}
                onChange={(e) => handleSocialLinkChange(index, 'url', e.target.value)}
                size="small"
                sx={textFieldStyle}
              />
              <TextField
                label="Icon"
                value={link.icon}
                onChange={(e) => handleSocialLinkChange(index, 'icon', e.target.value)}
                size="small"
                sx={textFieldStyle}
                helperText="e.g. AiFillLinkedin"
              />
              <IconButton onClick={() => removeSocialLink(index)} sx={{ color: isDark ? '#ff0000' : '#dc3545' }}>
                <Delete />
              </IconButton>
            </Box>
          </Card>
        ))}
        <Button startIcon={<Add />} onClick={addSocialLink} sx={{ color: isDark ? '#00ffff' : '#007bff' }}>
          Add Social Link
        </Button>
      </Paper>

      {/* Stats Section */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>
          Stats
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            fullWidth
            label="Projects Completed"
            type="number"
            value={settings.stats.projectsCompleted}
            onChange={(e) => handleChange('stats', 'projectsCompleted', Number(e.target.value))}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Happy Clients"
            type="number"
            value={settings.stats.happyClients}
            onChange={(e) => handleChange('stats', 'happyClients', Number(e.target.value))}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Lines of Code"
            type="number"
            value={settings.stats.linesOfCode}
            onChange={(e) => handleChange('stats', 'linesOfCode', Number(e.target.value))}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Years Experience"
            type="number"
            value={settings.stats.yearsExperience}
            onChange={(e) => handleChange('stats', 'yearsExperience', Number(e.target.value))}
            size="small"
            sx={textFieldStyle}
          />
        </Box>
      </Paper>

      {/* SEO Section */}
      <Paper sx={{ p: 3, mb: 4, backgroundColor: isDark ? '#0f172a80' : 'white', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2, color: isDark ? '#00ffff' : '#007bff' }}>
          SEO
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
          <TextField
            fullWidth
            label="Meta Title"
            value={settings.seo.title}
            onChange={(e) => handleChange('seo', 'title', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Meta Description"
            value={settings.seo.description}
            onChange={(e) => handleChange('seo', 'description', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="Keywords"
            value={settings.seo.keywords.join(', ')}
            onChange={(e) => handleChange('seo', 'keywords', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
            size="small"
            sx={textFieldStyle}
          />
          <TextField
            fullWidth
            label="OG Image URL"
            value={settings.seo.ogImage}
            onChange={(e) => handleChange('seo', 'ogImage', e.target.value)}
            size="small"
            sx={textFieldStyle}
          />
        </Box>
      </Paper>

      {/* Save Button */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          startIcon={<Save />}
          onClick={handleSubmit}
          disabled={saving}
          sx={{
            background: isDark ? 'linear-gradient(135deg, #00ffff, #00b3b3)' : 'linear-gradient(135deg, #007bff, #0056b3)',
            borderRadius: 1,
            '&:hover': {
              background: isDark ? 'linear-gradient(135deg, #00b3b3, #008080)' : 'linear-gradient(135deg, #0056b3, #004080)',
            },
            '&.Mui-disabled': {
              background: isDark ? '#334155' : '#e5e7eb',
              color: isDark ? '#94a3b8' : '#94a3b8',
            },
          }}
        >
          {saving ? <CircularProgress size={24} color="inherit" /> : 'Save Settings'}
        </Button>
      </Box>

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
    </Box>
  );
}