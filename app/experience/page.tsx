'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaBriefcase } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import portfolioApi from '@/lib/api/portfolio';
import styles from '../page.module.css';

interface Experience {
  _id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

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

export default function ExperiencePage() {
  const { isDarkMode } = useTheme();
  const [experiences, setExperiences] = useState<Experience[]>([]);
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
    const fetchExperiences = async () => {
      try {
        const response = await portfolioApi.getExperiences();
        const data = extractData(response);
        if (Array.isArray(data) && data.length > 0) {
          setExperiences(data);
        }
      } catch (error) {
        console.error('Failed to fetch experiences:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchExperiences();
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
                <FaBriefcase color={colors.primary} /> My Experience
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

            <div className={styles.timeline}>
              {experiences.length > 0 ? experiences.map((exp, index) => (
                <motion.div 
                  key={exp._id} 
                  className={`${styles.timelineItem} ${index % 2 === 0 ? styles.left : styles.right}`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                >
                  <motion.div 
                    className={styles.timelineContent} 
                    whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }}
                    style={{ 
                      backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)',
                      padding: '30px',
                      borderRadius: '15px',
                      borderLeft: `5px solid ${colors.primary}`,
                      color: colors.textPrimary
                    }}
                  >
                    <h3 style={{ 
                      fontSize: '1.5rem', 
                      color: colors.primary, 
                      marginBottom: '10px',
                      fontFamily: "'Poppins', sans-serif" 
                    }}>
                      {exp.role}
                    </h3>
                    <h4 style={{ 
                      fontSize: '1.2rem', 
                      color: colors.textPrimary, 
                      marginBottom: '10px', 
                      fontWeight: 600 
                    }}>
                      {exp.company}
                    </h4>
                    <span className={styles.date} style={{ 
                      display: 'inline-block', 
                      marginBottom: '15px', 
                      color: isDarkMode ? '#00f0ff' : '#2563eb',
                      fontWeight: 500,
                      backgroundColor: isDarkMode ? 'rgba(0, 240, 255, 0.1)' : 'rgba(37, 99, 235, 0.1)',
                      padding: '5px 15px',
                      borderRadius: '20px',
                      fontSize: '0.9rem'
                    }}>
                      {exp.period}
                    </span>
                    <p style={{ marginBottom: 0, lineHeight: 1.8, color: colors.textPrimary }}>
                      {exp.description}
                    </p>
                  </motion.div>
                </motion.div>
              )) : (
                <p style={{ textAlign: 'center', color: colors.textSecondary }}>No experience data available</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}