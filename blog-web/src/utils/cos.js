/**
 * 给 COS 图片 URL 加上压缩参数
 * @param {string} url - 原始图片 URL
 * @param {object} options - 处理选项
 * @param {number} options.width - 缩放宽度,默认 800
 * @param {number} options.quality - 压缩质量 1-100,默认 80
 * @param {string} options.format - 输出格式,默认 webp
 * @returns {string} 处理后的 URL
 */
export function cosThumb(url, options = {}) {
  if (!url) return ''

  // 非 COS 图(本地上传 fallback)直接返回
  if (!url.includes('myqcloud.com')) return url

  const { width = 800, quality = 80, format = 'webp' } = options

  // 如果 URL 已经带 ? 参数,用 & 续上,否则用 ?
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}imageMogr2/thumbnail/${width}x/format/${format}/quality/${quality}`
}
