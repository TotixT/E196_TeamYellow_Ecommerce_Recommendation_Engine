/* eslint-disable @typescript-eslint/no-require-imports, @typescript-eslint/no-unused-vars */
 
const axios = require('axios');
 
const FormData = require('form-data');
 
const fs = require('fs');

const api = axios.create();

// Create a dummy file
fs.writeFileSync('dummy.txt', 'test');
const fileStream = fs.createReadStream('dummy.txt');

// We will use a request interceptor just to inspect what axios generates
api.interceptors.request.use(config => {
  console.log('Data:', config.data);
  return config;
});

api.postForm('http://localhost:5000/test', {
  images: [fileStream]
}).catch(() => {});
