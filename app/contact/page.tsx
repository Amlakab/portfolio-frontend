'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import { useTheme } from '@/lib/theme-context';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  FaMapMarker,
  FaPhone,
  FaEnvelope,
} from 'react-icons/fa';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Container,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  useMediaQuery,
} from '@mui/material';

export default function ContactPage() {
  const { theme } = useTheme();
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  const BASE_URL = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001/api';
  
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    name: '',
    subject: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textFieldStyle = {
    '& .MuiOutlinedInput-root': {
      backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
      color: theme === 'dark' ? '#ccd6f6' : '#333333',
      '& fieldset': {
        borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
      },
      '&:hover fieldset': {
        borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
      },
      '&.Mui-focused fieldset': {
        borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
      },
    },
    '& .MuiInputLabel-root': {
      color: theme === 'dark' ? '#a8b2d1' : '#666666',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: theme === 'dark' ? '#00ffff' : '#007bff',
    }
  };

  const selectStyle = {
    borderRadius: 1,
    backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
    color: theme === 'dark' ? '#ccd6f6' : '#333333',
    '& .MuiOutlinedInput-notchedOutline': {
      borderColor: theme === 'dark' ? '#334155' : '#e5e7eb',
    },
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: theme === 'dark' ? '#00ffff' : '#007bff',
    }
  };

  const labelStyle = {
    color: theme === 'dark' ? '#a8b2d1' : '#666666',
    '&.Mui-focused': {
      color: theme === 'dark' ? '#00ffff' : '#007bff',
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSelectChange = (e: any) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!formData.phone && !formData.email) {
      toast.error('Please provide either a phone number or email address', {
        position: "top-right",
        autoClose: 3000,
        theme: theme === 'dark' ? 'dark' : 'light',
      });
      setIsSubmitting(false);
      return;
    }
    
    try {
      const response = await fetch(`${BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success('Message sent successfully! We will get back to you soon.', {
          position: "top-right",
          autoClose: 3000,
          theme: theme === 'dark' ? 'dark' : 'light',
        });
        
        setFormData({
          phone: '',
          email: '',
          name: '',
          subject: '',
          message: ''
        });
      } else {
        toast.error(`Error: ${result.error || 'Failed to send message'}`, {
          position: "top-right",
          autoClose: 3000,
          theme: theme === 'dark' ? 'dark' : 'light',
        });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Network error. Please check your connection and try again.', {
        position: "top-right",
        autoClose: 3000,
        theme: theme === 'dark' ? 'dark' : 'light',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-br from-[#0a192f] to-[#112240] text-white' 
        : 'bg-gradient-to-br from-[#f0f0f0] to-[#ffffff] text-[#333333]'
    }`}>
      <Navbar />
      
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme={theme === 'dark' ? 'dark' : 'light'}
      />
      
      <div className="pt-16">
        <Box sx={{ 
          py: { xs: 4, sm: 6, md: 8 },
          textAlign: 'center',
          background: theme === 'dark' 
            ? 'linear-gradient(135deg, rgba(10, 25, 47, 0.8), rgba(17, 34, 64, 0.8))'
            : 'linear-gradient(135deg, rgba(255, 247, 237, 0.8), rgba(254, 202, 202, 0.8))'
        }}>
          <Container maxWidth="lg">
            <motion.div
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Typography 
                variant={isMobile ? "h4" : "h2"} 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme === 'dark' ? '#ccd6f6' : '#333333',
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
                }}
              >
                Contact Us
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  color: theme === 'dark' ? '#a8b2d1' : '#666666',
                  fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                  maxWidth: '600px',
                  mx: 'auto'
                }}
              >
                Have questions or feedback? We'd love to hear from you. Reach out to us and we'll get back to you as soon as possible.
              </Typography>
            </motion.div>
          </Container>
        </Box>

        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 10 } }}>
          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(3, 1fr)'
            },
            gap: { xs: 3, md: 4 },
            mb: { xs: 6, md: 8 }
          }}>
            {[
              { icon: <FaMapMarker />, title: 'Location', details: ['Addis Abeba, Ethiopia'] },
              { icon: <FaPhone />, title: 'Phone', details: ['+251 9 06 97 40 55'] },
              { icon: <FaEnvelope />, title: 'Email', details: ['Zelalem@gmail.com'] }
            ].map((info, index) => (
              <motion.div
                key={index}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
              >
                <Card sx={{ 
                  textAlign: 'center',
                  p: { xs: 3, sm: 4 },
                  borderRadius: 3,
                  backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                  border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                  boxShadow: theme === 'dark' 
                    ? '0 2px 8px rgba(0,0,0,0.3)' 
                    : '0 2px 8px rgba(0,0,0,0.08)',
                  height: '100%',
                  transition: 'all 0.3s',
                  '&:hover': {
                    boxShadow: theme === 'dark'
                      ? '0 8px 24px rgba(0, 255, 255, 0.15)'
                      : '0 8px 24px rgba(37, 99, 235, 0.15)'
                  }
                }}>
                  <CardContent>
                    <Box sx={{ 
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: { xs: 48, sm: 56 },
                      height: { xs: 48, sm: 56 },
                      borderRadius: '50%',
                      backgroundColor: theme === 'dark' ? 'rgba(255, 165, 0, 0.2)' : 'rgba(255, 165, 0, 0.1)',
                      mb: 2
                    }}>
                      <Box sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, color: '#f97316' }}>
                        {info.icon}
                      </Box>
                    </Box>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        fontWeight: 600,
                        color: theme === 'dark' ? '#ccd6f6' : '#333333',
                        mb: 1,
                        fontSize: { xs: '1rem', sm: '1.1rem' }
                      }}
                    >
                      {info.title}
                    </Typography>
                    {info.details.map((detail, i) => (
                      <Typography 
                        key={i}
                        variant="body2" 
                        sx={{ 
                          color: theme === 'dark' ? '#a8b2d1' : '#666666',
                          fontSize: { xs: '0.85rem', sm: '0.9rem' }
                        }}
                      >
                        {detail}
                      </Typography>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </Box>

          <Box sx={{ 
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              lg: '1fr 1fr'
            },
            gap: { xs: 4, lg: 6 }
          }}>
            <motion.div
              initial={{ x: -100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <Card sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: theme === 'dark' 
                  ? '0 4px 16px rgba(0,0,0,0.3)' 
                  : '0 4px 16px rgba(0,0,0,0.08)',
                backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                height: { xs: 300, sm: 350, md: 400 }
              }}>
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.869244319124!2d38.76321431536945!3d9.012326893541918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85f1a4b1f3b5%3A0x1c5b5b5b5b5b5b5b!2sAddis%20Ababa%2C%20Ethiopia!5e0!3m2!1sen!2set!4v1633080000000!5m2!1sen!2set"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                ></iframe>
              </Card>
            </motion.div>

            <motion.div
              initial={{ x: 100, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <Card sx={{ 
                p: { xs: 3, sm: 4 },
                borderRadius: 3,
                backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
                border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
                boxShadow: theme === 'dark' 
                  ? '0 4px 16px rgba(0,0,0,0.3)' 
                  : '0 4px 16px rgba(0,0,0,0.08)'
              }}>
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 'bold',
                    color: theme === 'dark' ? '#ccd6f6' : '#333333',
                    mb: 2,
                    fontSize: { xs: '1.25rem', sm: '1.5rem' }
                  }}
                >
                  Send us a Message
                </Typography>
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: theme === 'dark' ? '#a8b2d1' : '#666666',
                    mb: 4,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}
                >
                  We'll get back to you within 24 hours.
                </Typography>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <TextField
                    fullWidth
                    label="Full Name *"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    size="small"
                    sx={textFieldStyle}
                  />
                  
                  <TextField
                    fullWidth
                    label="Email or Phone *"
                    name="contact"
                    value={formData.email || formData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      if (value.includes('@')) {
                        setFormData({...formData, email: value, phone: ''});
                      } else {
                        setFormData({...formData, phone: value, email: ''});
                      }
                    }}
                    size="small"
                    sx={textFieldStyle}
                  />

                  <FormControl fullWidth size="small">
                    <InputLabel sx={labelStyle}>Subject *</InputLabel>
                    <Select
                      name="subject"
                      required
                      value={formData.subject}
                      onChange={handleSelectChange}
                      sx={selectStyle}
                      label="Subject *"
                    >
                      <MenuItem value="">Select Subject</MenuItem>
                      <MenuItem value="technical-support">Technical Support</MenuItem>
                      <MenuItem value="account-issues">Account Issues</MenuItem>
                      <MenuItem value="payment-issues">Payment Issues</MenuItem>
                      <MenuItem value="game-suggestions">Game Suggestions</MenuItem>
                      <MenuItem value="partnership">Partnership Opportunities</MenuItem>
                      <MenuItem value="other">Other</MenuItem>
                    </Select>
                  </FormControl>

                  <TextField
                    fullWidth
                    label="Your Message *"
                    name="message"
                    required
                    multiline
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    size="small"
                    sx={textFieldStyle}
                  />

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={isSubmitting}
                    sx={{
                      py: { xs: 1.5, sm: 2 },
                      borderRadius: 2,
                      background: theme === 'dark'
                        ? 'linear-gradient(135deg, #00ffff, #00b3b3)'
                        : 'linear-gradient(135deg, #f97316, #ef4444)',
                      fontSize: { xs: '0.9rem', sm: '1rem' },
                      fontWeight: 'bold',
                      '&:hover': {
                        background: theme === 'dark'
                          ? 'linear-gradient(135deg, #00b3b3, #008080)'
                          : 'linear-gradient(135deg, #ea580c, #dc2626)'
                      },
                      '&.Mui-disabled': {
                        background: theme === 'dark' ? '#334155' : '#e5e7eb',
                        color: theme === 'dark' ? '#94a3b8' : '#94a3b8'
                      }
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <CircularProgress size={20} color="inherit" sx={{ mr: 1 }} />
                        Sending...
                      </>
                    ) : (
                      'Send Message'
                    )}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </Box>

          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card sx={{ 
              mt: { xs: 6, md: 8 },
              p: { xs: 3, sm: 4 },
              borderRadius: 3,
              backgroundColor: theme === 'dark' ? '#0f172a80' : 'white',
              border: theme === 'dark' ? '1px solid #334155' : '1px solid #e5e7eb',
              boxShadow: theme === 'dark' 
                ? '0 2px 8px rgba(0,0,0,0.3)' 
                : '0 2px 8px rgba(0,0,0,0.08)'
            }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  fontWeight: 'bold',
                  color: theme === 'dark' ? '#ccd6f6' : '#333333',
                  mb: 2,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Response Time
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: theme === 'dark' ? '#a8b2d1' : '#666666',
                  fontSize: { xs: '0.9rem', sm: '1rem' },
                  lineHeight: 1.7
                }}
              >
                We typically respond to all inquiries within 24 hours. For urgent matters, 
                please call our support line during business hours (9 AM - 6 PM GMT+3).
              </Typography>
            </Card>
          </motion.div>
        </Container>
      </div>

      <Footer />
    </div>
  );
}