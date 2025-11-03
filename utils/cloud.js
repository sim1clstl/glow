// utils/cloud.js
export async function uploadImageToBlob(dataUrl, pathBase) {
  const r = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, pathBase }),
  })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(out?.error || 'Upload failed')
  return out.url
}

export async function saveSetsToBlob(sets) {
  const r = await fetch('/api/saveSets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sets, savedAt: Date.now() }),
  })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(out?.error || 'Save sets failed')
  return out
}

export async function loadSetsFromBlob() {
  const r = await fetch('/api/loadSets?v=' + Date.now(), { cache: 'no-store' })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(out?.error || 'Load sets failed')
  return out.sets ?? null
}
