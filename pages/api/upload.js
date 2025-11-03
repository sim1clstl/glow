
export const config = { api: { bodyParser: { sizeLimit: '25mb' } } }
export const dynamic = 'force-dynamic'

import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

function mimeFromDataUrl(dataUrl = '') {
  const m = dataUrl.match(/^data:(.*?);base64,/)
  return m ? m[1] : 'image/png'
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return res.status(500).json({ error: 'Missing BLOB_READ_WRITE_TOKEN (connect your Blob store & redeploy)' })
    }

    const { file, path } = req.body || {}
    if (!file || typeof file !== 'string' || !file.startsWith('data:')) {
      return res.status(400).json({ error: 'Bad payload: expected data URL base64 in "file"' })
    }

    const contentType = mimeFromDataUrl(file)
    const base64 = file.split(',')[1]
    const buf = Buffer.from(base64, 'base64')

    const key = path || `uploads/${uuidv4()}.png`
    const { url } = await put(key, buf, {
      access: 'public',
      contentType,
      addRandomSuffix: false,
      token,
    })

    return res.status(200).json({ url, key })
  } catch (e) {
    return res.status(500).json({ error: e?.message || 'Unknown upload error' })
  }
}
