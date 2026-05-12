import request from '../utils/request';

export function getArticles(params) {
  return request.get('/admin/articles', { params });
}

export function getArticle(id) {
  return request.get(`/admin/articles/${id}`);
}

export function createArticle(payload) {
  return request.post('/admin/articles', payload);
}

export function updateArticle(id, payload) {
  return request.put(`/admin/articles/${id}`, payload);
}

export function deleteArticle(id) {
  return request.delete(`/admin/articles/${id}`);
}

export function toggleArticlePublish(id, isPublished) {
  return request.patch(`/admin/articles/${id}/publish`, { isPublished });
}

export function uploadImage(file) {
  const formData = new FormData();
  formData.append('file', file);
  return request.post('/admin/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}
