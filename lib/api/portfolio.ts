import api from '@/app/utils/api';

export const portfolioApi = {
  // Public
  getProjects: (params?: any) => api.get('/portfolio/projects', { params }),
  getExperiences: () => api.get('/portfolio/experiences'),
  getEducations: () => api.get('/portfolio/educations'),
  getTestimonials: (params?: any) => api.get('/portfolio/testimonials', { params }),
  getBlogPosts: (params?: any) => api.get('/portfolio/blog', { params }),
  getBlogPost: (slug: string) => api.get(`/portfolio/blog/${slug}`),
  getSkills: () => api.get('/portfolio/skills'),
  getSettings: () => api.get('/portfolio/settings'),

  // Admin – Projects
  getProjectsAdmin: (params?: any) => api.get('/admin/portfolio/projects', { params }),
  createProject: (data: FormData) =>
    api.post('/admin/portfolio/projects', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProject: (id: string, data: FormData) =>
    api.put(`/admin/portfolio/projects/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteProject: (id: string) => api.delete(`/admin/portfolio/projects/${id}`),
  toggleFeatured: (id: string) => api.patch(`/admin/portfolio/projects/${id}/featured`),

  // Admin – Experiences
  getExperiencesAdmin: (params?: any) => api.get('/admin/portfolio/experiences', { params }),
  createExperience: (data: any) => api.post('/admin/portfolio/experiences', data),
  updateExperience: (id: string, data: any) => api.put(`/admin/portfolio/experiences/${id}`, data),
  deleteExperience: (id: string) => api.delete(`/admin/portfolio/experiences/${id}`),

  // Admin – Educations
  getEducationsAdmin: (params?: any) => api.get('/admin/portfolio/educations', { params }),
  createEducation: (data: any) => api.post('/admin/portfolio/educations', data),
  updateEducation: (id: string, data: any) => api.put(`/admin/portfolio/educations/${id}`, data),
  deleteEducation: (id: string) => api.delete(`/admin/portfolio/educations/${id}`),

  // Admin – Testimonials
  getTestimonialsAdmin: (params?: any) => api.get('/admin/portfolio/testimonials', { params }),
  createTestimonial: (data: FormData) =>
    api.post('/admin/portfolio/testimonials', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateTestimonial: (id: string, data: FormData) =>
    api.put(`/admin/portfolio/testimonials/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteTestimonial: (id: string) => api.delete(`/admin/portfolio/testimonials/${id}`),
  toggleTestimonialFeatured: (id: string) => api.patch(`/admin/portfolio/testimonials/${id}/featured`),

  // Admin – Blog
  getBlogPostsAdmin: (params?: any) => api.get('/admin/portfolio/blog', { params }),
  createBlogPost: (data: FormData) =>
    api.post('/admin/portfolio/blog', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateBlogPost: (id: string, data: FormData) =>
    api.put(`/admin/portfolio/blog/${id}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  deleteBlogPost: (id: string) => api.delete(`/admin/portfolio/blog/${id}`),
  togglePublish: (id: string) => api.patch(`/admin/portfolio/blog/${id}/publish`),

  // Admin – Skills
  getSkillsAdmin: (params?: any) => api.get('/admin/portfolio/skills', { params }),
  createSkill: (data: any) => api.post('/admin/portfolio/skills', data),
  updateSkill: (id: string, data: any) => api.put(`/admin/portfolio/skills/${id}`, data),
  deleteSkill: (id: string) => api.delete(`/admin/portfolio/skills/${id}`),

  // Admin – Settings
  getSettingsAdmin: () => api.get('/admin/portfolio/settings'),
  updateSettings: (data: FormData) =>
    api.put('/admin/portfolio/settings', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default portfolioApi;