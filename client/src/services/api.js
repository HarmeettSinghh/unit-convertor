import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getProducts = async () => {
  const response = await api.get('/products');
  return response.data;
};

export const createProduct = async (productData) => {
  const response = await api.post('/products', productData);
  return response.data;
};

export const calculatePrice = async (calcData) => {
  const response = await api.post('/products/calculate', calcData);
  return response.data;
};

export const purchaseProduct = async (purchaseData) => {
  const response = await api.post('/products/purchase', purchaseData);
  return response.data;
};

export default api;
