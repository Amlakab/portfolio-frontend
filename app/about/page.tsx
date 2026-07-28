'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaUser } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import portfolioApi from '@/lib/api/portfolio';
import styles from '../page.module.css';

interface SiteSettings {
  about: {
    title: string;
    description: string;
    image?: string;
    imageData?: any;
  };
}

const DEFAULT_SETTINGS = {
  about: {
    title: 'About Me',
    description: "I'm a passionate and self-motivated Software Developer with a strong foundation in both front-end and back-end technologies. I love creating beautiful, functional, and user-friendly applications that solve real-world problems.",
    image: '/images/about4.jpg'
  }
};

const getImageUrl = (item: any): string => {
  if (!item) return '/images/about4.jpg';
  
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
  
  return '/images/about4.jpg';
};

export default function AboutPage() {
  const { isDarkMode } = useTheme();
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
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
    const fetchSettings = async () => {
      try {
        const response = await portfolioApi.getSettings();
        if (response?.data?.data) {
          setSettings(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch settings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const aboutImage = settings?.about?.imageData 
    ? getImageUrl({ imageData: settings.about.imageData })
    : settings?.about?.image || '/images/about4.jpg';

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
      <section className={styles.section} style={{ padding: '120px 0 100px', backgroundColor: colors.bgPrimary, color: colors.textPrimary }}>
        <div className={styles.container}>
          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                <FaUser color={colors.primary} /> {settings?.about?.title || 'About Me'}
                <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} />
              </h2>
            </div>
            <div className={styles.aboutGrid} style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '60px', alignItems: 'center' }}>
              <div className={styles.aboutImageWrapper}>
                <motion.div whileHover={{ rotate: 2 }} transition={{ type: 'spring' }} className={styles.aboutImageContainer} style={{ position: 'relative', width: '100%', maxWidth: '300px', height: '400px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', margin: '0 auto', border: `2px solid ${colors.primary}` }}>
                  <img src={aboutImage} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { (e.target as HTMLImageElement).src = '/images/placeholder.jpg'; }} />
                </motion.div>
              </div>
              <div className={styles.aboutContent}>
                <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '8px', color: colors.textPrimary, fontFamily: "'Poppins', sans-serif" }}>Who is Amlakie?</h3>
                <h5 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.2rem)', marginBottom: '25px', color: colors.textPrimary, fontFamily: "'Poppins', sans-serif" }}>Software Developer</h5>
                <p style={{ marginBottom: '20px', lineHeight: 1.8, fontSize: '1.1rem', color: colors.textPrimary }}>{settings?.about?.description || "I'm a passionate and self-motivated Software Developer with a strong foundation in both front-end and back-end technologies."}</p>
              </div>
            </div>
            <style jsx>{`@media (max-width: 992px) { .aboutGrid { grid-template-columns: 1fr !important; gap: 40px !important; } }`}</style>
          </motion.div>
        </div>
      </section>
    </div>
  );
}