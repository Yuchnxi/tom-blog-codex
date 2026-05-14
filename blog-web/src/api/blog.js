import request from './request';

export function getArticles(params) {
  return request.get('/articles', { params });
}

export function getArticle(id) {
  return request.get(`/articles/${id}`);
}

export function recordArticleView(id) {
  return request.post(`/articles/${id}/view`);
}

export function getCategories() {
  return request.get('/categories');
}

export function getTags() {
  return request.get('/tags');
}

export function getProfile() {
  return request.get('/profile');
}
