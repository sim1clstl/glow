
export const dynamic = 'force-dynamic'

import { list } from '@vercel/blob'

export default async function handler(req, res){
  try{
    const { blobs } = await list({ prefix: 'sets/sets.json' })
    const hit = blobs?.find(b=> b.pathname === 'sets/sets.json')
    if(!hit) return res.status(404).json({ error:'sets/sets.json not found' })
    const r = await fetch(hit.url, { cache: 'no-store' })
    if(!r.ok) return res.status(500).json({ error: 'Fetch failed: ' + r.status })
    const json = await r.json()
    res.status(200).json({ sets: json.sets || null })
  }catch(e){
    res.status(500).json({ error: e?.message || 'Unknown load error' })
  }
}
