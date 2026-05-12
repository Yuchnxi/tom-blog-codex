import axios from 'axios';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.response.use((response) => {
  const body = response.data;
  if (body?.code === 0) {
    return body.data;
  }

  return Promise.reject(new Error(body?.message || '请求失败'));
});

export default request;
