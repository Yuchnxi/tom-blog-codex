import axios from 'axios';
import { ElMessage } from 'element-plus';
import router from '../router';
import { getToken, removeToken } from './auth';

const request = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

request.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }
  return config;
});

request.interceptors.response.use(
  (response) => {
    const body = response.data;
    if (body?.code === 0) {
      return body.data;
    }
    const message = body?.message || '请求失败';
    ElMessage.error(message);
    return Promise.reject(new Error(message));
  },
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message || '网络异常';
    if (status === 401) {
      removeToken();
      if (router.currentRoute.value.path !== '/login') {
        router.replace({
          path: '/login',
          query: { redirect: router.currentRoute.value.fullPath },
        });
      }
    }
    ElMessage.error(message);
    return Promise.reject(error);
  }
);

export default request;
