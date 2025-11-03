
export async function uploadImageToBlob(dataUrl, path){
  const res = await fetch('/api/upload', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ file:dataUrl, path })
  })
  if(!res.ok){ throw new Error('Upload failed') }
  const data = await res.json()
  return data.url
}

export async function saveSetsToBlob(sets){
  const res = await fetch('/api/saveSets', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ sets })
  })
  if(!res.ok){ throw new Error('Save sets failed') }
  return true
}

export async function loadSetsFromBlob(){
  const res = await fetch('/api/loadSets')
  if(res.status===404) return null
  if(!res.ok) throw new Error('Load sets failed')
  const data = await res.json()
  return data.sets
}
