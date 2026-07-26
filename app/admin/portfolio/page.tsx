'use client';

import { useState } from 'react';
import { Box, Tabs, Tab, Typography, useMediaQuery, Paper } from '@mui/material';
import { useTheme } from '@/lib/theme-context';
import ProjectsTab from '@/components/admin/portfolio/ProjectsTab';
import ExperiencesTab from '@/components/admin/portfolio/ExperiencesTab';
import EducationsTab from '@/components/admin/portfolio/EducationsTab';
import TestimonialsTab from '@/components/admin/portfolio/TestimonialsTab';
import BlogTab from '@/components/admin/portfolio/BlogTab';
import SkillsTab from '@/components/admin/portfolio/SkillsTab';
import SettingsTab from '@/components/admin/portfolio/SettingsTab';

export default function PortfolioAdmin() {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    { label: 'Projects', component: <ProjectsTab /> },
    { label: 'Experiences', component: <ExperiencesTab /> },
    { label: 'Educations', component: <EducationsTab /> },
    { label: 'Testimonials', component: <TestimonialsTab /> },
    { label: 'Blog', component: <BlogTab /> },
    { label: 'Skills', component: <SkillsTab /> },
    { label: 'Settings', component: <SettingsTab /> },
  ];

  const isDark = theme === 'dark';

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: isDark ? '#0a192f' : '#f0f0f0', p: { xs: 2, md: 3 }, transition: 'background-color 0.3s ease' }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, backgroundColor: isDark ? '#0f172a80' : 'white', backdropFilter: isDark ? 'blur(10px)' : 'none', border: isDark ? '1px solid #334155' : '1px solid #e5e7eb' }}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: isDark ? '#ccd6f6' : '#333', mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>🎨 Portfolio Management</Typography>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} variant={isMobile ? 'scrollable' : 'fullWidth'} scrollButtons="auto" sx={{ mb: 3, '& .MuiTab-root': { color: isDark ? '#a8b2d1' : '#666', fontWeight: 500, '&.Mui-selected': { color: isDark ? '#00ffff' : '#007bff' } }, '& .MuiTabs-indicator': { backgroundColor: isDark ? '#00ffff' : '#007bff' } }}>
          {tabs.map((tab, i) => <Tab key={i} label={tab.label} />)}
        </Tabs>
        <Box sx={{ mt: 2 }}>{tabs[activeTab].component}</Box>
      </Paper>
    </Box>
  );
}