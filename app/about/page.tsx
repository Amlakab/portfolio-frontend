'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import Navbar from '@/components/ui/Navbar';
import Footer from '@/components/ui/Footer';
import {
  FaUsers,
  FaLeaf,
  FaClock,
  FaStar,
  FaAward,
  FaHeart,
  FaCoffee,
  FaUtensils,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaLinkedin,
} from 'react-icons/fa';

const images = {
  aboutHero: '/images/about-hero.png',
  team: '/images/team.jpg',
  mission: '/images/about.png',
  values: '/images/values.jpg',
  facility1: '/images/facility1.jpg',
  facility2: '/images/facility2.jpg',
  timeline: '/images/timeline.jpg',
  team1: '/images/team1.jpg',
  team2: '/images/team2.jpg',
  team3: '/images/team3.jpg',
};

const teamMembers = [
  {
    name: 'Sarah Johnson',
    role: 'Head Chef',
    bio: 'With 15+ years of culinary experience, Sarah leads our kitchen with passion and creativity.',
    image: images.team1,
  },
  {
    name: 'Michael Chen',
    role: 'Operations Manager',
    bio: 'Michael ensures smooth operations and excellent customer service every day.',
    image: images.team2,
  },
  {
    name: 'Elena Rodriguez',
    role: 'Nutrition Specialist',
    bio: 'Elena crafts our healthy menu options with nutritional expertise and care.',
    image: images.team3,
  },
  {
    name: 'David Wilson',
    role: 'Customer Experience',
    bio: 'David focuses on creating memorable dining experiences for every guest.',
    image: images.team1,
  },
];

const values = [
  {
    icon: <FaLeaf />,
    title: 'Freshness First',
    description: 'We use only the freshest ingredients, sourced locally whenever possible.',
  },
  {
    icon: <FaHeart />,
    title: 'Community Focus',
    description: 'We believe in building strong relationships with our campus community.',
  },
  {
    icon: <FaStar />,
    title: 'Excellence',
    description: 'Every meal is prepared with attention to detail and commitment to quality.',
  },
  {
    icon: <FaClock />,
    title: 'Efficiency',
    description: 'We respect your time with quick service without compromising on quality.',
  },
  {
    icon: <FaCoffee />,
    title: 'Hospitality',
    description: 'Warm, friendly service that makes you feel at home.',
  },
  {
    icon: <FaAward />,
    title: 'Sustainability',
    description: 'Committed to eco-friendly practices and reducing our environmental impact.',
  },
];

const timelineEvents = [
  { year: '2010', title: 'Campus Café Founded', description: 'Started as a small coffee shop in the student center.' },
  { year: '2013', title: 'Expanded Menu', description: 'Added full lunch and dinner options to serve more students.' },
  { year: '2016', title: 'Renovation Completed', description: 'Major renovation to create our modern dining space.' },
  { year: '2019', title: 'Online Ordering', description: 'Launched our online ordering system for convenience.' },
  { year: '2022', title: 'Sustainability Award', description: 'Received campus award for environmental initiatives.' },
  { year: '2024', title: 'Digital Transformation', description: 'Implemented new cafeteria management system.' },
];

export default function AboutPage() {
  const { theme } = useTheme();

  // Auto-rotate team members
  useEffect(() => {
    const interval = setInterval(() => {
      // Removed unused setActiveTeam
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 overflow-x-hidden ${
      theme === 'dark' 
        ? 'bg-gradient-to-b from-[#0a192f] to-[#112240] text-white' 
        : 'bg-gradient-to-b from-gray-50 to-white text-gray-900'
    }`}>
      <Navbar />
      
      <div className="pt-16">
        {/* Hero Section */}
        <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
          <div className="absolute inset-0 z-0">
            <Image
              src={images.aboutHero}
              alt="About Campus Café"
              fill
              className="object-cover"
              priority
            />
            <div className={`absolute inset-0 ${
              theme === 'dark' ? 'bg-black/70' : 'bg-black/50'
            }`}></div>
          </div>
          
          <div className="container mx-auto px-4 relative z-10">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 text-white">
                Our Story
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 max-w-3xl mx-auto px-4">
                Serving the campus community with love, quality, and innovation since 2010.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Our Story Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="relative h-64 sm:h-80 md:h-96 rounded-2xl overflow-hidden shadow-2xl"
              >
                <Image
                  src={images.mission}
                  alt="Campus Café Interior"
                  fill
                  className="object-cover"
                />
              </motion.div>
              
              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  More Than Just Food
                </h2>
                <div className="space-y-3 sm:space-y-4">
                  <p className={`text-base sm:text-lg ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Founded in 2010, <span className="font-semibold text-orange-500">Campus Café</span> began as a small coffee shop 
                    with a big vision: to create a welcoming space where students, faculty, and staff could 
                    gather, refuel, and connect.
                  </p>
                  <p className={`text-base sm:text-lg ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    What started as a simple coffee counter has grown into a full-service cafeteria, 
                    serving thousands of meals daily while maintaining our commitment to quality, 
                    community, and sustainability.
                  </p>
                  <p className={`text-base sm:text-lg ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    Today, we're more than just a dining facility—we're a campus landmark where 
                    memories are made, friendships are formed, and great food brings people together.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Mission & Vision */}
        <section className={`py-12 sm:py-16 md:py-20 px-4 ${
          theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
        }`}>
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 lg:gap-12">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl p-6 sm:p-8 text-white shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className="p-2 sm:p-3 bg-white/20 rounded-full">
                    <FaStar className="text-xl sm:text-2xl" />
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold">Our Mission</h3>
                </div>
                <p className="text-base sm:text-lg mb-4 sm:mb-6">
                  To nourish our campus community with delicious, affordable, and nutritious meals 
                  served in a welcoming environment that fosters connection and well-being.
                </p>
                <ul className="space-y-2 sm:space-y-3">
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full"></span>
                    Provide fresh, high-quality food daily
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full"></span>
                    Create an inclusive and welcoming space
                  </li>
                  <li className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="w-1.5 sm:w-2 h-1.5 sm:h-2 bg-white rounded-full"></span>
                    Support sustainable and local suppliers
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 1, delay: 0.2 }}
                viewport={{ once: true }}
                className={`rounded-2xl p-6 sm:p-8 shadow-2xl ${
                  theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-4 sm:mb-6">
                  <div className={`p-2 sm:p-3 rounded-full ${
                    theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}>
                    <FaUsers className="text-xl sm:text-2xl text-orange-500" />
                  </div>
                  <h3 className={`text-2xl sm:text-3xl font-bold ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    Our Vision
                  </h3>
                </div>
                <p className={`text-base sm:text-lg mb-4 sm:mb-6 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  To be the heart of campus life—a place where every member of our community feels 
                  valued, nourished, and inspired to achieve their full potential.
                </p>
                <div className="space-y-3 sm:space-y-4">
                  <div className={`p-3 sm:p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-bold mb-1 sm:mb-2 text-sm sm:text-base ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Community Hub
                    </h4>
                    <p className={`text-sm sm:text-base ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Creating spaces for connection, collaboration, and celebration
                    </p>
                  </div>
                  <div className={`p-3 sm:p-4 rounded-lg ${
                    theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'
                  }`}>
                    <h4 className={`font-bold mb-1 sm:mb-2 text-sm sm:text-base ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Innovation in Dining
                    </h4>
                    <p className={`text-sm sm:text-base ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Continuously improving our menu and service through technology and creativity
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Our Values
              </h2>
              <p className={`text-base sm:text-lg md:text-xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              } max-w-3xl mx-auto px-4`}>
                The principles that guide everything we do
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className={`p-5 sm:p-6 rounded-xl ${
                    theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                  } shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-3 sm:mb-4 ${
                    theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                  }`}>
                    <div className="text-lg sm:text-xl text-orange-500">
                      {value.icon}
                    </div>
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-2 sm:mb-3 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {value.title}
                  </h3>
                  <p className={`text-sm sm:text-base ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}>
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className={`py-12 sm:py-16 md:py-20 px-4 ${
          theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
        }`}>
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Our Journey
              </h2>
              <p className={`text-base sm:text-lg md:text-xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                14 years of serving the campus community
              </p>
            </motion.div>

            <div className="relative">
              {/* Timeline line - hidden on mobile */}
              <div className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 w-1 h-full ${
                theme === 'dark' ? 'bg-orange-500' : 'bg-orange-400'
              }`}></div>

              {/* Mobile timeline line */}
              <div className={`md:hidden absolute left-4 top-0 w-1 h-full ${
                theme === 'dark' ? 'bg-orange-500' : 'bg-orange-400'
              }`}></div>

              {/* Timeline events */}
              <div className="space-y-6 sm:space-y-8 md:space-y-12">
                {timelineEvents.map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className={`relative flex flex-col md:flex-row items-start md:items-center w-full ${
                      index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
                    }`}
                  >
                    {/* Mobile layout */}
                    <div className="md:hidden w-full pl-12">
                      <div className={`p-4 sm:p-6 rounded-xl ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      } shadow-lg`}>
                        <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-2 sm:mb-3 ${
                          theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                        }`}>
                          <span className={`text-base sm:text-lg font-bold ${
                            theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                          }`}>
                            {event.year}
                          </span>
                        </div>
                        <h3 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {event.title}
                        </h3>
                        <p className={`text-sm sm:text-base ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`}>
                          {event.description}
                        </p>
                      </div>
                    </div>

                    {/* Desktop layout */}
                    <div className={`hidden md:block w-5/12 ${
                      index % 2 === 0 ? 'pr-8 text-right' : 'pl-8'
                    }`}>
                      <div className={`p-6 rounded-xl ${
                        theme === 'dark' ? 'bg-gray-800' : 'bg-white'
                      } shadow-lg`}>
                        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 ${
                          theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                        }`}>
                          <span className={`text-lg font-bold ${
                            theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                          }`}>
                            {event.year}
                          </span>
                        </div>
                        <h3 className={`text-xl font-bold mb-2 ${
                          theme === 'dark' ? 'text-white' : 'text-gray-900'
                        }`}>
                          {event.title}
                        </h3>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          {event.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Timeline dot - mobile */}
                    <div className={`md:hidden absolute left-0 top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-4 ${
                      theme === 'dark' ? 'bg-gray-900 border-orange-500' : 'bg-white border-orange-400'
                    }`}></div>

                    {/* Timeline dot - desktop */}
                    <div className={`hidden md:block absolute left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full border-4 ${
                      theme === 'dark' ? 'bg-gray-900 border-orange-500' : 'bg-white border-orange-400'
                    }`}></div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Meet Our Team
              </h2>
              <p className={`text-base sm:text-lg md:text-xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              } max-w-3xl mx-auto px-4`}>
                Passionate professionals dedicated to making your dining experience exceptional
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ y: 50, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -5 }}
                  className="text-center"
                >
                  <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-64 lg:h-64 mx-auto mb-3 sm:mb-4 rounded-full overflow-hidden shadow-xl">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <h3 className={`text-lg sm:text-xl font-bold mb-1 ${
                    theme === 'dark' ? 'text-white' : 'text-gray-900'
                  }`}>
                    {member.name}
                  </h3>
                  <p className={`mb-2 sm:mb-3 text-sm sm:text-base ${
                    theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                  } font-medium`}>
                    {member.role}
                  </p>
                  <p className={`text-sm sm:text-base ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  } px-2`}>
                    {member.bio}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Facilities & Sustainability */}
        <section className={`py-12 sm:py-16 md:py-20 px-4 ${
          theme === 'dark' ? 'bg-gray-900/50' : 'bg-gray-100'
        }`}>
          <div className="container mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
              <motion.div
                initial={{ x: -100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
              >
                <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Our Commitment
                </h2>
                <div className="space-y-4 sm:space-y-6">
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Modern Facilities
                    </h3>
                    <p className={`text-sm sm:text-base ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Our cafeteria features state-of-the-art kitchen equipment, comfortable seating 
                      areas, free Wi-Fi, and ample charging stations to support your study sessions.
                    </p>
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Sustainability
                    </h3>
                    <p className={`text-sm sm:text-base ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      We're committed to reducing our environmental impact through composting, 
                      recycling, using eco-friendly packaging, and sourcing from local suppliers.
                    </p>
                  </div>
                  <div>
                    <h3 className={`text-lg sm:text-xl font-bold mb-1 sm:mb-2 ${
                      theme === 'dark' ? 'text-white' : 'text-gray-900'
                    }`}>
                      Accessibility
                    </h3>
                    <p className={`text-sm sm:text-base ${
                      theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Our facility is fully accessible, with accommodations for all dietary needs 
                      and a commitment to inclusive pricing for students.
                    </p>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ x: 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                transition={{ duration: 1 }}
                viewport={{ once: true }}
                className="grid grid-cols-2 gap-2 sm:gap-4"
              >
                <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={images.facility1}
                    alt="Modern Kitchen"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={images.facility2}
                    alt="Dining Area"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={images.values}
                    alt="Sustainable Practices"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 rounded-xl overflow-hidden shadow-xl">
                  <Image
                    src={images.team}
                    alt="Team Collaboration"
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Contact Info */}
        <section className="py-12 sm:py-16 md:py-20 px-4">
          <div className="container mx-auto max-w-7xl">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mb-8 sm:mb-12"
            >
              <h2 className={`text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Get In Touch
              </h2>
              <p className={`text-base sm:text-lg md:text-xl ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We'd love to hear from you
              </p>
            </motion.div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-3 sm:mb-4 ${
                  theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                }`}>
                  <FaMapMarkerAlt className="text-orange-500 text-lg sm:text-xl" />
                </div>
                <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Location
                </h3>
                <p className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Main Campus Building A<br />
                  Student Center, 1st Floor<br />
                  University Avenue<br />
                  Campus City, CC 12345
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-3 sm:mb-4 ${
                  theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                }`}>
                  <FaPhone className="text-orange-500 text-lg sm:text-xl" />
                </div>
                <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Contact
                </h3>
                <p className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Phone: (123) 456-7890<br />
                  Email: info@campuscafe.edu<br />
                  Fax: (123) 456-7891
                </p>
              </motion.div>

              <motion.div
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-center sm:col-span-2 lg:col-span-1"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full mb-3 sm:mb-4 ${
                  theme === 'dark' ? 'bg-orange-500/20' : 'bg-orange-100'
                }`}>
                  <FaClock className="text-orange-500 text-lg sm:text-xl" />
                </div>
                <h3 className={`text-base sm:text-lg font-bold mb-1 sm:mb-2 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>
                  Hours
                </h3>
                <p className={`text-sm sm:text-base ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  Monday - Friday: 7:00 AM - 8:00 PM<br />
                  Saturday: 8:00 AM - 6:00 PM<br />
                  Sunday: 9:00 AM - 5:00 PM<br />
                  Holiday hours may vary
                </p>
              </motion.div>
            </div>

            {/* Social Media */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
              className="text-center mt-8 sm:mt-12"
            >
              <h3 className={`text-xl sm:text-2xl font-bold mb-4 sm:mb-6 ${
                theme === 'dark' ? 'text-white' : 'text-gray-900'
              }`}>
                Connect With Us
              </h3>
              <div className="flex justify-center gap-4 sm:gap-6 flex-wrap">
                {[FaFacebook, FaTwitter, FaInstagram, FaLinkedin].map((Icon, index) => (
                  <motion.a
                    key={index}
                    href="#"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className={`p-2 sm:p-3 rounded-full ${
                      theme === 'dark' 
                        ? 'bg-gray-800 hover:bg-gray-700 text-white' 
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                    } transition-colors duration-300`}
                  >
                    <Icon className="text-lg sm:text-xl" />
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section className={`py-12 sm:py-16 md:py-20 px-4 ${
          theme === 'dark' 
            ? 'bg-gradient-to-r from-orange-600 to-red-600' 
            : 'bg-gradient-to-r from-orange-500 to-red-500'
        }`}>
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ duration: 1 }}
              viewport={{ once: true }}
            >
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white px-4">
                Experience Campus Café
              </h2>
              <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8 text-white/90 max-w-2xl mx-auto px-4">
                Visit us today for a delicious meal, or explore our menu online. 
                We can't wait to serve you!
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
                <Link
                  href="/menu"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 bg-white hover:bg-gray-100 text-orange-600 font-bold rounded-lg text-base sm:text-lg transition-colors duration-300 shadow-lg"
                >
                  View Our Menu
                </Link>
                <Link
                  href="/contact"
                  className="px-6 sm:px-8 py-2.5 sm:py-3 border-2 border-white hover:bg-white/10 text-white font-bold rounded-lg text-base sm:text-lg transition-colors duration-300"
                >
                  Contact Us
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}