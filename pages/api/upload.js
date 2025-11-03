// pages/api/upload.js
import { put } from '@vercel/blob'

export const config = {
  api: { bodyParser: { sizeLimit: '25mb' } }, // allow big base64 images
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return res.status(500).json({
        error:
          'Missing BLOB_READ_WRITE_TOKEN. In Vercel → Storage → Blob, connect this project (all environments) or add the token in Project → Settings → Environment Variables and redeploy.',
      })
    }

    const { dataUrl, pathBase } = req.body || {}
    if (!dataUrl || !pathBase) {
      return res.status(400).json({ error: 'Missing dataUrl or pathBase' })
    }

    // Parse data URL
    const m = /^data:(.+);base64,(.*)$/.exec(dataUrl)
    if (!m) return res.status(400).json({ error: 'Invalid data URL format' })
    const mime = m[1]
    const base64 = m[2]
    const buf = Buffer.from(base64, 'base64')
    const ext = (mime.split('/')[1] || 'png').toLowerCase()

    // Unique name every time to avoid CDN/browser cache reuse
    const stamp = Date.now()
    const safeBase = pathBase.replace(/[^a-z0-9/_-]/gi, '')
    const pathname = `${safeBase}-${stamp}.${ext}`.replace(/\/+/g, '/')

    const blob = await put(pathname, buf, {
      access: 'public',
      contentType: mime,
      token,
      addRandomSuffix: false, // stamp already makes it unique
    })

    // Return a URL with cache-buster so UI updates instantly
    return res.status(200).json({ url: `${blob.url}?v=${stamp}` })
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) })
  }
}
