// pages/api/loadSets.js
import { list } from '@vercel/blob'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(_req, res) {
  try {
    const token = process.env.BLOB_READ_WRITE_TOKEN
    if (!token) {
      return res.status(500).json({
        error:
          'Missing BLOB_READ_WRITE_TOKEN. Connect a Blob store to this project or add the token and redeploy.',
      })
    }

    // find latest saved sets by prefix
    const { blobs } = await list({ prefix: 'game/sets-', token })
    if (!blobs || blobs.length === 0) {
      return res.status(200).json({ sets: null })
    }

    // sort by uploadedAt (desc) and use the newest
    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
    )[0]

    // fetch JSON and return it (add cache-buster to avoid any stale proxy)
    const r = await fetch(`${latest.url}?v=${Date.now()}`, { cache: 'no-store' })
    if (!r.ok) {
      const txt = await r.text().catch(()=> '')
      return res.status(500).json({ error: `Fetch latest sets failed: ${r.status} ${txt}` })
    }
    const json = await r.json().catch(() => null)

    return res.status(200).json({ sets: json?.sets ?? null })
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) })
  }
}
