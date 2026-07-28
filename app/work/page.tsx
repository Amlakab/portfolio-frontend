'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink } from 'react-icons/fi';
import { FaLaptopCode } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import portfolioApi from '@/lib/api/portfolio';
import styles from '../page.module.css';

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
}

const getImageUrl = (item: any): string | null => {
  if (!item) return null;
  if (item.imageData) {
    let base64 = '';
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
    }
    if (base64) {
      return `data:${item.imageData.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }
  if (item.image) {
    if (item.image.startsWith('data:image')) return item.image;
    if (item.image.startsWith('/uploads/')) {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      return `${base}${item.image}`;
    }
    if (item.image.startsWith('/images/')) return item.image;
    return item.image;
  }
  return null;
};

const extractData = (response: any): any => {
  try {
    if (response?.data?.data?.data !== undefined) return response.data.data.data;
    if (response?.data?.data !== undefined) return response.data.data;
    if (response?.data !== undefined) return response.data;
    return response || [];
  } catch (error) {
    console.error('Error extracting data:', error);
    return [];
  }
};

export default function WorkPage() {
  const { isDarkMode } = useTheme();
  const [projects, setProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  const colors = isDarkMode
    ? {
        primary: '#00f0ff',
        secondary: '#6c63ff',
        bgPrimary: '#0a192f',
        bgSecondary: '#112240',
        textPrimary: '#e6f1ff',
        textSecondary: '#ccd6f6',
        shadow: 'rgba(2, 12, 27, 0.7)',
      }
    : {
        primary: '#2563eb',
        secondary: '#4f46e5',
        bgPrimary: '#f8fafc',
        bgSecondary: '#ffffff',
        textPrimary: '#1e293b',
        textSecondary: '#475569',
        shadow: 'rgba(100, 100, 111, 0.2)',
      };

  const filters = ['All', 'Web', 'Mobile', 'Design', 'Full Stack'];

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await portfolioApi.getProjects({ limit: 10 });
        const data = extractData(response);
        if (Array.isArray(data) && data.length > 0) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  const filteredProjects = filter === 'All' 
    ? projects 
    : projects.filter(p => p.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.primary }} />
          <p style={{ color: colors.textPrimary }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: colors.bgPrimary, minHeight: '100vh' }}>
      <Navbar />

      <section className={styles.section} style={{ 
        padding: '120px 0 100px', 
        backgroundColor: colors.bgPrimary, 
        color: colors.textPrimary 
      }}>
        <div className={styles.container}>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ 
                fontSize: 'clamp(2rem, 5vw, 2.8rem)', 
                fontWeight: 700, 
                color: colors.textPrimary,
                fontFamily: "'Poppins', sans-serif",
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '15px'
              }}>
                <FaLaptopCode color={colors.primary} /> My Work
                <motion.div style={{ 
                  position: 'absolute', 
                  bottom: '-15px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  width: '80px', 
                  height: '4px', 
                  background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, 
                  borderRadius: '2px' 
                }} />
              </h2>
            </div>

            <div className={styles.projectFilter} style={{
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: '15px',
              marginBottom: '50px'
            }}>
              {filters.map((f) => (
                <motion.button 
                  key={f} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setFilter(f)}
                  style={{ 
                    backgroundColor: filter === f ? colors.primary : 'transparent',
                    color: filter === f ? '#ffffff' : colors.textPrimary,
                    border: `1px solid ${colors.primary}`,
                    padding: '8px 20px',
                    borderRadius: '50px',
                    fontWeight: 500,
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s ease'
                  }}
                >
                  {f}
                </motion.button>
              ))}
            </div>

            <div className={styles.projectGrid} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
              gap: '30px'
            }}>
              {filteredProjects.length > 0 ? filteredProjects.map((project, index) => (
                <motion.div 
                  key={project._id} 
                  className={styles.projectCard}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -10, boxShadow: `0 15px 30px ${colors.shadow}` }}
                  style={{ 
                    cursor: 'pointer',
                    backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)',
                    borderRadius: '20px',
                    overflow: 'hidden',
                    boxShadow: `0 10px 30px ${colors.shadow}`,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div className={styles.projectImage} style={{ 
                    position: 'relative', 
                    height: '200px', 
                    overflow: 'hidden', 
                    flexShrink: 0 
                  }}>
                    <img 
                      src={getImageUrl(project) || '/images/placeholder.jpg'} 
                      alt={project.title} 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                      }}
                    />
                    <motion.div 
                      className={styles.projectOverlay}
                      whileHover={{ opacity: 1 }}
                      style={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        background: `linear-gradient(to top, ${colors.primary}ee, transparent)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        opacity: 0,
                        transition: 'opacity 0.5s ease-in-out'
                      }} 
                    >
                      {project.liveUrl && (
                        <motion.a 
                          href={project.liveUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          style={{ 
                            background: colors.primary,
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px 25px',
                            borderRadius: '50px',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '0.9rem',
                            textDecoration: 'none'
                          }}
                        >
                          <FiExternalLink style={{ marginRight: '8px' }} /> View Project
                        </motion.a>
                      )}
                    </motion.div>
                  </div>

                  <div className={styles.projectInfo} style={{ padding: '20px', flex: 1 }}>
                    <h3 style={{ 
                      fontSize: '1.4rem', 
                      marginBottom: '10px', 
                      color: colors.textPrimary,
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      {project.title}
                    </h3>
                    <p style={{ 
                      marginBottom: '15px', 
                      color: colors.textPrimary, 
                      fontSize: '0.95rem', 
                      lineHeight: 1.5 
                    }}>
                      {project.description}
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div className={styles.projectTags} style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        {project.tags.map((tag, i) => (
                          <span 
                            key={i} 
                            style={{ 
                              backgroundColor: colors.primary + '20',
                              color: colors.primary,
                              padding: '5px 10px',
                              borderRadius: '50px',
                              fontSize: '0.75rem',
                              fontWeight: 500
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                      {project.github && (
                        <a 
                          href={project.github} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: colors.textPrimary, fontSize: '1.5rem', marginLeft: '15px' }}
                        >
                          <FiGithub />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )) : (
                <p style={{ textAlign: 'center', color: colors.textSecondary, width: '100%', padding: '40px 0' }}>
                  No projects found
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}