import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URI  || "https://bytelink-url-shortener-1.onrender.com";
 console.log("VITE_API_URI =", import.meta.env.VITE_API_URI);
console.log("baseURL =", baseURL); 
const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export function attachToken(token) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export default api;
