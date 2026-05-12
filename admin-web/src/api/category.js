import request from '../utils/request';
import { getToken } from '../utils/auth';

function authConfig() {
  const token = getToken();
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export function getCategories() {
  return request.get('/categories');
}

export function createCategory(payload) {
  return request.post('/admin/categories', payload, authConfig());
}

export function updateCategory(id, payload) {
  return request.put(`/admin/categories/${id}`, payload, authConfig());
}

export function deleteCategory(id) {
  return request.delete(`/admin/categories/${id}`, authConfig());
}
