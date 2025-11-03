// utils/cloud.js
/**
 * Uploads a base64 data URL as a public blob.
 * Returns a unique URL (with cache-buster) so UIs refresh immediately.
 */
export async function uploadImageToBlob(dataUrl, pathBase) {
  const r = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ dataUrl, pathBase }),
  })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(out?.error || 'Upload failed')
  return out.url // already contains ?v=stamp
}

/** Save whole sets JSON to blob (writes a new version each time). */
export async function saveSetsToBlob(sets) {
  const r = await fetch('/api/save-sets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sets, savedAt: Date.now() }),
  })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(out?.error || 'Save sets failed')
  return out
}

/** Load the latest sets JSON from blob (no-store to avoid stale caches). */
export async function loadSetsFromBlob() {
  const r = await fetch('/api/load-sets?v=' + Date.now(), { cache: 'no-store' })
  const out = await r.json().catch(() => ({}))
  if (!r.ok) throw new Error(out?.error || 'Load sets failed')
  return out.sets ?? null
}
