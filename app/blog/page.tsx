'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiExternalLink } from 'react-icons/fi';
import { RiArticleLine } from 'react-icons/ri';
import { useTheme } from '../context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import portfolioApi from '@/lib/api/portfolio';
import styles from '../page.module.css';

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  imageData?: any;
  category: string;
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

export default function BlogPage() {
  const { isDarkMode } = useTheme();
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  const colors = isDarkMode
    ? {
        primary: '#00f0ff',
        secondary: '#6c63ff',
        bgPrimary: '#0a192f',
        bgSecondary: '#112240',
        textPrimary: '#e6f1ff',
        textSecondary: '#ccd6f6',
      }
    : {
        primary: '#2563eb',
        secondary: '#4f46e5',
        bgPrimary: '#f8fafc',
        bgSecondary: '#ffffff',
        textPrimary: '#1e293b',
        textSecondary: '#475569',
      };

  useEffect(() => {
    const fetchBlogPosts = async () => {
      try {
        const response = await portfolioApi.getBlogPosts({ published: true, limit: 20 });
        const data = extractData(response);
        if (Array.isArray(data) && data.length > 0) {
          setBlogPosts(data);
        }
      } catch (error) {
        console.error('Failed to fetch blog posts:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBlogPosts();
  }, []);

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
                <RiArticleLine color={colors.primary} /> Latest Articles
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

            <div className={styles.blogGrid} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '30px'
            }}>
              {blogPosts.length > 0 ? blogPosts.map((post) => (
                <div key={post._id} className={styles.blogCard}>
                  <motion.div 
                    className={styles.blogCardInner}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    whileHover={{ y: -10, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)' }}
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)',
                      borderRadius: '20px',
                      overflow: 'hidden',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                      marginBottom: '30px',
                      height: '100%'
                    }}
                  >
                    <div className={styles.blogImage} style={{ 
                      position: 'relative', 
                      height: '250px', 
                      overflow: 'hidden' 
                    }}>
                      <img 
                        src={getImageUrl(post) || '/images/placeholder.jpg'} 
                        alt={post.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                      <div className={styles.blogCategory} style={{ 
                        position: 'absolute', 
                        top: '20px', 
                        right: '20px',
                        background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                        color: '#ffffff',
                        padding: '6px 18px',
                        borderRadius: '20px',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)'
                      }}>
                        {post.category}
                      </div>
                    </div>
                    <div className={styles.blogContent} style={{ padding: '30px' }}>
                      <h3 style={{ 
                        fontSize: '1.5rem', 
                        marginBottom: '15px', 
                        color: colors.textPrimary,
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        {post.title}
                      </h3>
                      <p className={styles.blogDate} style={{ 
                        fontSize: '0.95rem', 
                        color: colors.textPrimary, 
                        marginBottom: '20px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        opacity: 0.8 
                      }}>
                        <span style={{ 
                          display: 'inline-block', 
                          width: '15px', 
                          height: '2px', 
                          backgroundColor: colors.primary, 
                          marginRight: '10px' 
                        }}></span>
                        {post.date}
                      </p>
                      <p className={styles.blogExcerpt} style={{ 
                        marginBottom: '25px', 
                        lineHeight: 1.8, 
                        color: colors.textPrimary 
                      }}>
                        {post.excerpt}
                      </p>
                      <motion.button 
                        whileHover={{ scale: 1.05 }} 
                        whileTap={{ scale: 0.95 }} 
                        className={styles.btnReadMore}
                        style={{ 
                          backgroundColor: 'transparent',
                          color: colors.primary,
                          border: 'none',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          padding: 0,
                          fontSize: '1rem'
                        }}
                      >
                        Read More <FiExternalLink style={{ marginLeft: '8px' }} />
                      </motion.button>
                    </div>
                  </motion.div>
                </div>
              )) : (
                <p style={{ textAlign: 'center', color: colors.textSecondary, width: '100%', padding: '40px 0' }}>
                  No blog posts available
                </p>
              )}
            </div>

            <style jsx>{`
              @media (max-width: 768px) {
                .blogGrid {
                  grid-template-columns: 1fr !important;
                }
              }
            `}</style>
          </motion.div>
        </div>
      </section>
    </div>
  );
}