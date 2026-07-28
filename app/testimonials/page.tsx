'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdRecordVoiceOver } from 'react-icons/md';
import { useTheme } from '../context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import portfolioApi from '@/lib/api/portfolio';
import styles from '../page.module.css';

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  avatarData?: any;
  rating: number;
}

const getImageUrl = (item: any): string | null => {
  if (!item) return null;
  if (item.avatarData) {
    let base64 = '';
    if (typeof item.avatarData.data === 'string') {
      base64 = item.avatarData.data;
    } else if (item.avatarData.data?.$binary?.base64) {
      base64 = item.avatarData.data.$binary.base64;
    } else if (item.avatarData.data?.data) {
      try {
        if (typeof item.avatarData.data.data === 'string') {
          base64 = item.avatarData.data.data;
        } else if (item.avatarData.data.data instanceof Buffer || Array.isArray(item.avatarData.data.data)) {
          base64 = Buffer.from(item.avatarData.data.data).toString('base64');
        }
      } catch (e) {
        console.warn('Failed to convert avatarData:', e);
      }
    } else if (item.avatarData.data instanceof Buffer) {
      base64 = item.avatarData.data.toString('base64');
    }
    if (base64) {
      return `data:${item.avatarData.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }
  if (item.avatar) {
    if (item.avatar.startsWith('data:image')) return item.avatar;
    if (item.avatar.startsWith('/uploads/')) {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      return `${base}${item.avatar}`;
    }
    if (item.avatar.startsWith('/images/')) return item.avatar;
    return item.avatar;
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

export default function TestimonialsPage() {
  const { isDarkMode } = useTheme();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
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
    const fetchTestimonials = async () => {
      try {
        const response = await portfolioApi.getTestimonials({ limit: 20 });
        const data = extractData(response);
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      } catch (error) {
        console.error('Failed to fetch testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTestimonials();
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
                <MdRecordVoiceOver color={colors.primary} /> Client Testimonials
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

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))',
              gap: '30px'
            }}>
              {testimonials.length > 0 ? testimonials.map((testimonial) => (
                <motion.div 
                  key={testimonial._id} 
                  className={styles.testimonialCard}
                  whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)' }}
                  style={{ 
                    backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div className={styles.testimonialHeader} style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    marginBottom: '25px' 
                  }}>
                    <div className={styles.testimonialAvatar} style={{ 
                      width: '80px', 
                      height: '80px', 
                      borderRadius: '50%', 
                      overflow: 'hidden', 
                      marginRight: '25px',
                      border: `3px solid ${colors.primary}`,
                      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)',
                      position: 'relative'
                    }}>
                      <img 
                        src={getImageUrl(testimonial) || '/images/placeholder.jpg'} 
                        alt={testimonial.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/placeholder.jpg';
                        }}
                      />
                    </div>
                    <div className={styles.testimonialAuthor}>
                      <h4 style={{ 
                        fontSize: '1.4rem', 
                        marginBottom: '5px', 
                        color: colors.textPrimary,
                        fontFamily: "'Poppins', sans-serif"
                      }}>
                        {testimonial.name}
                      </h4>
                      <p style={{ 
                        fontSize: '1rem', 
                        color: colors.textPrimary, 
                        marginBottom: '10px', 
                        opacity: 0.8 
                      }}>
                        {testimonial.role}
                      </p>
                      <div className={styles.testimonialRating} style={{ 
                        color: '#ffc107', 
                        fontSize: '1.1rem' 
                      }}>
                        {[...Array(testimonial.rating)].map((_, i) => <span key={i}>★</span>)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.testimonialContent}>
                    <p style={{ 
                      fontStyle: 'italic', 
                      lineHeight: 1.8, 
                      position: 'relative', 
                      paddingLeft: '30px', 
                      fontSize: '1.1rem', 
                      color: colors.textPrimary 
                    }}>
                      <span style={{ 
                        position: 'absolute', 
                        left: 0, 
                        top: 0, 
                        fontSize: '3rem', 
                        lineHeight: 1, 
                        color: colors.primary, 
                        opacity: 0.2 
                      }}>
                        "
                      </span>
                      {testimonial.content}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <p style={{ textAlign: 'center', color: colors.textSecondary, width: '100%', padding: '40px 0' }}>
                  No testimonials available
                </p>
              )}
            </div>

            <style jsx>{`
              @media (max-width: 768px) {
                .testimonialGrid {
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