
async function toJsonOrThrow(res){
  const txt = await res.text()
  let data; try{ data = JSON.parse(txt) }catch{ throw new Error(txt || res.statusText) }
  if(!res.ok) throw new Error(data?.error || res.statusText)
  return data
}

export async function uploadImageToBlob(dataUrl, path){
  const res = await fetch('/api/upload', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ file:dataUrl, path })
  })
  const data = await toJsonOrThrow(res)
  return data.url
}

export async function saveSetsToBlob(sets){
  const res = await fetch('/api/saveSets', {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ sets })
  })
  await toJsonOrThrow(res)
  return true
}

export async function loadSetsFromBlob(){
  const res = await fetch('/api/loadSets')
  if(res.status===404) return null
  const data = await toJsonOrThrow(res)
  return data.sets
}
