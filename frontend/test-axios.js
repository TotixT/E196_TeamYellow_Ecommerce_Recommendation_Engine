/* eslint-disable @typescript-eslint/no-require-imports */
 
const axios = require('axios');
 
const FormData = require('form-data');

const fd = new FormData();
fd.append('test', 'value');

const api = axios.create({
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(config => {
  if (config.data instanceof FormData) {
    if (config.headers && typeof config.headers.delete === 'function') {
      config.headers.delete('Content-Type');
    } else {
      delete config.headers['Content-Type'];
    }
  }
  console.log('Headers being sent:', config.headers);
  return config;
});

api.post('http://localhost:5000/api/v1/health', fd)
  .then(res => console.log('Success:', res.status))
  .catch(err => console.log('Error:', err.message));
