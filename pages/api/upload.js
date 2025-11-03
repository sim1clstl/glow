
import { put } from '@vercel/blob'
import { v4 as uuidv4 } from 'uuid'

export const config = { api: { bodyParser: { sizeLimit: '15mb' } } }

export default async function handler(req, res){
  if(req.method!=='POST') return res.status(405).end()
  try{
    const { file, path } = req.body || {}
    if(!file) return res.status(400).json({ error: 'file required (data URL)' })
    const base64 = file.split(',')[1]
    const buf = Buffer.from(base64, 'base64')
    const key = path || `uploads/${uuidv4()}.png`
    const { url } = await put(key, buf, { access:'public', contentType:'image/png' })
    res.status(200).json({ url, key })
  }catch(e){
    res.status(500).json({ error: e.message })
  }
}
