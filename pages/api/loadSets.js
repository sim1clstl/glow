// pages/api/load-sets.js
import { list } from '@vercel/blob'

export const config = {
  api: { bodyParser: false },
}

export default async function handler(_req, res) {
  try {
    // find latest saved sets by prefix
    const { blobs } = await list({ prefix: 'game/sets-' })
    if (!blobs || blobs.length === 0) {
      return res.status(200).json({ sets: null })
    }

    // sort by uploadedAt (desc) and use the newest
    const latest = blobs.sort(
      (a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt)
    )[0]

    // fetch JSON and return it (add cache-buster to avoid any stale proxy)
    const r = await fetch(`${latest.url}?v=${Date.now()}`, { cache: 'no-store' })
    const json = await r.json().catch(() => null)

    return res.status(200).json({ sets: json?.sets ?? null })
  } catch (err) {
    return res.status(500).json({ error: err?.message || String(err) })
  }
}
