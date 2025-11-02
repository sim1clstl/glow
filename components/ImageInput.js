
import { useRef, useState } from 'react'
export default function ImageInput({ label='Image (PNG)', value, onChange }){
  const [preview, setPreview] = useState(value || null)
  const ref = useRef(null)
  const onFile = (e)=>{
    const f=e.target.files?.[0]; if(!f) return
    const reader=new FileReader()
    reader.onload=()=>{ setPreview(reader.result); onChange?.(reader.result) }
    reader.readAsDataURL(f)
  }
  return (<div className="uploadBox">
    <label><b>{label}</b></label>
    <div className="preview">{preview ? <img src={preview} alt="preview" /> : <span>No image</span>}</div>
    <input ref={ref} type="file" accept="image/*" onChange={onFile} />
    <button className="btn ghost" type="button" onClick={()=>{ setPreview(null); onChange?.(null); if(ref.current) ref.current.value='';}}>Remove</button>
  </div>)
}
