
import { list } from '@vercel/blob'

export default async function handler(req, res){
  try{
    const listed = await list({ prefix: 'sets/sets.json' })
    const hit = listed.blobs?.find(b=> b.pathname === 'sets/sets.json')
    if(!hit) return res.status(404).json({ error:'not found' })
    const r = await fetch(hit.url)
    if(!r.ok) return res.status(500).json({ error:'fetch failed' })
    const json = await r.json()
    res.status(200).json({ sets: json.sets || null })
  }catch(e){
    res.status(500).json({ error:e.message })
  }
}
