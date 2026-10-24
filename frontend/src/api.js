import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV
    ? 'http://localhost:5000/api'
    : 'https://ecommerce-fullstack-design-znwg.onrender.com/api');

const API = axios.create({
  baseURL: API_BASE_URL,
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common.Authorization;
  }
};

export default API;
