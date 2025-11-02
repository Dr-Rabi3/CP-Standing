import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token if available
// api.interceptors.request.use(
//   (config) => {
//     const token = localStorage.getItem('token');
//     if (token) {
//       config.headers.Authorization = `Bearer ${token}`;
//     }
//     return config;
//   },
//   (error) => {
//     return Promise.reject(error);
//   }
// );

// Training API
export const trainingApi = {
  /**
   * Get training by ID
   * @param {string} trainingId - The ID of the training to fetch
   * @returns {Promise<Object>} The training data
   */
  getTrainingById: async (trainingId) => {
    try {
      const response = await api.get(`/trainings/${trainingId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching training:', error);
      throw error;
    }
  },

  /**
   * Get all trainings
   * @returns {Promise<Array<Object>>} The training data
   */
  getAllTrainings: async () => {
    try {
      const response = await api.get(`/trainings`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching trainings:', error);
      throw error;
    }
  },
};

// Standings API
export const standingsApi = {
  /**
   * Get standings for a specific training sheet
   * @param {string} trainingId - The ID of the training
   * @param {string} sheetId - The ID of the sheet
   * @returns {Promise<Object>} The standings data
   */
  getSheetStandings: async (trainingId, sheetId) => {
    try {
      const response = await api.get(`/standings/trainings/${trainingId}/sheets/${sheetId}/standings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sheet standings:', error);
      throw error;
    }
  },

  /**
   * Get standings for a specific training contest
   * @param {string} trainingId - The ID of the training
   * @param {string} contestId - The ID of the contest
   * @returns {Promise<Object>} The standings data
   */
  getContestStandings: async (trainingId, contestId) => {
    try {
      const response = await api.get(`/standings/trainings/${trainingId}/contests/${contestId}/standings`);
      return response.data;
    } catch (error) {
      console.error('Error fetching contest standings:', error);
      throw error;
    }
  },

  /**
   * Get overall standings for a training (combines all sheets and contests)
   * @param {string} trainingId - The ID of the training
   * @param {Object} [options] - Optional parameters
   * @param {string} [options.coach] - Filter by coach name
   * @param {number} [options.minRating] - Minimum rating filter
   * @param {number} [options.maxRating] - Maximum rating filter
   * @param {string} [options.sortBy] - Sort by: 'solved', 'percentage', 'rating', 'name', or 'points' (default)
   * @returns {Promise<Object>} The overall standings data
   */
  getTrainingOverallStandings: async (trainingId, options = {}) => {
    try {
      const { coach, minRating, maxRating, sortBy } = options;
      const params = new URLSearchParams();
      
      if (coach) params.append('coach', coach);
      if (minRating !== undefined) params.append('minRating', minRating);
      if (maxRating !== undefined) params.append('maxRating', maxRating);
      if (sortBy) params.append('sortBy', sortBy);
      
      const queryString = params.toString();
      const url = `/standings/trainings/${trainingId}/overall${queryString ? `?${queryString}` : ''}`;
      
      const response = await api.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching training overall standings:', error);
      throw error;
    }
  },
};

export default api;