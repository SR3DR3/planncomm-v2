// API Configuration
const config = {
  apiUrl: process.env.NODE_ENV === 'production' 
    ? 'https://planncomm-backend.onrender.com'
    : 'http://localhost:5000'
};

export default config;
