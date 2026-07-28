'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaTools, FaReact, FaServer, FaNodeJs, FaPython, FaJava, FaHtml5, FaCss3Alt, FaJs } from 'react-icons/fa';
import { SiTypescript, SiMongodb, SiPostgresql, SiPhp, SiMysql, SiSpringboot, SiBootstrap, SiTailwindcss, SiNextdotjs } from 'react-icons/si';
import { useTheme } from '../context/ThemeContext';
import Navbar from '@/components/ui/Navbar';
import portfolioApi from '@/lib/api/portfolio';
import styles from '../page.module.css';

interface Skill {
  _id: string;
  name: string;
  value: number;
  icon: string;
  category: string;
}

const DEFAULT_SKILLS: Skill[] = [
  { _id: '1', name: 'React', value: 90, icon: 'FaReact', category: 'frontend' },
  { _id: '2', name: 'TypeScript', value: 85, icon: 'SiTypescript', category: 'frontend' },
  { _id: '3', name: 'Tailwind CSS', value: 80, icon: 'SiTailwindcss', category: 'frontend' },
  { _id: '4', name: 'Node.js', value: 80, icon: 'FaNodeJs', category: 'backend' },
  { _id: '5', name: 'MongoDB', value: 75, icon: 'SiMongodb', category: 'backend' },
  { _id: '6', name: 'PostgreSQL', value: 70, icon: 'SiPostgresql', category: 'backend' }
];

const getIconComponent = (iconName: string): JSX.Element => {
  const icons: Record<string, JSX.Element> = {
    FaHtml5: <FaHtml5 />,
    FaCss3Alt: <FaCss3Alt />,
    FaJs: <FaJs />,
    FaReact: <FaReact />,
    SiNextdotjs: <SiNextdotjs />,
    SiTailwindcss: <SiTailwindcss />,
    SiBootstrap: <SiBootstrap />,
    SiTypescript: <SiTypescript />,
    SiPhp: <SiPhp />,
    SiMysql: <SiMysql />,
    SiSpringboot: <SiSpringboot />,
    FaJava: <FaJava />,
    FaNodeJs: <FaNodeJs />,
    SiMongodb: <SiMongodb />,
    SiPostgresql: <SiPostgresql />,
    FaPython: <FaPython />,
  };
  return icons[iconName] || <FaJs />;
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

export default function SkillsPage() {
  const { isDarkMode } = useTheme();
  const [frontendSkills, setFrontendSkills] = useState<Skill[]>(DEFAULT_SKILLS.filter(s => s.category === 'frontend'));
  const [backendSkills, setBackendSkills] = useState<Skill[]>(DEFAULT_SKILLS.filter(s => s.category === 'backend'));
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
    const fetchSkills = async () => {
      try {
        const response = await portfolioApi.getSkills();
        const data = extractData(response);
        if (Array.isArray(data) && data.length > 0) {
          const frontend = data.filter((s: Skill) => s.category === 'frontend');
          const backend = data.filter((s: Skill) => s.category === 'backend');
          if (frontend.length > 0) setFrontendSkills(frontend);
          if (backend.length > 0) setBackendSkills(backend);
        }
      } catch (error) {
        console.error('Failed to fetch skills:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSkills();
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
                <FaTools color={colors.primary} /> My Skills
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

            <div className={styles.skillsDescription}>
              <p style={{ 
                textAlign: 'center', 
                marginBottom: '30px', 
                lineHeight: 1.8, 
                fontSize: '1.1rem', 
                color: colors.textPrimary 
              }}>
                I've mastered a variety of technologies in the web development world, from backend systems to interactive frontend experiences.
              </p>
            </div>

            <div className={styles.skillsGrid} style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '40px'
            }}>
              <div className={styles.skillsColumn}>
                <motion.div 
                  whileHover={{ y: -10, boxShadow: `0 20px 40px ${colors.primary}20` }}
                  style={{ 
                    padding: '30px', 
                    backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.7)' : 'rgba(248, 249, 250, 0.7)',
                    borderRadius: '20px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `2px solid transparent`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '25px', 
                    color: colors.primary,
                    fontFamily: "'Poppins', sans-serif",
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <FaReact /> Frontend Skills
                  </h3>
                  {frontendSkills.map((skill, index) => (
                    <motion.div 
                      key={skill._id} 
                      className={styles.progressItem} 
                      style={{ marginBottom: '25px' }}
                      whileHover={{ x: 10 }}
                    >
                      <div className={styles.progressHeader} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '12px' 
                      }}>
                        <span className={styles.skillIcon} style={{ 
                          fontSize: '1.5rem', 
                          marginRight: '15px', 
                          color: colors.primary 
                        }}>
                          {getIconComponent(skill.icon)}
                        </span>
                        <span className={styles.skillName} style={{ 
                          fontWeight: 600, 
                          flexGrow: 1, 
                          fontSize: '1.1rem', 
                          color: colors.textPrimary 
                        }}>
                          {skill.name}
                        </span>
                        <span className={styles.skillPercent} style={{ 
                          fontWeight: 700, 
                          color: colors.primary, 
                          fontSize: '1.1rem' 
                        }}>
                          {skill.value}%
                        </span>
                      </div>
                      <div className={styles.progressBar} style={{ 
                        width: '100%', 
                        height: '10px', 
                        backgroundColor: isDarkMode ? '#112240' : '#e9ecef', 
                        borderRadius: '5px', 
                        overflow: 'hidden' 
                      }}>
                        <motion.div 
                          className={styles.progressFill} 
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.value}%` }}
                          transition={{ duration: 1.5, delay: index * 0.1 + 0.3 }}
                          style={{ 
                            height: '100%', 
                            background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, 
                            borderRadius: '5px',
                            boxShadow: `0 2px 10px ${colors.primary}30`
                          }} 
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>

              <div className={styles.skillsColumn}>
                <motion.div 
                  whileHover={{ y: -10, boxShadow: `0 20px 40px ${colors.secondary}20` }}
                  style={{ 
                    padding: '30px', 
                    backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.7)' : 'rgba(248, 249, 250, 0.7)',
                    borderRadius: '20px',
                    boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)',
                    backdropFilter: 'blur(10px)',
                    border: `2px solid transparent`,
                    transition: 'all 0.3s ease'
                  }}
                >
                  <h3 style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '25px', 
                    color: colors.secondary,
                    fontFamily: "'Poppins', sans-serif",
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px'
                  }}>
                    <FaServer /> Backend Skills
                  </h3>
                  {backendSkills.map((skill, index) => (
                    <motion.div 
                      key={skill._id} 
                      className={styles.progressItem} 
                      style={{ marginBottom: '25px' }}
                      whileHover={{ x: 10 }}
                    >
                      <div className={styles.progressHeader} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        marginBottom: '12px' 
                      }}>
                        <span className={styles.skillIcon} style={{ 
                          fontSize: '1.5rem', 
                          marginRight: '15px', 
                          color: colors.secondary 
                        }}>
                          {getIconComponent(skill.icon)}
                        </span>
                        <span className={styles.skillName} style={{ 
                          fontWeight: 600, 
                          flexGrow: 1, 
                          fontSize: '1.1rem', 
                          color: colors.textPrimary 
                        }}>
                          {skill.name}
                        </span>
                        <span className={styles.skillPercent} style={{ 
                          fontWeight: 700, 
                          color: colors.secondary, 
                          fontSize: '1.1rem' 
                        }}>
                          {skill.value}%
                        </span>
                      </div>
                      <div className={styles.progressBar} style={{ 
                        width: '100%', 
                        height: '10px', 
                        backgroundColor: isDarkMode ? '#112240' : '#e9ecef', 
                        borderRadius: '5px', 
                        overflow: 'hidden' 
                      }}>
                        <motion.div 
                          className={styles.progressFill} 
                          initial={{ width: 0 }}
                          animate={{ width: `${skill.value}%` }}
                          transition={{ duration: 1.5, delay: index * 0.1 + 0.3 }}
                          style={{ 
                            height: '100%', 
                            background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`, 
                            borderRadius: '5px',
                            boxShadow: `0 2px 10px ${colors.secondary}30`
                          }} 
                        />
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>

            <style jsx>{`
              @media (max-width: 992px) {
                .skillsGrid {
                  grid-template-columns: 1fr !important;
                  gap: 30px !important;
                }
              }
            `}</style>
          </motion.div>
        </div>
      </section>
    </div>
  );
}