import { supabase } from './supabase'

const MAX_IMAGE_SIZE = 1024 * 1024 // 1 MB
const MAX_IMAGE_WIDTH = 1920

/**
 * Compress an image file to max 1MB / 1920px wide.
 * Returns the original file if it's not an image or already small enough.
 */
async function compressImage(file) {
  if (!file.type.startsWith('image/') || file.type === 'image/gif') return file
  if (file.size <= MAX_IMAGE_SIZE) return file

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const canvas = document.createElement('canvas')
      let { width, height } = img

      // Scale down if wider than max
      if (width > MAX_IMAGE_WIDTH) {
        height = Math.round(height * (MAX_IMAGE_WIDTH / width))
        width = MAX_IMAGE_WIDTH
      }

      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      ctx.drawImage(img, 0, 0, width, height)

      // Try progressively lower quality until under 1MB
      let quality = 0.85
      const tryCompress = () => {
        canvas.toBlob(
          (blob) => {
            if (blob.size > MAX_IMAGE_SIZE && quality > 0.3) {
              quality -= 0.1
              tryCompress()
            } else {
              resolve(new File([blob], file.name, { type: 'image/jpeg' }))
            }
          },
          'image/jpeg',
          quality
        )
      }
      tryCompress()
    }
    img.onerror = () => resolve(file) // fallback to original
    img.src = URL.createObjectURL(file)
  })
}

export async function uploadImage(file, bucket = 'post-images') {
  const compressed = await compressImage(file)
  const ext = compressed.type === 'image/jpeg' ? 'jpg' : file.name.split('.').pop()
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(filename, compressed)
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(filename)
  return data.publicUrl
}

export async function uploadFile(file, bucket = 'project-files') {
  const ext = file.name.split('.').pop()
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const { error } = await supabase.storage.from(bucket).upload(path, file)
  if (error) throw error

  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return { publicUrl: data.publicUrl, path }
}
