// utils/cloud.js
export async function uploadImageToBlob(dataUrl, pathBase) {
  const r = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, pathBase })
  })
  if (!r.ok) throw new Error('Upload failed')
  const { url } = await r.json()
  // url already has ?v=timestamp from the API, but keep this in case of proxies
  return `${url}&cb=${Date.now()}`
}

// Save your sets JSON (unchanged)
export async function saveSetsToBlob(sets) {
  const r = await fetch('/api/save-sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sets, savedAt: Date.now() })
  })
  if (!r.ok) throw new Error('Save sets failed')
  return await r.json()
}

// Load with no-store + cache-buster so the latest JSON is used
export async function loadSetsFromBlob() {
  const r = await fetch('/api/load-sets?v=' + Date.now(), { cache: 'no-store' })
  if (!r.ok) return null
  const { sets } = await r.json()
  return sets
}
