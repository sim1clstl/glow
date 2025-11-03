// pages/api/upload.js
import { put } from '@vercel/blob'

export const config = { api: { bodyParser: { sizeLimit: '10mb' } } }

export default async function handler(req, res) {
  try {
    const { dataUrl, pathBase } = JSON.parse(req.body || '{}')
    if (!dataUrl || !pathBase) return res.status(400).json({ error: 'Missing dataUrl or pathBase' })

    // Parse data URL
    const m = dataUrl.match(/^data:(.+);base64,(.*)$/)
    if (!m) return res.status(400).json({ error: 'Invalid data URL' })
    const mime = m[1]
    const buf = Buffer.from(m[2], 'base64')
    const ext = mime.split('/')[1] || 'png'

    // IMPORTANT: unique name every upload (prevents cache reuse)
    const stamp = Date.now()
    const pathname = `${pathBase}-${stamp}.${ext}`.replace(/\/+/g, '/')

    const blob = await put(pathname, buf, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN, // already created in your Vercel project
      contentType: mime,
      // addRandomSuffix: true // optional; timestamp already makes it unique
    })

    // Return URL; no-store via cache-buster for immediate UI refresh
    res.status(200).json({ url: `${blob.url}?v=${stamp}` })
  } catch (e) {
    res.status(500).json({ error: e.message || 'Upload failed' })
  }
}
