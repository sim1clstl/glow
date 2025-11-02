
import { useEffect, useState } from 'react'
import ImageInput from '../components/ImageInput'
import { loadSets, saveSets, clearSets } from '../utils/storage'

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
    const saved = loadSets()
    if(saved && Array.isArray(saved) && saved.length === 4){
      setSets(saved)
    }
  }, [])

  const update = (idx, patch)=>{
    const copy = sets.map((s,i)=> i===idx ? ({...s, ...patch}) : s)
    setSets(copy)
  }
  const updateProd = (idx, i, patch)=>{
    const s = sets[idx]
    const prods = s.products.map((p,pi)=> pi===i ? ({...p, ...patch}) : p)
    update(idx, { products: prods })
  }
  const updateEff = (idx, i, patch)=>{
    const s = sets[idx]
    const effs = s.effects.map((p,pi)=> pi===i ? ({...p, ...patch}) : p)
    update(idx, { effects: effs })
  }

  const saveAll = ()=>{ saveSets(sets); alert('Sets saved! You can start the game.') }
  const resetAll = ()=>{ if(confirm('Clear all saved sets?')){ clearSets(); setSets([EMPTY_SET(), EMPTY_SET(), EMPTY_SET(), EMPTY_SET()]) } }

  return (<div className="setup">
    <div style={{display:'flex',alignItems:'center',gap:10, marginBottom:8}}>
      <div className="logo" /><div style={{fontWeight:800}}>Glow Match — Setup</div>
    </div>

    <div className="setTabs">
      {sets.map((s,i)=> <button key={i} className="btn ghost" onClick={()=>setTab(i)}>{s.name || `Set ${i+1}`}</button>)}
    </div>

    <div className="field">
      <label><b>Set Name</b></label>
      <input placeholder={`Set ${tab+1} name`} value={sets[tab].name} onChange={e=> update(tab, { name: e.target.value })} style={{padding:'10px',borderRadius:12,border:'1px solid #cfe3ff'}}/>
    </div>

    <div className="grid3">
      {sets[tab].products.map((p,i)=>(<div key={i}>
        <div style={{fontWeight:700, marginBottom:6}}>Product {i+1}</div>
        <div className="field">
          <label><b>Caption</b></label>
          <input placeholder="Product name / caption" value={p.caption} onChange={e=> updateProd(tab, i, { caption: e.target.value })} style={{padding:'10px',borderRadius:12,border:'1px solid #cfe3ff'}}/>
        </div>
        <ImageInput value={p.image} onChange={(img)=> updateProd(tab, i, { image: img })} />
      </div>))}
    </div>

    <div style={{height:10}}/>

    <div className="grid3">
      {sets[tab].effects.map((e,i)=>(<div key={i}>
        <div style={{fontWeight:700, marginBottom:6}}>Effect {i+1}</div>
        <div className="field">
          <label><b>Text</b></label>
          <input placeholder="e.g. Brightens & evens tone" value={e.text} onChange={ev=> updateEff(tab, i, { text: ev.target.value })} style={{padding:'10px',borderRadius:12,border:'1px solid #cfe3ff'}}/>
        </div>
        <ImageInput label="(Optional) Effect Image" value={e.image} onChange={(img)=> updateEff(tab, i, { image: img })}/>
        <div className="field">
          <label><b>Match to Product</b></label>
          <select value={e.pid} onChange={ev=> updateEff(tab, i, { pid: ev.target.value })} style={{padding:'10px',borderRadius:12,border:'1px solid #cfe3ff'}}>
            {sets[tab].products.map((p,j)=>(<option key={j} value={p.id}>{p.caption || `Product ${j+1}`}</option>))}
          </select>
        </div>
      </div>))}
    </div>

    <div style={{display:'flex', gap:8, flexWrap:'wrap', marginTop:12}}>
      <button className="btn secondary" onClick={saveAll}>Save Sets</button>
      <button className="btn" onClick={()=> onStart?.()}>Start Game</button>
      <button className="btn ghost" onClick={resetAll}>Reset All</button>
    </div>
  </div>)
}
