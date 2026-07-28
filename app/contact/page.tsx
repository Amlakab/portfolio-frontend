'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiMapPin, FiPhone } from 'react-icons/fi';
import { FaHeadset, FaMapMarker, FaPhone, FaMapMarkedAlt } from 'react-icons/fa';
import { IoMdMail } from 'react-icons/io';
import { useTheme } from '../context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import portfolioApi from '@/lib/api/portfolio';
import styles from '../page.module.css';

interface SiteSettings {
  contact: {
    email: string;
    phone: string;
    location: string;
    socialLinks: { platform: string; url: string; icon: string }[];
  };
}

const DEFAULT_SETTINGS = {
  contact: {
    email: 'amlakieab4@gmail.com',
    phone: '+251 9 12 43 65 73',
    location: 'Addis Ababa, Ethiopia',
    socialLinks: []
  }
};

export default function ContactPage() {
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
                <FaHeadset color={colors.primary} /> Get In Touch
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

            <div className={styles.contactInfoGrid} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '30px',
              marginBottom: '60px'
            }}>
              {[
                { icon: <FaMapMarker />, title: 'Location', detail: settings?.contact?.location || 'Addis Ababa, Ethiopia' },
                { icon: <FaPhone />, title: 'Phone', detail: settings?.contact?.phone || '+251 9 12 43 65 73' },
                { icon: <FiMail />, title: 'Email', detail: settings?.contact?.email || 'amlakieab4@gmail.com' },
              ].map((item, idx) => (
                <div key={idx} className={styles.contactInfoItem}>
                  <motion.div 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 1, delay: idx * 0.2 }}
                    style={{ textAlign: 'center' }}
                  >
                    <span style={{ fontSize: '30px', color: colors.primary }}>{item.icon}</span>
                    <h3 style={{ 
                      color: colors.primary, 
                      fontFamily: "'Poppins', sans-serif", 
                      margin: '15px 0' 
                    }}>
                      {item.title}
                    </h3>
                    <p style={{ color: colors.textPrimary }}>{item.detail}</p>
                  </motion.div>
                </div>
              ))}
            </div>

            <div className={styles.contactFormGrid} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px'
            }}>
              <div className={styles.contactMap}>
                <motion.div 
                  initial={{ x: -100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.869244319124!2d38.76321431536945!3d9.012326893541918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f1a4b1f3b5%3A0x1c5b5b5b5b5b5b5b!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1633080000000!5m2!1sen!2set" 
                    width="100%" 
                    height="400" 
                    style={{ border: 0, borderRadius: '10px' }} 
                    allowFullScreen 
                    loading="lazy" 
                  />
                </motion.div>
              </div>

              <div className={styles.contactForm}>
                <motion.div 
                  initial={{ x: 100, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 1 }}
                >
                  <div className={styles.contactFormInner} style={{ 
                    backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)',
                    padding: '40px',
                    borderRadius: '20px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)'
                  }}>
                    <h3 style={{ 
                      color: colors.primary, 
                      fontSize: '2rem', 
                      marginBottom: '25px',
                      fontFamily: "'Poppins', sans-serif"
                    }}>
                      Send Me a Message
                    </h3>
                    <form>
                      <div className={styles.formRow} style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px'
                      }}>
                        <div className={styles.formGroup} style={{ marginBottom: '25px' }}>
                          <input 
                            type="text" 
                            placeholder="Your Name" 
                            required 
                            style={{ 
                              width: '100%', 
                              padding: '15px 20px', 
                              border: `1px solid ${colors.primary}`,
                              borderRadius: '10px',
                              fontFamily: 'inherit',
                              fontSize: '1rem',
                              backgroundColor: 'transparent',
                              color: colors.textPrimary
                            }} 
                          />
                        </div>
                        <div className={styles.formGroup} style={{ marginBottom: '25px' }}>
                          <input 
                            type="email" 
                            placeholder="Your Email" 
                            required 
                            style={{ 
                              width: '100%', 
                              padding: '15px 20px', 
                              border: `1px solid ${colors.primary}`,
                              borderRadius: '10px',
                              fontFamily: 'inherit',
                              fontSize: '1rem',
                              backgroundColor: 'transparent',
                              color: colors.textPrimary
                            }} 
                          />
                        </div>
                      </div>
                      <div className={styles.formGroup} style={{ marginBottom: '25px' }}>
                        <input 
                          type="text" 
                          placeholder="Subject" 
                          required 
                          style={{ 
                            width: '100%', 
                            padding: '15px 20px', 
                            border: `1px solid ${colors.primary}`,
                            borderRadius: '10px',
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            backgroundColor: 'transparent',
                            color: colors.textPrimary
                          }} 
                        />
                      </div>
                      <div className={styles.formGroup} style={{ marginBottom: '25px' }}>
                        <textarea 
                          placeholder="Your Message" 
                          rows={5} 
                          required 
                          style={{ 
                            width: '100%', 
                            padding: '15px 20px', 
                            border: `1px solid ${colors.primary}`,
                            borderRadius: '10px',
                            fontFamily: 'inherit',
                            fontSize: '1rem',
                            resize: 'none',
                            backgroundColor: 'transparent',
                            color: colors.textPrimary
                          }} 
                        />
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05, boxShadow: `0 5px 15px ${colors.primary}40` }}
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        style={{ 
                          background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                          color: '#ffffff',
                          border: 'none',
                          padding: '15px 30px',
                          borderRadius: '50px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          fontSize: '1rem',
                          boxShadow: `0 5px 15px ${colors.primary}30`,
                          width: '100%',
                          justifyContent: 'center'
                        }}
                      >
                        Send Message
                      </motion.button>
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>

            <style jsx>{`
              @media (max-width: 992px) {
                .contactInfoGrid {
                  grid-template-columns: 1fr 1fr !important;
                }
                .contactFormGrid {
                  grid-template-columns: 1fr !important;
                  gap: 30px !important;
                }
                .formRow {
                  grid-template-columns: 1fr !important;
                }
              }
              @media (max-width: 768px) {
                .contactInfoGrid {
                  grid-template-columns: 1fr !important;
                }
              }
              @media (max-width: 576px) {
                .contactFormInner {
                  padding: 25px !important;
                }
              }
            `}</style>
          </motion.div>
        </div>
      </section>
    </div>
  );
}