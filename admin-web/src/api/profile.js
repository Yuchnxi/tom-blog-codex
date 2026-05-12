import request from '../utils/request';

export function getPublicProfile() {
  return request.get('/profile');
}

export function getProfile() {
  return request.get('/admin/profile');
}

export function updateProfile(payload) {
  return request.put('/admin/profile', payload);
}
