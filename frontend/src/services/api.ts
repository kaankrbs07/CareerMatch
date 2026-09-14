import axios from 'axios';

// Backend URL - Adjust to match your launchSettings.json (usually 5000-5200 for .NET)
const API_URL = 'http://localhost:5217/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface AuthResponse {
  token: string;
  role: string;
  userId: number;
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    roleName: string;
  }
}

export interface JobSeekerProfileDto {
  firstName: string;
  lastName: string;
  country?: string;
  city?: string;
  experienceYears?: number;
  description?: string;
  occupationId?: number;
  educationId?: number;
  // Add other fields as returned by GetJobSeekerProfileAsync
}

export interface EmployerProfileDto {
  firstName: string;
  lastName: string;
  companyName: string;
  email: string;
  phoneNumber?: string;
  country?: string;
  city?: string;
  address?: string;
  description?: string;
  industryId?: number;
}

export const authService = {
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data as AuthResponse;
  },
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    return response.data as AuthResponse;
  },
  changePassword: async (data: any) => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
  forgotPassword: async (email: string) => {
    const response = await api.post(`/auth/forgot-password?email=${email}`);
    return response.data;
  },
  verifyCode: async (email: string, code: string) => {
    const response = await api.post(`/auth/verify-code?email=${email}&code=${code}`);
    return response.data;
  },
  verifyEmail: async (email: string, code: string) => {
    const response = await api.post('/auth/verify-email', { email, code });
    return response.data;
  },
  resendVerification: async (email: string) => {
    const response = await api.post(`/auth/resend-verification-email?email=${email}`);
    return response.data;
  },
  resetPassword: async (data: any) => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },
};

export const profileService = {
  getJobSeeker: async () => {
    const response = await api.get('/profile/jobseeker');
    return response.data;
  },
  updateJobSeeker: async (data: JobSeekerProfileDto) => {
    const response = await api.put('/profile/jobseeker', data);
    return response.data;
  },
  getEmployer: async () => {
    const response = await api.get('/profile/employer');
    return response.data;
  },
  updateEmployer: async (data: EmployerProfileDto) => {
    const response = await api.put('/profile/employer', data);
    return response.data;
  }
}

export const cvService = {
  upload: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/cv/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
  getMyLatest: async () => {
    const response = await api.get('/cv/my-latest');
    return response.data; // { cvId, fileName, uploadedAt }
  },
  getMatch: async (cvId: string) => { // cvId is string (MongoDB ID)
    const response = await api.get(`/match/cv/${cvId}/top`);
    return response.data; // List of matched jobs
  }
};

export const jobService = {
  create: async (data: any) => {
    // Send as JSON instead of FormData
    const jobData = {
      title: data.title,
      descriptionText: data.descriptionText || '',
      tagsCsv: data.tagsCsv || '',
      location: data.location || '',
      jobType: data.jobType || '',
      salaryMin: data.salaryMin || 0,
      salaryMax: data.salaryMax || 0,
      currency: data.currency || '',
      occupation: data.occupation || ''
    };

    const response = await api.post('/jobposting', jobData);
    return response.data;
  },
  getAll: async (params?: any) => {
    // params: { keyword, location, jobType, minSalary, maxSalary, pageNumber, pageSize }
    const response = await api.get('/jobposting', { params });
    return response.data;
  },
  getEmployerStats: async () => {
    const response = await api.get('/jobposting/employer-stats');
    return response.data; // { activeJobs, totalApplications, totalViews }
  },
  getMyJobs: async () => {
    const response = await api.get('/jobposting/my-jobs');
    return response.data;
  },
  updateJob: async (id: string, data: any) => {
    const response = await api.put(`/jobposting/${id}`, data);
    return response.data;
  },
  deleteJob: async (id: string) => {
    const response = await api.delete(`/jobposting/${id}`);
    return response.data;
  }
}

export const applicationService = {
  apply: async (jobId: string) => {
    const response = await api.post(`/application/apply/${jobId}`);
    return response.data;
  },
  getStats: async () => {
    const response = await api.get('/application/stats');
    return response.data;
  },
  getMyApplications: async () => {
    const response = await api.get('/application/my-applications');
    return response.data;
  },
  getJobApplicants: async (jobId: string) => {
    const response = await api.get(`/application/job/${jobId}`);
    return response.data;
  },
  markViewed: async (applicationId: number) => {
    const response = await api.post(`/application/${applicationId}/mark-viewed`);
    return response.data;
  },
  approveApplication: async (applicationId: number) => {
    const response = await api.put(`/application/${applicationId}/approve`);
    return response.data;
  },
  rejectApplication: async (applicationId: number) => {
    const response = await api.put(`/application/${applicationId}/reject`);
    return response.data;
  },
  withdrawApplication: async (applicationId: number) => {
    const response = await api.put(`/application/${applicationId}/withdraw`);
    return response.data;
  }
}


export const notificationService = {
  getMyNotifications: async (pageNumber: number = 1, pageSize: number = 20) => {
    const response = await api.get('/notification', {
      params: { pageNumber, pageSize }
    });
    return response.data; // { notifications: Notification[], pagination: {...} }
  },
  getUnreadCount: async () => {
    const response = await api.get('/notification/unread-count');
    return response.data; // { count: number }
  },
  markAsRead: async (id: number) => {
    const response = await api.put(`/notification/${id}/read`);
    return response.data;
  },
  markAllAsRead: async () => {
    const response = await api.put('/notification/read-all');
    return response.data;
  },
  deleteNotification: async (id: number) => {
    const response = await api.delete(`/notification/${id}`);
    return response.data;
  },
  hasSubmittedFeedback: async () => {
    const response = await api.get('/notification/has-submitted-feedback');
    return response.data; // { hasSubmitted: boolean }
  },
  submitFeedback: async (data: { type: string; message: string; rating: number }) => {
    const response = await api.post('/notification/feedback', data);
    return response.data;
  }
};

export const matchesService = {
  recommendJobs: async (topK: number = 10) => {
    const response = await api.get(`/matches/recommend-jobs?topK=${topK}`);
    return response.data; // [{ job, score, details }, ...]
  },
  findCandidates: async (jobId: string, topK: number = 10) => {
    const response = await api.get(`/matches/find-candidates/${jobId}?topK=${topK}`);
    return response.data; // [{ user, score, details }, ...]
  }
};

export const commonService = {
  getOccupations: async () => {
    const response = await api.get('/occupation');
    return response.data;
  },
  getIndustries: async () => {
    const response = await api.get('/industry');
    return response.data;
  },
  getEducationLevels: async () => {
    const response = await api.get('/educationLevel');
    return response.data;
  },
  getRoles: async () => {
    const response = await api.get('/role');
    return response.data;
  }
}

export const savedJobService = {
  save: async (jobId: string) => {
    const response = await api.post(`/savedjob/${jobId}`);
    return response.data;
  },
  unsave: async (jobId: string) => {
    const response = await api.delete(`/savedjob/${jobId}`);
    return response.data;
  },
  getSavedJobs: async () => {
    const response = await api.get('/savedjob');
    return response.data;
  },
  getSavedJobIds: async () => {
    const response = await api.get('/savedjob/ids');
    return response.data; // string[]
  }
};

export const chatService = {
  getContacts: async () => {
    const response = await api.get('/chat/contacts');
    return response.data;
  },
  getMessages: async (otherUserId: number) => {
    const response = await api.get(`/chat/messages/${otherUserId}`);
    return response.data;
  },
  getUnreadCount: async () => {
    const response = await api.get('/chat/unread-count');
    return response.data; // { count: number }
  },
  markAsRead: async (senderId: number) => {
    await api.post(`/chat/mark-read/${senderId}`);
  },
  deleteMessage: async (messageId: string) => {
    await api.delete(`/chat/messages/${messageId}`);
  }
};

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },
  getUsers: async () => {
    const response = await api.get('/users');
    return response.data;
  },
  // Industry Management
  createIndustry: async (data: any) => {
    const response = await api.post('/industry', data);
    return response.data;
  },
  updateIndustry: async (id: number, data: any) => {
    const response = await api.put(`/industry/${id}`, data);
    return response.data;
  },
  deleteIndustry: async (id: number) => {
    await api.delete(`/industry/${id}`);
  },
  // Occupation Management
  createOccupation: async (data: any) => {
    const response = await api.post('/occupation', data);
    return response.data;
  },
  updateOccupation: async (id: number, data: any) => {
    const response = await api.put(`/occupation/${id}`, data);
    return response.data;
  },
  deleteOccupation: async (id: number) => {
    await api.delete(`/occupation/${id}`);
  },
  // Education Level Management
  createEducationLevel: async (data: any) => {
    const response = await api.post('/educationLevel', data);
    return response.data;
  },
  updateEducationLevel: async (id: number, data: any) => {
    const response = await api.put(`/educationLevel/${id}`, data);
    return response.data;
  },
  deleteEducationLevel: async (id: number) => {
    await api.delete(`/educationLevel/${id}`);
  }
};

export default api;
