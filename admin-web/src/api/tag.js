import request from '../utils/request';
import { getToken } from '../utils/auth';

function authConfig() {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export function getTags() {
  return request.get('/tags');
}

export function createTag(payload) {
  return request.post('/admin/tags', payload, authConfig());
}

export function updateTag(id, payload) {
  return request.put(`/admin/tags/${id}`, payload, authConfig());
}

export function deleteTag(id) {
  return request.delete(`/admin/tags/${id}`, authConfig());
}
