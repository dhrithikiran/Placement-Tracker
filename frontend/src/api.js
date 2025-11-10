import axios from 'axios';

const BASE_URL = 'http://localhost:4000/api';

const api = {
  // ==================== STUDENTS ====================
  getStudents: () => axios.get(`${BASE_URL}/students`),
  getStudent: (id) => axios.get(`${BASE_URL}/students/${id}`),
  createStudent: (data) => axios.post(`${BASE_URL}/students`, data),
  updateStudent: (id, data) => axios.put(`${BASE_URL}/students/${id}`, data),
  deleteStudent: (id) => axios.delete(`${BASE_URL}/students/${id}`),

  // ==================== ACADEMIC RECORDS ====================
  getAcademicRecords: () => axios.get(`${BASE_URL}/academic-records`),
  createAcademicRecord: (data) => axios.post(`${BASE_URL}/academic-records`, data),
  updateAcademicRecord: (studentId, data) => axios.put(`${BASE_URL}/academic-records/${studentId}`, data),

  // ==================== COMPANIES ====================
  getCompanies: () => axios.get(`${BASE_URL}/companies`),
  createCompany: (data) => axios.post(`${BASE_URL}/companies`, data),

  // ==================== POSITIONS ====================
  getPositions: () => axios.get(`${BASE_URL}/positions`),
  createPosition: (data) => axios.post(`${BASE_URL}/positions`, data),

  // ==================== APPLICATIONS ====================
  getApplications: () => axios.get(`${BASE_URL}/applications`),
  applyForPosition: (data) => axios.post(`${BASE_URL}/applications`, data),

  // ==================== INTERVIEWS ====================
  getInterviews: () => axios.get(`${BASE_URL}/interviews`),
  scheduleInterview: (data) => axios.post(`${BASE_URL}/schedule_interview`, data),
  updateInterviewResult: (id, data) => axios.put(`${BASE_URL}/interviews/${id}`, data),
  deleteInterview: (id) => axios.delete(`${BASE_URL}/interviews/${id}`),

  // ==================== OFFERS ====================
  getOffers: () => axios.get(`${BASE_URL}/offers`),
  generateOffer: (data) => axios.post(`${BASE_URL}/generate_offer`, data),
  generateOfferByApplication: (applicationId) => axios.post(`${BASE_URL}/generate_offer/${applicationId}`),
  backfillOffersForPassed: () => axios.post(`${BASE_URL}/maintenance/generate_offers_for_passed`),
  acceptOffer: (id) => axios.put(`${BASE_URL}/offer/${id}/accept`),
  rejectOffer: (id) => axios.put(`${BASE_URL}/offer/${id}/reject`),

  // ==================== REPORTS ====================
  getBranchStats: () => axios.get(`${BASE_URL}/report/branch_stats`),
  getCompanyReport: () => axios.get(`${BASE_URL}/report/company`),
};

export default api;