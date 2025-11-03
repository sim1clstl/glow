
export const config = { api: { bodyParser: { sizeLimit: '4mb' } } }
export const dynamic = 'force-dynamic'
import { put } from '@vercel/blob'
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({error:'Method not allowed'})
  try{
    const token=process.env.BLOB_READ_WRITE_TOKEN
    if(!token) return res.status(500).json({error:'Missing BLOB_READ_WRITE_TOKEN (connect Blob & redeploy)'})
    const { sets } = req.body || {}
    if(!Array.isArray(sets) || sets.length!==4) return res.status(400).json({error:'sets must be an array of length 4'})
    const buf = Buffer.from(JSON.stringify({ sets, version:1 }), 'utf8')
    const { url } = await put('sets/sets.json', buf, { access:'public', contentType:'application/json', addRandomSuffix:false, token })
    return res.status(200).json({ url })
  }catch(e){ return res.status(500).json({ error: e?.message || 'Unknown save error' }) }
}
