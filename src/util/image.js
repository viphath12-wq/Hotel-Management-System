import configurl from './configurl'

export const resolveImageUrl = (image) => {
  if (!image) return ''
  if (typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://'))) {
    return image
  }
  return `${configurl.image_path}${image}`
}
