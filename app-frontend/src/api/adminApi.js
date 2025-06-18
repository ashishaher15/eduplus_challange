import axios from 'axios';
import { API_BASE } from '../config';

const adminApi = {
  // User management
  getAllUsers: async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/users`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch users' };
    }
  },
  
  getUserById: async (userId) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/users/${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch user details' };
    }
  },
  
  createUser: async (userData) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/users`, userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create user' };
    }
  },

  // Store management
  getAllStores: async () => {
    try {
      const response = await axios.get(`${API_BASE}/admin/stores`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch stores' };
    }
  },
  
  createStore: async (storeData) => {
    try {
      const response = await axios.post(`${API_BASE}/admin/stores`, storeData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to create store' };
    }
  },
  
  getStoreByOwnerId: async (ownerId) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/stores/owner/${ownerId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch store details' };
    }
  },
  
  getStoreRatingUsers: async (storeId) => {
    try {
      const response = await axios.get(`${API_BASE}/admin/stores/${storeId}/ratings/users`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Failed to fetch rating users' };
    }
  },
};

export default adminApi;