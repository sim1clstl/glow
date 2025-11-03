
import { useEffect, useState } from 'react'
import ImageInput from '../components/ImageInput'
import { loadSets, saveSets, clearSets } from '../utils/storage'
import { uploadImageToBlob, saveSetsToBlob, loadSetsFromBlob } from '../utils/cloud'

const EMPTY_SET = ()=> ({
  name: '',
  products: [
    { id:'p1', caption:'', image:null },
    { id:'p2', caption:'', image:null },
    { id:'p3', caption:'', image:null },
  ],
  effects: [
    { id:'e1', text:'', image:null, pid:'p1' },
    { id:'e2', text:'', image:null, pid:'p2' },
    { id:'e3', text:'', image:null, pid:'p3' },
  ]
})

export default function SetupPanel({ onStart }){
  const [sets, setSets] = useState([EMPTY_SET(), EMPTY_SET(), EMPTY_SET(), EMPTY_SET()])
  const [tab, setTab] = useState(0)

  useEffect(()=>{
    const savedLocal = loadSets()
    if(savedLocal && Array.isArray(savedLocal) && savedLocal.length===4){
      setSets(savedLocal)
    }
  }, [])

  const update = (idx, patch)=> setSets(prev => prev.map((s,i)=> i===idx ? ({...s, ...patch}) : s))
  const updateProd = (idx, i, patch)=> update(idx, { products: sets[idx].products.map((p,pi)=> pi===i ? ({...p, ...patch}) : p) })
  const updateEff  = (idx, i, patch)=> update(idx, { effects: sets[idx].effects.map((e,pi)=> pi===i ? ({...e, ...patch}) : e) })

  const saveLocal = ()=> { saveSets(sets); alert('Saved locally!') }
  const resetAll = ()=> { if(confirm('Clear local sets?')){ clearSets(); setSets([EMPTY_SET(), EMPTY_SET(), EMPTY_SET(), EMPTY_SET()]) } }

  const saveCloud = async ()=>{
    try{
      const copy = JSON.parse(JSON.stringify(sets))
      for(let s=0; s<copy.length; s++){
        for(const p of copy[s].products){
          if(p.image && p.image.startsWith('data:')){
            p.image = await uploadImageToBlob(p.image, `sets/${s+1}/products/${p.id}.png`)
          }
        }
        for(const e of copy[s].effects){
          if(e.image && e.image.startsWith('data:')){
            e.image = await uploadImageToBlob(e.image, `sets/${s+1}/effects/${e.id}.png`)
          }
        }
      }
      await saveSetsToBlob(copy)
      saveSets(copy)
      alert('Saved to Vercel Blob!')
    }catch(e){ alert('Cloud save failed: '+e.message) }
  }

  const loadCloud = async ()=>{
    try{
      const cloud = await loadSetsFromBlob()
      if(!cloud){ alert('No cloud data yet. Save to cloud first.'); return }
      setSets(cloud)
      saveSets(cloud)
      alert('Loaded from Vercel Blob!')
    }catch(e){ alert('Cloud load failed: '+e.message) }
  }

  return (
    <div className="setup">
      <div style={{display:'flex',alignItems:'center',gap:10, marginBottom:8}}>
        <div className="logo" /><div style={{fontWeight:800}}>Glow Match — Setup</div>
      </div>

      <div className="setTabs">
        {sets.map((s,i)=> (
          <button key={i} className={"btn ghost"} onClick={()=>setTab(i)}>{s.name || `Set ${i+1}`}</button>
        ))}
      </div>

      <div className="field">
        <label><b>Set Name</b></label>
        <input
          placeholder={`Set ${tab+1} name`}
          value={sets[tab].name}
          onChange={e=> update(tab, { name: e.target.value })}
          style={{padding:'10px',borderRadius:12,border:'1px solid #cfe3ff',width:'100%'}}
        />
      </div>

      <div className="grid3">
        {sets[tab].products.map((p,i)=>(
          <div key={i}>
            <div style={{fontWeight:700, marginBottom:6}}>Product {i+1}</div>
            <div className="field">
              <label><b>Caption</b></label>
              <input
                placeholder="Product name / caption"
                value={p.caption}
                onChange={e=> updateProd(tab, i, { caption: e.target.value })}
                style={{padding:'10px',borderRadius:12,border:'1px solid #cfe3ff',width:'100%'}}
              />
            </div>
            <ImageInput value={p.image} onChange={(img)=> updateProd(tab, i, { image: img })} />
          </div>
        ))}
      </div>

      <div style={{height:10}} />

      <div className="grid3">
        {sets[tab].effects.map((e,i)=>(
          <div key={i}>
            <div style={{fontWeight:700, marginBottom:6}}>Effect {i+1}</div>
            <div className="field">
              <label><b>Text</b></label>
              <input
                placeholder="e.g. Brightens & evens tone"
                value={e.text}
                onChange={ev=> updateEff(tab, i, { text: ev.target.value })}
                style={{padding:'10px',borderRadius:12,border:'1px solid #cfe3ff',width:'100%'}}
              />
            </div>
            <ImageInput label="(Optional) Effect Image" value={e.image} onChange={(img)=> updateEff(tab, i, { image: img })} />
            <div className="field">
              <label><b>Match to Product</b></label>
              <select
                value={e.pid}
                onChange={ev=> updateEff(tab, i, { pid: ev.target.value })}
                style={{padding:'10px',borderRadius:12,border:'1px solid #cfe3ff',width:'100%'}}
              >
                {sets[tab].products.map((p,j)=>(<option key={j} value={p.id}>{p.caption || `Product ${j+1}`}</option>))}
              </select>
            </div>
          </div>
        ))}
      </div>

      <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:12}}>
        <button className="btn secondary" onClick={saveLocal}>Save (Local)</button>
        <button className="btn" onClick={()=> onStart?.()}>Start Game</button>
        <button className="btn ghost" onClick={resetAll}>Reset All (Local)</button>
        <button className="btn" onClick={saveCloud}>Save to Cloud</button>
        <button className="btn ghost" onClick={loadCloud}>Load from Cloud</button>
      </div>
    </div>
  )
}
