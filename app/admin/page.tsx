'use client';

import { useState, useEffect } from 'react';
import { Box, Tabs, Tab, Typography, useMediaQuery, Paper } from '@mui/material';
import { useTheme } from '@/lib/theme-context';
import { useSearchParams, useRouter } from 'next/navigation';
import ProjectsTab from '@/components/admin/portfolio/ProjectsTab';
import ExperiencesTab from '@/components/admin/portfolio/ExperiencesTab';
import EducationsTab from '@/components/admin/portfolio/EducationsTab';
import TestimonialsTab from '@/components/admin/portfolio/TestimonialsTab';
import BlogTab from '@/components/admin/portfolio/BlogTab';
import SkillsTab from '@/components/admin/portfolio/SkillsTab';
import SettingsTab from '@/components/admin/portfolio/SettingsTab';
import { 
  Folder, Work, School, FormatQuote, Article, Code, Settings,
  Dashboard, TrendingUp, People, Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';

export default function PortfolioAdmin() {
  const { theme } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState(0);
  const isDark = theme === 'dark';

  const tabMap: { [key: string]: number } = {
    'projects': 0,
    'experiences': 1,
    'educations': 2,
    'testimonials': 3,
    'blog': 4,
    'skills': 5,
    'settings': 6
  };

  const tabNames = ['projects', 'experiences', 'educations', 'testimonials', 'blog', 'skills', 'settings'];

  const tabs = [
    { label: 'Projects', icon: <Folder />, component: <ProjectsTab /> },
    { label: 'Experiences', icon: <Work />, component: <ExperiencesTab /> },
    { label: 'Educations', icon: <School />, component: <EducationsTab /> },
    { label: 'Testimonials', icon: <FormatQuote />, component: <TestimonialsTab /> },
    { label: 'Blog', icon: <Article />, component: <BlogTab /> },
    { label: 'Skills', icon: <Code />, component: <SkillsTab /> },
    { label: 'Settings', icon: <Settings />, component: <SettingsTab /> },
  ];

  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && tabMap[tabParam] !== undefined) {
      setActiveTab(tabMap[tabParam]);
    }
  }, [searchParams]);

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
    const tabName = tabNames[newValue];
    router.push(`/admin?tab=${tabName}`, { scroll: false });
  };

  const getIconColor = (index: number) => {
    return activeTab === index ? (isDark ? '#00ffff' : '#007bff') : (isDark ? '#a8b2d1' : '#666666');
  };

  return (
    <Box sx={{ 
      minHeight: '100vh', 
      backgroundColor: isDark ? '#0a192f' : '#f0f0f0', 
      p: { xs: 1, sm: 2, md: 3 }, 
      transition: 'background-color 0.3s ease' 
    }}>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Paper sx={{ 
          p: { xs: 2, md: 3 }, 
          borderRadius: 2, 
          backgroundColor: isDark ? '#0f172a80' : 'white', 
          backdropFilter: isDark ? 'blur(10px)' : 'none', 
          border: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
          boxShadow: isDark 
            ? '0 4px 16px rgba(0,0,0,0.3)' 
            : '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.3s ease'
        }}>
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3,
            gap: 2
          }}>
            <Box>
              <Typography 
                variant={isMobile ? "h5" : "h4"} 
                sx={{ 
                  fontWeight: 'bold', 
                  color: isDark ? '#ccd6f6' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}
              >
                <Dashboard sx={{ color: isDark ? '#00ffff' : '#007bff' }} />
                Portfolio Management
              </Typography>
            </Box>
          </Box>

          <Box sx={{ 
            borderBottom: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
            mb: 3
          }}>
            <Tabs 
              value={activeTab} 
              onChange={handleTabChange} 
              variant={isMobile ? 'scrollable' : 'fullWidth'} 
              scrollButtons={isMobile ? 'auto' : false}
              allowScrollButtonsMobile
              sx={{ 
                '& .MuiTab-root': { 
                  color: isDark ? '#a8b2d1' : '#666', 
                  fontWeight: 500,
                  fontSize: { xs: '0.75rem', sm: '0.875rem' },
                  minHeight: { xs: 48, sm: 56 },
                  textTransform: 'none',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    color: isDark ? '#00ffff' : '#007bff',
                    backgroundColor: isDark ? 'rgba(0, 255, 255, 0.05)' : 'rgba(0, 123, 255, 0.05)',
                  },
                  '&.Mui-selected': { 
                    color: isDark ? '#00ffff' : '#007bff',
                    fontWeight: 600
                  }
                }, 
                '& .MuiTabs-indicator': { 
                  backgroundColor: isDark ? '#00ffff' : '#007bff',
                  height: 3,
                  borderRadius: '3px 3px 0 0'
                },
                '& .MuiTabs-scrollButtons': {
                  color: isDark ? '#a8b2d1' : '#666666',
                  '&.Mui-disabled': {
                    opacity: 0.3
                  }
                }
              }}
            >
              {tabs.map((tab, i) => (
                <Tab 
                  key={i} 
                  label={
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 1,
                      flexDirection: { xs: 'column', sm: 'row' }
                    }}>
                      <Box sx={{ 
                        color: getIconColor(i),
                        display: 'flex',
                        alignItems: 'center',
                        '& svg': {
                          fontSize: { xs: '1rem', sm: '1.25rem' }
                        }
                      }}>
                        {tab.icon}
                      </Box>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontWeight: activeTab === i ? 600 : 400,
                          fontSize: { xs: '0.7rem', sm: '0.875rem' },
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {tab.label}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </Tabs>
          </Box>

          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Box sx={{ mt: 2 }}>
              {tabs[activeTab].component}
            </Box>
          </motion.div>

          <Box sx={{ 
            mt: 4,
            pt: 3,
            borderTop: isDark ? '1px solid #334155' : '1px solid #e5e7eb',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="caption" color={isDark ? '#94a3b8' : '#999999'}>
              Portfolio Management Dashboard v1.0
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 3,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <People sx={{ fontSize: 14, color: isDark ? '#00ffff' : '#007bff' }} />
                <Typography variant="caption" color={isDark ? '#94a3b8' : '#999999'}>
                  Manage all content in one place
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Star sx={{ fontSize: 14, color: isDark ? '#f59e0b' : '#f59e0b' }} />
                <Typography variant="caption" color={isDark ? '#94a3b8' : '#999999'}>
                  Keep your portfolio updated
                </Typography>
              </Box>
            </Box>
          </Box>
        </Paper>
      </motion.div>
    </Box>
  );
}