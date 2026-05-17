export function formatDate(value) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  const pad = (num) => String(num).padStart(2, '0');
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
  ].join('-') + ' ' + [
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join(':');
}

export function toArticlePayload(form) {
  return {
    title: form.title.trim(),
    slug: form.slug.trim(),
    cover: form.cover.trim(),
    content: form.content,
    categoryId: form.categoryId,
    tagIds: form.tagIds,
    isPublished: form.isPublished ? 1 : 0,
  };
}
