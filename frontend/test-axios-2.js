const axios = require('axios');
const FormData = require('form-data');

const fd = new FormData();
fd.append('test', 'value');

const api = axios.create({
  headers: {
    'Content-Type': 'multipart/form-data'
  }
});

api.interceptors.request.use(config => {
  console.log('Headers being sent:', config.headers);
  return config;
});

api.post('http://localhost:5000/api/v1/health', fd)
  .then(res => console.log('Success:', res.status))
  .catch(err => console.log('Error:', err.message));
