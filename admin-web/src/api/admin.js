import request from '../utils/request';

export function login(payload) {
  return request.post('/admin/login', payload);
}

export function getAdminInfo() {
  return request.get('/admin/info');
}
