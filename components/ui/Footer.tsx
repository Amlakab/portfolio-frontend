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
import styles from '../page.module.css';
import { ThemeProvider, useTheme } from '@/app/context/ThemeContext';
import Navbar from '@/components/ui/Navbar';


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

// ===== Helper functions - SAME as SettingsTab =====

// Helper function to convert image data to URL (EXACTLY like SettingsTab)
const getImageUrl = (item: any): string | null => {
  if (!item) return null;

  // Check for imageData
  if (item.imageData) {
    let base64 = '';
    
    // Handle different data formats
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
    } else if (item.imageData.data && typeof item.imageData.data === 'object') {
      try {
        const dataStr = JSON.stringify(item.imageData.data);
        base64 = Buffer.from(dataStr).toString('base64');
      } catch (e) {
        console.warn('Failed to convert complex imageData:', e);
      }
    }
    
    if (base64) {
      return `data:${item.imageData.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }

  // Check for avatarData (testimonials)
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

  // Handle image URL (for fallback/default images)
  if (item.image) {
    if (item.image.startsWith('data:image')) {
      return item.image;
    }
    if (item.image.startsWith('/uploads/')) {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      return `${base}${item.image}`;
    }
    if (item.image.startsWith('/images/')) {
      return item.image;
    }
    return item.image;
  }

  // Handle avatar URL
  if (item.avatar) {
    if (item.avatar.startsWith('data:image')) {
      return item.avatar;
    }
    if (item.avatar.startsWith('/uploads/')) {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      return `${base}${item.avatar}`;
    }
    if (item.avatar.startsWith('/images/')) {
      return item.avatar;
    }
    return item.avatar;
  }

  return null;
};

// Helper function to get profile image URL from data (EXACTLY like SettingsTab)
const getProfileImageUrl = (profileImage: any): string | null => {
  if (!profileImage) return null;

  // If it's a string URL
  if (typeof profileImage === 'string') {
    if (profileImage.startsWith('data:')) return profileImage;
    if (profileImage.startsWith('/uploads/')) {
      const base = process.env.NEXT_PUBLIC_API_URL || '';
      return `${base}${profileImage}`;
    }
    if (profileImage.startsWith('/images/')) {
      return profileImage;
    }
    return profileImage;
  }

  // If it's an object with imageData
  if (profileImage.imageData) {
    let base64 = '';
    const data = profileImage.imageData;
    
    if (typeof data.data === 'string') {
      base64 = data.data;
    } else if (data.data?.$binary?.base64) {
      base64 = data.data.$binary.base64;
    } else if (data.data?.data) {
      try {
        if (typeof data.data.data === 'string') {
          base64 = data.data.data;
        } else if (data.data.data instanceof Buffer || Array.isArray(data.data.data)) {
          base64 = Buffer.from(data.data.data).toString('base64');
        }
      } catch (e) {
        console.warn('Failed to convert profile image:', e);
      }
    } else if (data.data instanceof Buffer) {
      base64 = data.data.toString('base64');
    }
    
    if (base64) {
      return `data:${data.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }

  // If it's directly the image data object
  if (profileImage.data) {
    let base64 = '';
    const data = profileImage;
    
    if (typeof data.data === 'string') {
      base64 = data.data;
    } else if (data.data?.$binary?.base64) {
      base64 = data.data.$binary.base64;
    } else if (data.data?.data) {
      try {
        if (typeof data.data.data === 'string') {
          base64 = data.data.data;
        } else if (data.data.data instanceof Buffer || Array.isArray(data.data.data)) {
          base64 = Buffer.from(data.data.data).toString('base64');
        }
      } catch (e) {
        console.warn('Failed to convert profile image:', e);
      }
    } else if (data.data instanceof Buffer) {
      base64 = data.data.toString('base64');
    }
    
    if (base64) {
      return `data:${data.contentType || 'image/jpeg'};base64,${base64}`;
    }
  }

  return null;
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

// ===== FIXED: Extract data helper =====
const extractData = (response: any): any => {
  try {
    // Log the response structure for debugging
    console.log('🔍 Response structure:', {
      hasData: !!response?.data,
      hasDataData: !!response?.data?.data,
      hasDataDataData: !!response?.data?.data?.data,
      hasSuccess: !!response?.data?.success
    });
    
    // Check for different response structures
    if (response?.data?.data?.data !== undefined) {
      // Structure: { data: { data: { data: [...] } } }
      return response.data.data.data;
    }
    if (response?.data?.data !== undefined) {
      // Structure: { data: { data: [...] } }
      return response.data.data;
    }
    if (response?.data !== undefined) {
      // Structure: { data: [...] }
      return response.data;
    }
    // Fallback: return the response itself
    return response || [];
  } catch (error) {
    console.error('Error extracting data:', error);
    return [];
  }
};

// ===== Main Component =====
const Footer = () => {
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
  


  // ===== FETCH ALL DATA =====
  useEffect(() => {
      const fetchAll = async () => {
        try {
          setLoading(true);
          
          console.log('🚀 Fetching all portfolio data...');
          
          const [
            // projectsRes,
            // experiencesRes,
            // educationsRes
            // testimonialsRes,
            // blogPostsRes,
            // skillsRes,
            settingsRes
          ] = await Promise.all([
            // portfolioApi.getProjects({ featured: true, limit: 3 }),
            // portfolioApi.getExperiences(),
            // portfolioApi.getEducations(),
            // portfolioApi.getTestimonials({ featured: true }),
            // portfolioApi.getBlogPosts({ published: true, limit: 2 }),
            // portfolioApi.getSkills(),
            portfolioApi.getSettings(),
          ]);
  
          // Extract and set projects
        //   const projectsData = extractData(projectsRes);
        //   console.log('📦 Projects data extracted:', projectsData);
        //   if (Array.isArray(projectsData) && projectsData.length > 0) {
        //     console.log('📦 Projects loaded:', projectsData.length);
        //     setProjects(projectsData);
        //   } else {
        //     console.warn('⚠️ No projects data found or invalid format');
        //   }
  
        //   // Extract and set experiences
        //   const experiencesData = extractData(experiencesRes);
        //   if (Array.isArray(experiencesData) && experiencesData.length > 0) {
        //     console.log('📦 Experiences loaded:', experiencesData.length);
        //     setExperiences(experiencesData);
        //   }
  
        //   // Extract and set educations
          // const educationsData = extractData(educationsRes);
          // if (Array.isArray(educationsData) && educationsData.length > 0) {
          //   console.log('📦 Educations loaded:', educationsData.length);
          //   setEducations(educationsData);
          // }
  
        //   // Extract and set testimonials
        //   const testimonialsData = extractData(testimonialsRes);
        //   if (Array.isArray(testimonialsData) && testimonialsData.length > 0) {
        //     console.log('📦 Testimonials loaded:', testimonialsData.length);
        //     setTestimonials(testimonialsData);
        //   }
  
        //   // Extract and set blog posts
        //   const blogPostsData = extractData(blogPostsRes);
        //   console.log('📦 Blog posts data extracted:', blogPostsData);
        //   if (Array.isArray(blogPostsData) && blogPostsData.length > 0) {
        //     console.log('📦 Blog posts loaded:', blogPostsData.length);
        //     setBlogPosts(blogPostsData);
        //   } else {
        //     console.warn('⚠️ No blog posts data found or invalid format');
        //   }
  
        //   // Extract and set skills
        //   const skillsData = extractData(skillsRes);
        //   if (Array.isArray(skillsData) && skillsData.length > 0) {
        //     console.log('📦 Skills loaded:', skillsData.length);
        //     const frontend = skillsData.filter((s: Skill) => s.category === 'frontend');
        //     const backend = skillsData.filter((s: Skill) => s.category === 'backend');
        //     if (frontend.length > 0) setFrontendSkills(frontend);
        //     if (backend.length > 0) setBackendSkills(backend);
        //   }
  
        //   // Extract and set settings
          const settingsData = extractData(settingsRes);
          console.log('📦 Settings data extracted:', settingsData);
          if (settingsData && typeof settingsData === 'object' && Object.keys(settingsData).length > 0) {
            console.log('📦 Settings loaded from database');
            console.log('📸 Settings hero:', settingsData.hero);
            setSettings(settingsData);
          } else {
            console.warn('⚠️ No settings data found');
          }
  
        } catch (error) {
          console.error('❌ Failed to fetch portfolio data:', error);
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

  // ===== Get names and subtitles from settings =====
const getNamesAndSubtitles = () => {
  // Get the full title from settings
  const fullTitle = settings?.hero?.title || 'Amlakie';
  const fullSubtitle = settings?.hero?.subtitle || 'Software Engineer';
  
  // Split title by comma or space to get individual names
  // Expected format: "Designer, Developer, Amlakie" or "Designer Developer Amlakie"
  let names = [];
  let subtitles = [];
  
  // Try to parse title as comma-separated first
  if (fullTitle.includes(',')) {
    names = fullTitle.split(',').map(name => name.trim());
  } else {
    // If no commas, split by space
    names = fullTitle.split(' ').filter(name => name.trim());
  }
  
  // Parse subtitles (comma-separated)
  if (fullSubtitle.includes(',')) {
    subtitles = fullSubtitle.split(',').map(sub => sub.trim());
  } else {
    // If subtitles don't have commas, use the full subtitle for all
    subtitles = names.map(() => fullSubtitle);
  }
  
  // Ensure we have matching lengths
  while (subtitles.length < names.length) {
    subtitles.push(fullSubtitle);
  }
  
  return { names, subtitles };
};

const { names, subtitles } = getNamesAndSubtitles();

  // ===== Get names from settings =====
  // const names = settings?.hero?.title ? settings.hero.title.split(' ') : ['Amlakie', 'Developer', 'Designer', 'Creator'];

  // ===== Get profile images from settings - PRIORITIZE profileImagesData =====

  const getProfileImages = (): string[] => {
    if (!settings?.hero) return ['/images/profile1.jpg', '/images/profile2.jpg', '/images/profile3.jpg'];
    
    // FIRST: Check profileImagesData (this contains the actual image data as base64)
    if (settings.hero.profileImagesData && settings.hero.profileImagesData.length > 0) {
      console.log('📸 Using profileImagesData from database (base64):', settings.hero.profileImagesData.length);
      const urls = settings.hero.profileImagesData
        .map((img: any) => {
          let base64 = '';
          
          // Handle the nested base64 data structure
          if (img?.data?.$binary?.base64) {
            base64 = img.data.$binary.base64;
          } else if (img?.data?.base64) {
            base64 = img.data.base64;
          } else if (img?.data) {
            if (typeof img.data === 'string') {
              base64 = img.data;
            } else if (img.data.data) {
              if (typeof img.data.data === 'string') {
                base64 = img.data.data;
              } else if (img.data.data instanceof Buffer || Array.isArray(img.data.data)) {
                base64 = Buffer.from(img.data.data).toString('base64');
              }
            }
          }
          
          if (base64) {
            const contentType = img.contentType || 'image/jpeg';
            return `data:${contentType};base64,${base64}`;
          }
          return null;
        })
        .filter((url: string | null) => url !== null);
      
      if (urls.length > 0) {
        console.log('📸 Profile images converted to data URLs:', urls.length);
        return urls as string[];
      }
    }
    
    // SECOND: Check profileImages (URLs - fallback)
    if (settings.hero.profileImages && settings.hero.profileImages.length > 0) {
      console.log('📸 Using profileImages from database (URLs):', settings.hero.profileImages.length);
      return settings.hero.profileImages.map((img: string) => {
        if (img.startsWith('/uploads/')) {
          const base = process.env.NEXT_PUBLIC_API_URL || '';
          return `${base}${img}`;
        }
        return img;
      });
    }
    
    return ['/images/profile1.jpg', '/images/profile2.jpg', '/images/profile3.jpg'];
  };

  // ===== Get about image from settings - PRIORITIZE imageData =====
  const getAboutImage = (): string => {
    if (!settings?.about) return '/images/about4.jpg';
    
    // FIRST: Check imageData (this contains the actual image data as base64)
    if (settings.about.imageData) {
      console.log('📸 Using about imageData from database (base64)');
      let base64 = '';
      const img = settings.about.imageData;
      
      // Handle the nested base64 data structure
      if (img?.data?.$binary?.base64) {
        base64 = img.data.$binary.base64;
      } else if (img?.data?.base64) {
        base64 = img.data.base64;
      } else if (img?.data) {
        if (typeof img.data === 'string') {
          base64 = img.data;
        } else if (img.data.data) {
          if (typeof img.data.data === 'string') {
            base64 = img.data.data;
          } else if (img.data.data instanceof Buffer || Array.isArray(img.data.data)) {
            base64 = Buffer.from(img.data.data).toString('base64');
          }
        }
      }
      
      if (base64) {
        const contentType = img.contentType || 'image/jpeg';
        const dataUrl = `data:${contentType};base64,${base64}`;
        console.log('📸 About image converted to data URL');
        return dataUrl;
      }
    }
    
    // SECOND: Check image (URL - fallback)
    if (settings.about.image) {
      console.log('📸 Using about image from database (URL):', settings.about.image);
      if (settings.about.image.startsWith('/uploads/')) {
        const base = process.env.NEXT_PUBLIC_API_URL || '';
        return `${base}${settings.about.image}`;
      }
      if (settings.about.image.startsWith('/images/')) {
        return settings.about.image;
      }
      return settings.about.image;
    }
    
    return '/images/about4.jpg';
  };

  // Then use them:
  const profiles = getProfileImages();
  const aboutImage = getAboutImage();

  console.log('📸 Profile images count:', profiles.length);
  console.log('📸 First profile image preview:', profiles[0]?.substring(0, 100));
  console.log('📸 About image:', aboutImage?.substring(0, 100));

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

  return (
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
  );
};

export default Footer;