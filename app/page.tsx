'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
import {
  FiGithub, FiLinkedin, FiMail, FiDownload, FiExternalLink, FiArrowUp,
} from 'react-icons/fi';
import {
  FaReact, FaNodeJs, FaPython, FaJava, FaPhone, FaMapMarker, FaSun, FaMoon,
  FaServer, FaMapMarkedAlt, FaChevronCircleRight, FaCss3Alt, FaHtml5, FaJs,
  FaGraduationCap, FaUser, FaTools, FaBriefcase, FaHeadset, FaLaptopCode,
} from 'react-icons/fa';
import {
  SiTypescript, SiMongodb, SiPostgresql, SiPhp, SiMysql,
  SiSpringboot, SiBootstrap, SiTailwindcss, SiNextdotjs,
} from 'react-icons/si';
import { BsTelegram, BsTwitter } from 'react-icons/bs';
import { IoMdMail } from 'react-icons/io';
import { AiFillGithub, AiFillLinkedin } from 'react-icons/ai';
import { RiArticleLine } from 'react-icons/ri';
import { MdRecordVoiceOver } from 'react-icons/md';
import portfolioApi from '@/lib/api/portfolio';
import styles from './page.module.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';

// ===== Types =====
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

interface Experience {
  _id: string;
  role: string;
  company: string;
  period: string;
  description: string;
}

interface Education {
  _id: string;
  degree: string;
  institution: string;
  year: string;
  description: string;
}

interface Testimonial {
  _id: string;
  name: string;
  role: string;
  content: string;
  avatar?: string;
  avatarData?: any;
  rating: number;
}

interface BlogPost {
  _id: string;
  title: string;
  excerpt: string;
  date: string;
  image?: string;
  imageData?: any;
  category: string;
}

interface Skill {
  _id: string;
  name: string;
  value: number;
  icon: string;
  category: string;
}

interface SiteSettings {
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
}

// ===== DEFAULT FALLBACK DATA =====
const DEFAULT_SETTINGS: SiteSettings = {
  hero: {
    title: 'Amlakie Abebaw',
    subtitle: 'Software Developer',
    description: 'I build exceptional digital experiences with modern web technologies.',
    profileImages: ['/images/profile1.jpg', '/images/profile2.jpg', '/images/profile3.jpg'],
    resumeUrl: '/documents/Amlakie_Abebaw_Resume.pdf'
  },
  about: {
    title: 'About Me',
    description: "I'm a passionate and self-motivated Software Developer with a strong foundation in both front-end and back-end technologies. I love creating beautiful, functional, and user-friendly applications that solve real-world problems.",
    image: '/images/about4.jpg'
  },
  contact: {
    email: 'amlakieab23@gmail.com',
    phone: '+251 9 12 43 65 73',
    location: 'Addis Ababa, Ethiopia',
    socialLinks: [
      { platform: 'GitHub', url: 'https://github.com/Amlakab', icon: 'AiFillGithub' },
      { platform: 'LinkedIn', url: 'https://www.linkedin.com/in/amlakie-abebaw-b6a308329/', icon: 'AiFillLinkedin' },
      { platform: 'Email', url: 'mailto:amlakieab4@gmail.com', icon: 'IoMdMail' }
    ]
  },
  stats: {
    projectsCompleted: 25,
    happyClients: 15,
    linesOfCode: 50000,
    yearsExperience: 3
  }
};

const DEFAULT_SKILLS: Skill[] = [
  { _id: '1', name: 'React', value: 90, icon: 'FaReact', category: 'frontend' },
  { _id: '2', name: 'TypeScript', value: 85, icon: 'SiTypescript', category: 'frontend' },
  { _id: '3', name: 'Tailwind CSS', value: 80, icon: 'SiTailwindcss', category: 'frontend' },
  { _id: '4', name: 'Node.js', value: 80, icon: 'FaNodeJs', category: 'backend' },
  { _id: '5', name: 'MongoDB', value: 75, icon: 'SiMongodb', category: 'backend' },
  { _id: '6', name: 'PostgreSQL', value: 70, icon: 'SiPostgresql', category: 'backend' }
];

// ===== Helper: get image URL - Works like admin panel =====
const getImageUrl = (item: any): string | null => {
  if (!item) return null;
  
  // For Projects - check imageData
  if (item.imageData?.data) {
    let base64 = '';
    if (typeof item.imageData.data === 'string') {
      base64 = item.imageData.data;
    } else if (item.imageData.data?.$binary?.base64) {
      base64 = item.imageData.data.$binary.base64;
    } else if (item.imageData.data?.data) {
      try {
        base64 = Buffer.from(item.imageData.data.data).toString('base64');
      } catch (e) {
        console.warn('Failed to convert imageData:', e);
      }
    }
    if (base64) {
      return `data:${item.imageData.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }
  
  // For Testimonials - check avatarData
  if (item.avatarData?.data) {
    let base64 = '';
    if (typeof item.avatarData.data === 'string') {
      base64 = item.avatarData.data;
    } else if (item.avatarData.data?.$binary?.base64) {
      base64 = item.avatarData.data.$binary.base64;
    } else if (item.avatarData.data?.data) {
      try {
        base64 = Buffer.from(item.avatarData.data.data).toString('base64');
      } catch (e) {
        console.warn('Failed to convert avatarData:', e);
      }
    }
    if (base64) {
      return `data:${item.avatarData.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }
  
  // For About image - check imageData
  if (item.imageData?.data) {
    let base64 = '';
    if (typeof item.imageData.data === 'string') {
      base64 = item.imageData.data;
    } else if (item.imageData.data?.$binary?.base64) {
      base64 = item.imageData.data.$binary.base64;
    } else if (item.imageData.data?.data) {
      try {
        base64 = Buffer.from(item.imageData.data.data).toString('base64');
      } catch (e) {
        console.warn('Failed to convert imageData:', e);
      }
    }
    if (base64) {
      return `data:${item.imageData.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }
  
  // Fallback: if image/avatar is a data URL string
  if (item.image?.startsWith('data:image')) {
    return item.image;
  }
  if (item.avatar?.startsWith('data:image')) {
    return item.avatar;
  }
  
  // Fallback: return the image/avatar string path or null
  return item.image || item.avatar || null;
};

// ===== Helper: get profile image URL =====
const getProfileImageUrl = (profileImage: string | any): string => {
  if (!profileImage) return '/images/placeholder.jpg';
  
  // If it's a string
  if (typeof profileImage === 'string') {
    if (profileImage.startsWith('data:')) return profileImage;
    if (profileImage.startsWith('http')) return profileImage;
    if (profileImage.startsWith('/uploads/') || profileImage.startsWith('/images/')) {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      return `${base}${profileImage}`;
    }
    return profileImage;
  }
  
  // If it's an object with data (profileImagesData from backend)
  if (profileImage?.data) {
    let base64 = '';
    if (typeof profileImage.data === 'string') {
      base64 = profileImage.data;
    } else if (profileImage.data?.$binary?.base64) {
      base64 = profileImage.data.$binary.base64;
    } else if (profileImage.data?.data) {
      try {
        base64 = Buffer.from(profileImage.data.data).toString('base64');
      } catch (e) {
        console.warn('Failed to convert profile image:', e);
      }
    }
    if (base64) {
      return `data:${profileImage.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }
  
  return '/images/placeholder.jpg';
};

// ===== Helper: get icon component =====
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

// ===== Helper: get social icon =====
const getSocialIcon = (iconName: string): JSX.Element => {
  const icons: Record<string, JSX.Element> = {
    AiFillLinkedin: <AiFillLinkedin size={20} />,
    AiFillGithub: <AiFillGithub size={20} />,
    IoMdMail: <IoMdMail size={20} />,
    BsTwitter: <BsTwitter size={20} />,
    BsTelegram: <BsTelegram size={20} />,
  };
  return icons[iconName] || <FiExternalLink size={20} />;
};

// ===== Extract data helper =====
const extractData = (response: any): any => {
  try {
    if (response?.data?.data?.data !== undefined) {
      return response.data.data.data;
    }
    if (response?.data?.data !== undefined) {
      return response.data.data;
    }
    if (response?.data !== undefined) {
      return response.data;
    }
    return response || [];
  } catch (error) {
    console.error('Error extracting data:', error);
    return [];
  }
};

// ===== Main Component =====
const Portfolio = () => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [activeSection, setActiveSection] = useState('home');
  const [nameIndex, setNameIndex] = useState(0);
  const [profileIndex, setProfileIndex] = useState(0);
  const controls = useAnimation();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [educations, setEducations] = useState<Education[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [frontendSkills, setFrontendSkills] = useState<Skill[]>(DEFAULT_SKILLS.filter(s => s.category === 'frontend'));
  const [backendSkills, setBackendSkills] = useState<Skill[]>(DEFAULT_SKILLS.filter(s => s.category === 'backend'));
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  // ===== FETCH DATA WITH PROPER ERROR HANDLING =====
  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        
        const results = await Promise.allSettled([
          portfolioApi.getProjects({ featured: true, limit: 3 }),
          portfolioApi.getExperiences(),
          portfolioApi.getEducations(),
          portfolioApi.getTestimonials({ featured: true }),
          portfolioApi.getBlogPosts({ published: true, limit: 2 }),
          portfolioApi.getSkills(),
          portfolioApi.getSettings(),
        ]);

        if (results[0].status === 'fulfilled') {
          const data = extractData(results[0].value);
          if (Array.isArray(data) && data.length > 0) setProjects(data);
        }

        if (results[1].status === 'fulfilled') {
          const data = extractData(results[1].value);
          if (Array.isArray(data) && data.length > 0) setExperiences(data);
        }

        if (results[2].status === 'fulfilled') {
          const data = extractData(results[2].value);
          if (Array.isArray(data) && data.length > 0) setEducations(data);
        }

        if (results[3].status === 'fulfilled') {
          const data = extractData(results[3].value);
          if (Array.isArray(data) && data.length > 0) setTestimonials(data);
        }

        if (results[4].status === 'fulfilled') {
          const data = extractData(results[4].value);
          if (Array.isArray(data) && data.length > 0) setBlogPosts(data);
        }

        if (results[5].status === 'fulfilled') {
          const data = extractData(results[5].value);
          if (Array.isArray(data) && data.length > 0) {
            const skills = data;
            const frontend = skills.filter((s: Skill) => s.category === 'frontend');
            const backend = skills.filter((s: Skill) => s.category === 'backend');
            if (frontend.length > 0) setFrontendSkills(frontend);
            if (backend.length > 0) setBackendSkills(backend);
          }
        }

        if (results[6].status === 'fulfilled') {
          const data = extractData(results[6].value);
          if (data && typeof data === 'object' && Object.keys(data).length > 0) {
            setSettings(data);
          }
        }

      } catch (error) {
        console.error('Failed to fetch portfolio data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // ===== Colors =====
  const colors = isDarkMode
    ? {
        primary: '#00f0ff',
        secondary: '#6c63ff',
        accent: '#ff2d75',
        bgPrimary: '#0a192f',
        bgSecondary: '#112240',
        textPrimary: '#e6f1ff',
        textSecondary: '#ccd6f6',
        border: 'rgba(100, 255, 255, 0.1)',
        shadow: 'rgba(2, 12, 27, 0.7)',
      }
    : {
        primary: '#2563eb',
        secondary: '#4f46e5',
        accent: '#f59e0b',
        bgPrimary: '#f8fafc',
        bgSecondary: '#ffffff',
        textPrimary: '#1e293b',
        textSecondary: '#475569',
        border: 'rgba(30, 41, 59, 0.1)',
        shadow: 'rgba(100, 100, 111, 0.2)',
      };

  const getSectionBackground = (index: number) =>
    index % 2 === 0 ? colors.bgPrimary : colors.bgSecondary;

  const fadeInUp = { hidden: { opacity: 0, y: 50 }, visible: { opacity: 1, y: 0 } };
  const fadeInLeft = { hidden: { opacity: 0, x: -50 }, visible: { opacity: 1, x: 0 } };
  const fadeInRight = { hidden: { opacity: 0, x: 50 }, visible: { opacity: 1, x: 0 } };

  const sections = ['home', 'about', 'education', 'experience', 'skills', 'work', 'testimonials', 'blog', 'contact'];

  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      const pos = window.scrollY + 200;
      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (pos >= top && pos < top + height) {
            if (activeSection !== section) setActiveSection(section);
            break;
          }
        }
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [sections, activeSection]);

  const names = settings?.hero?.title ? settings.hero.title.split(' ') : ['Amlakie', 'Developer', 'Designer', 'Creator'];
  const profiles = settings?.hero?.profileImages?.length ? settings.hero.profileImages : ['/images/profile1.jpg', '/images/profile2.jpg', '/images/profile3.jpg'];

  useEffect(() => {
    const nameInterval = setInterval(() => {
      setNameIndex((prev) => (prev + 1) % names.length);
    }, 3000);
    const profileInterval = setInterval(() => {
      setProfileIndex((prev) => (prev + 1) % profiles.length);
    }, 4000);
    return () => {
      clearInterval(nameInterval);
      clearInterval(profileInterval);
    };
  }, [names.length, profiles.length]);

  useEffect(() => {
    if (isInView) controls.start('visible');
  }, [isInView, controls]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ backgroundColor: colors.bgPrimary }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: colors.primary }} />
          <p style={{ color: colors.textPrimary }}>Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.portfolioApp} style={{ backgroundColor: colors.bgPrimary, color: colors.textPrimary, transition: 'background-color 0.3s ease, color 0.3s ease' }}>
      {/* Animated Background */}
      <div className={styles.animatedBg}>
        {[...Array(30)].map((_, i) => (
          <motion.div
            key={i}
            className={styles.bgParticle}
            style={{ backgroundColor: colors.primary }}
            initial={{ y: -100, x: Math.random() * 1000, opacity: 0 }}
            animate={{
              y: typeof window !== 'undefined' ? window.innerHeight + 100 : 800,
              x: Math.random() * 1000,
              opacity: [0, 0.2, 0],
              transition: { duration: 15 + Math.random() * 30, repeat: Infinity, ease: 'linear', delay: Math.random() * 5 },
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className={styles.portfolioNav} style={{ backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.9)' : 'rgba(248, 249, 250, 0.9)', backdropFilter: 'blur(10px)', color: colors.textPrimary }}>
        <div className={styles.navContainer}>
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }}>
            <a href="#home" className={styles.logo} style={{ color: colors.primary, fontSize: '1.8rem', fontWeight: 700, fontFamily: "'Poppins', sans-serif", letterSpacing: '1px' }} onClick={(e) => { e.preventDefault(); scrollToSection('home'); }}>Amlakie</a>
          </motion.div>
          <div className={styles.navLinks}>
            {sections.map((item) => (
              <motion.div key={item} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <a href={`#${item}`} className={`${styles.navLink} ${activeSection === item ? styles.active : ''}`} onClick={(e) => { e.preventDefault(); scrollToSection(item); }} style={{ color: activeSection === item ? colors.primary : colors.textPrimary, margin: '0 15px', fontWeight: 500, position: 'relative', fontSize: '0.95rem', textTransform: 'capitalize', letterSpacing: '1px', fontFamily: "'Poppins', sans-serif", transition: 'color 0.3s ease' }}>
                  {item.charAt(0).toUpperCase() + item.slice(1)}
                  {activeSection === item && <motion.div style={{ position: 'absolute', bottom: -5, left: 0, width: '100%', height: '2px', backgroundColor: colors.primary }} layoutId="underline" transition={{ type: 'spring', stiffness: 300, damping: 20 }} />}
                </a>
              </motion.div>
            ))}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} style={{ marginLeft: '15px', cursor: 'pointer' }} onClick={toggleTheme}>
              {isDarkMode ? <FaSun color={colors.primary} size={20} /> : <FaMoon color={colors.primary} size={20} />}
            </motion.div>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section id="home" className={styles.heroSection} style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', backgroundColor: getSectionBackground(0), color: colors.textPrimary, padding: '100px 0' }}>
        <div className={styles.container}>
          <div className={styles.heroGrid}>
            <div className={styles.heroContent}>
              <motion.div initial={{ opacity: 0, x: -100 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, delay: 0.2 }}>
                <h1 className={styles.heroTitle} style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 700, marginBottom: '20px', lineHeight: 1.2, fontFamily: "'Poppins', sans-serif", color: colors.textPrimary }}>
                  Hi, I'm <span style={{ color: colors.primary }}>{names[nameIndex]}</span>
                </h1>
                <motion.h2 className={styles.heroSubtitle} key={nameIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.5 }} style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 400, marginBottom: '30px', color: colors.textPrimary, fontFamily: "'Poppins', sans-serif" }}>
                  {settings?.hero?.subtitle || 'Software Engineer'}
                </motion.h2>
                <p className={styles.heroDescription} style={{ fontSize: '1.1rem', marginBottom: '40px', maxWidth: '600px', color: colors.textPrimary }}>
                  {settings?.hero?.description || 'I build exceptional digital experiences with modern web technologies.'}
                </p>
                <div className={styles.heroCta} style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.btnOutline} style={{ backgroundColor: 'transparent', color: colors.primary, border: `2px solid ${colors.primary}`, padding: '13px 28px', borderRadius: '50px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '1rem' }} onClick={() => { const link = document.createElement('a'); link.href = settings?.hero?.resumeUrl || '/documents/Amlakie_Abebaw_Resume.pdf'; link.download = 'Amlakie_Abebaw_Resume.pdf'; document.body.appendChild(link); link.click(); document.body.removeChild(link); }}>
                    <FiDownload style={{ marginRight: '8px' }} /> Download CV
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.05, boxShadow: `0 10px 25px ${colors.primary}80` }} whileTap={{ scale: 0.95 }} className={styles.btnPrimary} style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff', border: 'none', padding: '15px 30px', borderRadius: '50px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '1rem', boxShadow: `0 5px 15px ${colors.primary}30` }} onClick={() => { const el = document.getElementById('work'); if (el) el.scrollIntoView({ behavior: 'smooth' }); }}>
                    View My Work
                  </motion.button>
                </div>
              </motion.div>
            </div>
            <div className={styles.heroImage}>
              <motion.div initial={{ opacity: 0, x: 100, rotate: 5 }} animate={{ opacity: 1, x: 0, rotate: 0 }} transition={{ duration: 0.8, delay: 0.4 }} className={styles.heroImageContainer} style={{ position: 'relative', display: 'flex', justifyContent: 'center', perspective: '1000px' }}>
                <AnimatePresence mode="wait">
                  <motion.div key={profileIndex} className={styles.heroImageWrapper} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.1 }} transition={{ duration: 0.6 }} style={{ position: 'relative', width: '100%', maxWidth: '380px', height: '380px', borderRadius: '30px', overflow: 'hidden', boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)', transformStyle: 'preserve-3d' }}>
                    <img src={getProfileImageUrl(profiles[profileIndex])} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className={styles.heroImageBg} style={{ position: 'absolute', top: '20px', left: '20px', width: 'calc(100% - 40px)', height: 'calc(100% - 40px)', border: `5px solid ${colors.primary}`, borderRadius: '30px', zIndex: -1, transform: 'rotate(5deg)' }} />
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" className={styles.section} style={{ padding: '100px 0', position: 'relative', backgroundColor: getSectionBackground(1), color: colors.textPrimary }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }} variants={fadeInUp}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                <FaUser color={colors.primary} /> {settings?.about?.title || 'About Me'}
                <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} layoutId="sectionDivider" />
              </h2>
            </div>
            <div className={styles.aboutGrid}>
              <div className={styles.aboutImageWrapper}>
                <motion.div whileHover={{ rotate: 2 }} transition={{ type: 'spring' }} className={styles.aboutImageContainer} style={{ position: 'relative', width: '100%', maxWidth: '300px', height: '400px', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)', margin: '0 auto', border: `2px solid ${colors.primary}` }}>
                  <img src={getImageUrl(settings?.about) || '/images/about4.jpg'} alt="About" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </motion.div>
              </div>
              <div className={styles.aboutContent}>
                <h3 style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '8px', color: colors.textPrimary, fontFamily: "'Poppins', sans-serif" }}>Who is Amlakie?</h3>
                <h5 style={{ fontSize: 'clamp(1.2rem, 3vw, 1.2rem)', marginBottom: '25px', color: colors.textPrimary, fontFamily: "'Poppins', sans-serif" }}>Software Developer</h5>
                <p style={{ marginBottom: '20px', lineHeight: 1.8, fontSize: '1.1rem', color: colors.textPrimary }}>{settings?.about?.description || "I'm a passionate and self-motivated Software Developer with a strong foundation in both front-end and back-end technologies."}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== EDUCATION ===== */}
      <section id="education" className={styles.section} style={{ padding: '100px 0', position: 'relative', backgroundColor: getSectionBackground(4), color: colors.textPrimary }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }} variants={fadeInUp}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                <FaGraduationCap color={colors.primary} /> My Education
                <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} layoutId="sectionDivider" />
              </h2>
            </div>
            <div className={styles.timeline}>
              {educations.length > 0 ? educations.map((edu, index) => (
                <motion.div key={edu._id} className={`${styles.timelineItem} ${index % 2 === 0 ? styles.left : styles.right}`} initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.2 }}>
                  <motion.div className={styles.timelineContent} whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }} style={{ backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)', padding: '30px', borderRadius: '15px', borderLeft: `5px solid ${colors.primary}`, color: colors.textPrimary }}>
                    <h3 style={{ fontSize: '1.5rem', color: colors.primary, marginBottom: '10px', fontFamily: "'Poppins', sans-serif" }}>{edu.degree}</h3>
                    <h4 style={{ fontSize: '1.2rem', color: colors.textPrimary, marginBottom: '10px', fontWeight: 600 }}>{edu.institution}</h4>
                    <span className={styles.date} style={{ display: 'inline-block', marginBottom: '15px', color: isDarkMode ? '#00f0ff' : '#2563eb', fontWeight: 500, backgroundColor: isDarkMode ? 'rgba(0, 240, 255, 0.1)' : 'rgba(37, 99, 235, 0.1)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>{edu.year}</span>
                    <p style={{ marginBottom: 0, lineHeight: 1.8, color: colors.textPrimary }}>{edu.description}</p>
                  </motion.div>
                </motion.div>
              )) : (
                <p style={{ textAlign: 'center', color: colors.textSecondary }}>No education data available</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== EXPERIENCE ===== */}
      <section id="experience" className={styles.section} style={{ padding: '100px 0', position: 'relative', backgroundColor: getSectionBackground(3), color: colors.textPrimary }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }} variants={fadeInUp}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                <FaBriefcase color={colors.primary} /> My Experience
                <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} layoutId="sectionDivider" />
              </h2>
            </div>
            <div className={styles.timeline}>
              {experiences.length > 0 ? experiences.map((exp, index) => (
                <motion.div key={exp._id} className={`${styles.timelineItem} ${index % 2 === 0 ? styles.left : styles.right}`} initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: index * 0.2 }}>
                  <motion.div className={styles.timelineContent} whileHover={{ y: -5, boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)' }} style={{ backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)', padding: '30px', borderRadius: '15px', borderLeft: `5px solid ${colors.primary}`, color: colors.textPrimary }}>
                    <h3 style={{ fontSize: '1.5rem', color: colors.primary, marginBottom: '10px', fontFamily: "'Poppins', sans-serif" }}>{exp.role}</h3>
                    <h4 style={{ fontSize: '1.2rem', color: colors.textPrimary, marginBottom: '10px', fontWeight: 600 }}>{exp.company}</h4>
                    <span className={styles.date} style={{ display: 'inline-block', marginBottom: '15px', color: isDarkMode ? '#00f0ff' : '#2563eb', fontWeight: 500, backgroundColor: isDarkMode ? 'rgba(0, 240, 255, 0.1)' : 'rgba(37, 99, 235, 0.1)', padding: '5px 15px', borderRadius: '20px', fontSize: '0.9rem' }}>{exp.period}</span>
                    <p style={{ marginBottom: 0, lineHeight: 1.8, color: colors.textPrimary }}>{exp.description}</p>
                  </motion.div>
                </motion.div>
              )) : (
                <p style={{ textAlign: 'center', color: colors.textSecondary }}>No experience data available</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== SKILLS ===== */}
      <section id="skills" className={styles.section} style={{ padding: '100px 0', position: 'relative', backgroundColor: getSectionBackground(2), color: colors.textPrimary }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }} variants={fadeInUp}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                <FaTools color={colors.primary} /> My Skills
                <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} layoutId="sectionDivider" />
              </h2>
            </div>
            <div className={styles.skillsDescription}>
              <p style={{ textAlign: 'center', marginBottom: '30px', lineHeight: 1.8, fontSize: '1.1rem', color: colors.textPrimary }}>I've mastered a variety of technologies in the web development world, from backend systems to interactive frontend experiences.</p>
            </div>
            <div className={styles.skillsGrid}>
              <div className={styles.skillsColumn}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInLeft} whileHover={{ y: -10, boxShadow: `0 20px 40px ${colors.primary}20` }} style={{ padding: '30px', backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.7)' : 'rgba(248, 249, 250, 0.7)', borderRadius: '20px', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(10px)', border: `2px solid transparent`, transition: 'all 0.3s ease' }}>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: colors.primary, fontFamily: "'Poppins', sans-serif", textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <motion.span whileHover={{ rotate: 360 }}><FaReact /></motion.span> Frontend Skills
                    </h3>
                    {frontendSkills.length > 0 ? frontendSkills.map((skill, index) => (
                      <motion.div key={skill._id} className={styles.progressItem} style={{ marginBottom: '25px' }} whileHover={{ x: 10 }}>
                        <div className={styles.progressHeader} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <span className={styles.skillIcon} style={{ fontSize: '1.5rem', marginRight: '15px', color: colors.primary }}>{getIconComponent(skill.icon)}</span>
                          <span className={styles.skillName} style={{ fontWeight: 600, flexGrow: 1, fontSize: '1.1rem', color: colors.textPrimary }}>{skill.name}</span>
                          <span className={styles.skillPercent} style={{ fontWeight: 700, color: colors.primary, fontSize: '1.1rem' }}>{skill.value}%</span>
                        </div>
                        <div className={styles.progressBar} style={{ width: '100%', height: '10px', backgroundColor: isDarkMode ? '#112240' : '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}>
                          <motion.div className={styles.progressFill} initial={{ width: 0 }} whileInView={{ width: `${skill.value}%` }} viewport={{ once: true }} transition={{ duration: 1.5, delay: index * 0.1 + 0.3 }} style={{ height: '100%', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '5px', boxShadow: `0 2px 10px ${colors.primary}30` }} />
                        </div>
                      </motion.div>
                    )) : (
                      <p style={{ textAlign: 'center', color: colors.textSecondary }}>No frontend skills data available</p>
                    )}
                  </motion.div>
                </motion.div>
              </div>
              <div className={styles.skillsColumn}>
                <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInRight} whileHover={{ y: -10, boxShadow: `0 20px 40px ${colors.secondary}20` }} style={{ padding: '30px', backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.7)' : 'rgba(248, 249, 250, 0.7)', borderRadius: '20px', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)', backdropFilter: 'blur(10px)', border: `2px solid transparent`, transition: 'all 0.3s ease' }}>
                  <motion.div whileHover={{ scale: 1.02 }}>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '25px', color: colors.secondary, fontFamily: "'Poppins', sans-serif", textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                      <motion.span whileHover={{ rotate: 360 }}><FaServer /></motion.span> Backend Skills
                    </h3>
                    {backendSkills.length > 0 ? backendSkills.map((skill, index) => (
                      <motion.div key={skill._id} className={styles.progressItem} style={{ marginBottom: '25px' }} whileHover={{ x: 10 }}>
                        <div className={styles.progressHeader} style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                          <span className={styles.skillIcon} style={{ fontSize: '1.5rem', marginRight: '15px', color: colors.secondary }}>{getIconComponent(skill.icon)}</span>
                          <span className={styles.skillName} style={{ fontWeight: 600, flexGrow: 1, fontSize: '1.1rem', color: colors.textPrimary }}>{skill.name}</span>
                          <span className={styles.skillPercent} style={{ fontWeight: 700, color: colors.secondary, fontSize: '1.1rem' }}>{skill.value}%</span>
                        </div>
                        <div className={styles.progressBar} style={{ width: '100%', height: '10px', backgroundColor: isDarkMode ? '#112240' : '#e9ecef', borderRadius: '5px', overflow: 'hidden' }}>
                          <motion.div className={styles.progressFill} initial={{ width: 0 }} whileInView={{ width: `${skill.value}%` }} viewport={{ once: true }} transition={{ duration: 1.5, delay: index * 0.1 + 0.3 }} style={{ height: '100%', background: `linear-gradient(90deg, ${colors.secondary}, ${colors.primary})`, borderRadius: '5px', boxShadow: `0 2px 10px ${colors.secondary}30` }} />
                        </div>
                      </motion.div>
                    )) : (
                      <p style={{ textAlign: 'center', color: colors.textSecondary }}>No backend skills data available</p>
                    )}
                  </motion.div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== WORK ===== */}
<section id="work" className={styles.section} style={{ padding: '100px 0', position: 'relative', backgroundColor: getSectionBackground(5), color: colors.textPrimary }}>
  <div className={styles.container}>
    <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
      <div style={{ textAlign: 'center', marginBottom: '60px' }}>
        <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
          <FaLaptopCode color={colors.primary} /> My Work
          <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} layoutId="sectionDivider" />
        </h2>
      </div>
      
      <div className={styles.projectFilter}>
        {['All', 'Web', 'Mobile', 'Design', 'Full Stack'].map((filter) => (
          <motion.button 
            key={filter} 
            whileHover={{ scale: 1.05, backgroundColor: colors.primary, color: '#ffffff' }} 
            whileTap={{ scale: 0.95 }} 
            className={styles.filterBtn} 
            style={{ 
              backgroundColor: 'transparent', 
              color: colors.textPrimary, 
              border: `1px solid ${colors.primary}`, 
              padding: '8px 20px', 
              borderRadius: '50px', 
              fontWeight: 500, 
              cursor: 'pointer', 
              fontSize: '0.9rem', 
              transition: 'all 0.3s ease' 
            }}
          >
            {filter}
          </motion.button>
        ))}
      </div>
      
      <div className={styles.projectGrid}>
        {projects.length > 0 ? (() => {
          // Group projects into rows of 3
          const rows = [];
          for (let i = 0; i < projects.length; i += 3) {
            rows.push(projects.slice(i, i + 3));
          }
          
          return rows.map((row, rowIndex) => (
            <div key={rowIndex} className={styles.projectRow}>
              {row.map((project, index) => {
                const globalIndex = rowIndex * 3 + index;
                const isWide = globalIndex % 3 === 0;
                return (
                  <motion.div 
                    key={project._id} 
                    className={`${styles.projectCard} ${isWide ? styles.wide : styles.narrow}`} 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    whileInView={{ opacity: 1, scale: 1 }} 
                    viewport={{ once: true }} 
                    transition={{ duration: 0.5, delay: globalIndex * 0.1 }} 
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
                    <div className={styles.projectImage} style={{ position: 'relative', height: '200px', overflow: 'hidden', flexShrink: 0 }}>
                      <img 
                        src={getImageUrl(project) || '/images/placeholder.jpg'} 
                        alt={project.title} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                      <motion.div 
                        className={styles.projectOverlay} 
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
                        whileHover={{ opacity: 1 }}
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
                      <h3 style={{ fontSize: '1.4rem', marginBottom: '10px', color: colors.textPrimary, fontFamily: "'Poppins', sans-serif" }}>
                        {project.title}
                      </h3>
                      <p style={{ marginBottom: '15px', color: colors.textPrimary, fontSize: '0.95rem', lineHeight: 1.5 }}>
                        {project.description}
                      </p>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div className={styles.projectTags}>
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
                );
              })}
            </div>
          ));
        })() : (
          <p style={{ textAlign: 'center', color: colors.textSecondary, width: '100%', padding: '40px 0' }}>
            No projects data available
          </p>
        )}
      </div>
    </motion.div>
  </div>
</section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className={styles.section} style={{ padding: '100px 0', position: 'relative', backgroundColor: getSectionBackground(6), color: colors.textPrimary }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }} variants={fadeInUp}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                <MdRecordVoiceOver color={colors.primary} /> Client Testimonials
                <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} layoutId="sectionDivider" />
              </h2>
            </div>
            <div className={styles.testimonialSlider} style={{ position: 'relative', padding: '20px 0', display: 'flex', gap: '30px', overflowX: 'auto', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
              {testimonials.length > 0 ? testimonials.map((testimonial) => (
                <motion.div key={testimonial._id} className={styles.testimonialCard} whileHover={{ scale: 1.02, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)' }} style={{ backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)', borderRadius: '20px', padding: '40px', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)', minWidth: '80%', scrollSnapAlign: 'start' }}>
                  <div className={styles.testimonialHeader} style={{ display: 'flex', alignItems: 'center', marginBottom: '25px' }}>
                    <div className={styles.testimonialAvatar} style={{ width: '80px', height: '80px', borderRadius: '50%', overflow: 'hidden', marginRight: '25px', border: `3px solid ${colors.primary}`, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
                      <img src={getImageUrl(testimonial) || '/images/placeholder.jpg'} alt={testimonial.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className={styles.testimonialAuthor}>
                      <h4 style={{ fontSize: '1.4rem', marginBottom: '5px', color: colors.textPrimary, fontFamily: "'Poppins', sans-serif" }}>{testimonial.name}</h4>
                      <p style={{ fontSize: '1rem', color: colors.textPrimary, marginBottom: '10px', opacity: 0.8 }}>{testimonial.role}</p>
                      <div className={styles.testimonialRating} style={{ color: '#ffc107', fontSize: '1.1rem' }}>
                        {[...Array(testimonial.rating)].map((_, i) => <span key={i}>★</span>)}
                      </div>
                    </div>
                  </div>
                  <div className={styles.testimonialContent}>
                    <p style={{ fontStyle: 'italic', lineHeight: 1.8, position: 'relative', paddingLeft: '30px', fontSize: '1.1rem', color: colors.textPrimary }}>
                      <span style={{ position: 'absolute', left: 0, top: 0, fontSize: '3rem', lineHeight: 1, color: colors.primary, opacity: 0.2 }}>"</span>
                      {testimonial.content}
                    </p>
                  </div>
                </motion.div>
              )) : (
                <p style={{ textAlign: 'center', color: colors.textSecondary, width: '100%', padding: '40px 0' }}>No testimonials data available</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== BLOG ===== */}
      <section id="blog" className={styles.section} style={{ padding: '100px 0', position: 'relative', backgroundColor: getSectionBackground(7), color: colors.textPrimary }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }} variants={fadeInUp}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                <RiArticleLine color={colors.primary} /> Latest Articles
                <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} layoutId="sectionDivider" />
              </h2>
            </div>
            <div className={styles.blogGrid}>
              {blogPosts.length > 0 ? blogPosts.map((post) => (
                <div key={post._id} className={styles.blogCard}>
                  <motion.div className={styles.blogCardInner} style={{ backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)', marginBottom: '30px', height: '100%' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }} whileHover={{ y: -10, boxShadow: '0 15px 30px rgba(0, 0, 0, 0.1)' }}>
                    <div className={styles.blogImage} style={{ position: 'relative', height: '250px', overflow: 'hidden' }}>
                      <img src={getImageUrl(post) || '/images/placeholder.jpg'} alt={post.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div className={styles.blogCategory} style={{ position: 'absolute', top: '20px', right: '20px', background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff', padding: '6px 18px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 600, boxShadow: '0 5px 15px rgba(0, 0, 0, 0.1)' }}>{post.category}</div>
                    </div>
                    <div className={styles.blogContent} style={{ padding: '30px' }}>
                      <h3 style={{ fontSize: '1.5rem', marginBottom: '15px', color: colors.textPrimary, fontFamily: "'Poppins', sans-serif" }}>{post.title}</h3>
                      <p className={styles.blogDate} style={{ fontSize: '0.95rem', color: colors.textPrimary, marginBottom: '20px', display: 'flex', alignItems: 'center', opacity: 0.8 }}>
                        <span style={{ display: 'inline-block', width: '15px', height: '2px', backgroundColor: colors.primary, marginRight: '10px' }}></span>
                        {post.date}
                      </p>
                      <p className={styles.blogExcerpt} style={{ marginBottom: '25px', lineHeight: 1.8, color: colors.textPrimary }}>{post.excerpt}</p>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className={styles.btnReadMore} style={{ backgroundColor: 'transparent', color: colors.primary, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: 0, fontSize: '1rem' }}>Read More <FiExternalLink style={{ marginLeft: '8px' }} /></motion.button>
                    </div>
                  </motion.div>
                </div>
              )) : (
                <p style={{ textAlign: 'center', color: colors.textSecondary, width: '100%', padding: '40px 0' }}>No blog posts available</p>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className={styles.statsSection} style={{ background: `linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%)`, color: '#ffffff', padding: '100px 0', position: 'relative', overflow: 'hidden' }}>
        <div className={styles.container}>
          <div className={styles.statsGrid}>
            {[
              { number: settings?.stats?.projectsCompleted || 25, label: 'Projects Completed' },
              { number: settings?.stats?.happyClients || 15, label: 'Happy Clients' },
              { number: settings?.stats?.linesOfCode || 50000, label: 'Lines of Code' },
              { number: settings?.stats?.yearsExperience || 3, label: 'Years Experience' },
            ].map((stat, index) => (
              <div key={index} className={styles.statCard}>
                <motion.div className={styles.statCardInner} style={{ textAlign: 'center', padding: '40px 20px', backgroundColor: 'rgba(255, 255, 255, 0.1)', borderRadius: '20px', backdropFilter: 'blur(5px)', marginBottom: '20px', border: '1px solid rgba(255, 255, 255, 0.2)' }} initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.1 }} whileHover={{ y: -5, backgroundColor: 'rgba(255, 255, 255, 0.2)' }}>
                  <motion.div className={styles.statNumber} style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 700, marginBottom: '15px', fontFamily: "'Poppins', sans-serif", position: 'relative' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 + 0.3 }}>
                    {typeof stat.number === 'number' ? stat.number.toLocaleString() : stat.number}+
                  </motion.div>
                  <div className={styles.statLabel} style={{ fontSize: '1.2rem', opacity: 0.9, fontWeight: 500 }}>{stat.label}</div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CONTACT ===== */}
      <section id="contact" className={styles.section} style={{ padding: '100px 0', position: 'relative', backgroundColor: getSectionBackground(8), color: colors.textPrimary }}>
        <div className={styles.container}>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} transition={{ duration: 0.8 }} variants={fadeInUp}>
            <div style={{ textAlign: 'center', marginBottom: '60px' }}>
              <h2 className={styles.sectionTitle} style={{ fontSize: 'clamp(2rem, 5vw, 2.8rem)', fontWeight: 700, color: colors.textPrimary, fontFamily: "'Poppins', sans-serif", position: 'relative', display: 'inline-flex', alignItems: 'center', gap: '15px' }}>
                <FaHeadset color={colors.primary} /> Get In Touch
                <motion.div style={{ position: 'absolute', bottom: '-15px', left: '50%', transform: 'translateX(-50%)', width: '80px', height: '4px', background: `linear-gradient(90deg, ${colors.primary}, ${colors.secondary})`, borderRadius: '2px' }} layoutId="sectionDivider" />
              </h2>
            </div>
            <div className={styles.contactInfoGrid}>
              {[
                { icon: <FaMapMarker />, title: 'Location', detail: settings?.contact?.location || 'Addis Ababa, Ethiopia' },
                { icon: <FaPhone />, title: 'Phone', detail: settings?.contact?.phone || '+251 9 12 43 65 73' },
                { icon: <FiMail />, title: 'Email', detail: settings?.contact?.email || 'amlakieab4@gmail.com' },
              ].map((item, idx) => (
                <div key={idx} className={styles.contactInfoItem}>
                  <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ duration: 1 }} style={{ textAlign: 'center' }}>
                    <span style={{ fontSize: '30px', color: colors.primary }}>{item.icon}</span>
                    <h3 style={{ color: colors.primary, fontFamily: "'Poppins', sans-serif", margin: '15px 0' }}>{item.title}</h3>
                    <p style={{ color: colors.textPrimary }}>{item.detail}</p>
                  </motion.div>
                </div>
              ))}
            </div>
            <div className={styles.contactFormGrid}>
              <div className={styles.contactMap}>
                <motion.div initial={{ x: -100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}>
                  <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.869244319124!2d38.76321431536945!3d9.012326893541918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f1a4b1f3b5%3A0x1c5b5b5b5b5b5b5b!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1633080000000!5m2!1sen!2set" width="100%" height="400" style={{ border: 0, borderRadius: '10px' }} allowFullScreen loading="lazy" />
                </motion.div>
              </div>
              <div className={styles.contactForm}>
                <motion.div initial={{ x: 100, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} transition={{ duration: 1 }}>
                  <div className={styles.contactFormInner} style={{ backgroundColor: isDarkMode ? 'rgba(10, 25, 47, 0.5)' : 'rgba(248, 249, 250, 0.7)', padding: '40px', borderRadius: '20px', boxShadow: '0 15px 40px rgba(0, 0, 0, 0.05)' }}>
                    <h3 style={{ color: colors.primary, fontSize: '2rem', marginBottom: '25px', fontFamily: "'Poppins', sans-serif" }}>Send Me a Message</h3>
                    <form>
                      <div className={styles.formRow}>
                        <div className={styles.formGroup}><input type="text" placeholder="Your Name" required style={{ width: '100%', padding: '15px 20px', border: `1px solid ${colors.primary}`, borderRadius: '10px', fontFamily: 'inherit', fontSize: '1rem', backgroundColor: 'transparent', color: colors.textPrimary }} /></div>
                        <div className={styles.formGroup}><input type="email" placeholder="Your Email" required style={{ width: '100%', padding: '15px 20px', border: `1px solid ${colors.primary}`, borderRadius: '10px', fontFamily: 'inherit', fontSize: '1rem', backgroundColor: 'transparent', color: colors.textPrimary }} /></div>
                      </div>
                      <div className={styles.formGroup}><input type="text" placeholder="Subject" required style={{ width: '100%', padding: '15px 20px', border: `1px solid ${colors.primary}`, borderRadius: '10px', fontFamily: 'inherit', fontSize: '1rem', backgroundColor: 'transparent', color: colors.textPrimary }} /></div>
                      <div className={styles.formGroup}><textarea placeholder="Your Message" rows={5} required style={{ width: '100%', padding: '15px 20px', border: `1px solid ${colors.primary}`, borderRadius: '10px', fontFamily: 'inherit', fontSize: '1rem', resize: 'none', backgroundColor: 'transparent', color: colors.textPrimary }} /></div>
                      <motion.button whileHover={{ scale: 1.05, boxShadow: `0 5px 15px ${colors.primary}40` }} whileTap={{ scale: 0.95 }} type="submit" style={{ background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`, color: '#ffffff', border: 'none', padding: '15px 30px', borderRadius: '50px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', fontSize: '1rem', boxShadow: `0 5px 15px ${colors.primary}30`, width: '100%', justifyContent: 'center' }}>Send Message</motion.button>
                    </form>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className={styles.footer} style={{ backgroundColor: '#000', color: '#fff', padding: '60px 0 100px', textAlign: 'center', borderTop: '1px solid #fff' }}>
        <div className={styles.container}>
          <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <div className={styles.footerGrid}>
              <div className={styles.footerAbout}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.5rem', color: '#fff' }}>Amlakie's Portfolio</h3>
                <p style={{ opacity: 0.8, lineHeight: 1.6, color: '#fff' }}>Thank you for visiting my personal portfolio website. Connect with me over socials. <br /><br /> Keep Rising 🚀.</p>
              </div>
              <div className={styles.footerLinks}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#fff' }}>Quick Links</h3>
                <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                  {['Home', 'About', 'Skills', 'Education', 'Work', 'Experience'].map((item) => (
                    <li key={item} style={{ marginBottom: '10px' }}>
                      <a href={`#${item.toLowerCase()}`} style={{ textDecoration: 'none', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500 }} onMouseOver={(e) => (e.currentTarget.style.color = colors.primary)} onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}>
                        <FaChevronCircleRight /> {item}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className={styles.footerContact}>
                <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', color: '#fff' }}>Contact Info</h3>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', opacity: 0.9 }}><FaPhone size={20} /> {settings?.contact?.phone || '+251 9 12 43 55 73'}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', opacity: 0.9 }}><IoMdMail size={20} /> {settings?.contact?.email || 'amlakieab4@gmail.com'}</p>
                <p style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', opacity: 0.9 }}><FaMapMarkedAlt size={20} /> {settings?.contact?.location || 'Addis Ababa, Ethiopia'}</p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-start', flexWrap: 'wrap' }}>
                  {settings?.contact?.socialLinks?.map((social, idx) => (
                    <a key={idx} href={social.url} target="_blank" rel="noopener noreferrer" aria-label={social.platform} style={{ fontSize: '1.5rem', color: '#fff', width: '45px', height: '45px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255, 255, 255, 0.1)', transition: 'all 0.3s ease', textDecoration: 'none' }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = colors.primary)} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)')}>
                      {getSocialIcon(social.icon)}
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <p style={{ fontSize: '1rem', opacity: 0.7, marginBottom: '30px', color: '#fff' }}>Designed with <span style={{ color: '#ff4d4d', margin: '0 5px' }}>❤</span> by <a href="https://www.linkedin.com/in/amlakie-abebaw-b6a308329/" target="_blank" rel="noopener noreferrer" style={{ color: colors.primary, fontWeight: 600, textDecoration: 'none' }}>Amlakie Abebaw</a></p>
          </motion.div>
        </div>
        <motion.button whileHover={{ scale: 1.1, boxShadow: `0 5px 15px rgba(255, 255, 255, 0.3)` }} whileTap={{ scale: 0.9 }} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, backgroundColor: 'rgba(255, 255, 255, 0.1)', color: '#fff', border: 'none', padding: '12px 18px', borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem', backdropFilter: 'blur(5px)' }} aria-label="Back to top" onMouseOver={(e) => (e.currentTarget.style.color = colors.primary)} onMouseOut={(e) => (e.currentTarget.style.color = '#fff')}>
          <FiArrowUp />
        </motion.button>
      </footer>
    </div>
  );
};

export default function Home() {
  return (
    <ThemeProvider>
      <Portfolio />
    </ThemeProvider>
  );
}