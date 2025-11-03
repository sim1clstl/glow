// pages/api/save-sets.js
import { put } from '@vercel/blob'

export const config = {
  api: { bodyParser: { sizeLimit: '2mb' } },
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
          'Missing BLOB_READ_WRITE_TOKEN. Connect a Blob store to this project or add the token and redeploy.',
      })
    }

    const { sets, savedAt } = req.body || {}
    if (!sets) return res.status(400).json({ error: 'Missing sets payload' })

    const stamp = savedAt || Date.now()
    const pathname = `game/sets-${stamp}.json`

    const blob = await put(pathname, JSON.stringify({ sets, savedAt: stamp }), {
      access: 'public',
      contentType: 'application/json',
      token,
      addRandomSuffix: false,
    })

    return res.status(200).json({ url: `${blob.url}?v=${Date.now()}` })
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) })
  }
}
