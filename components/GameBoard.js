import { useEffect, useRef, useState } from 'react'

function shuffle(arr){ return [...arr].map(v=>[Math.random(), v]).sort((a,b)=>a[0]-b[0]).map(v=>v[1]) }

export default function GameBoard({ data }){
  const [left, setLeft]   = useState(()=> shuffle(data.products))
  const [right, setRight] = useState(()=> shuffle(data.effects))
  useEffect(()=>{ setLeft(shuffle(data.products)); setRight(shuffle(data.effects)) }, [data])

  const [matches, setMatches] = useState({})
  const score = Object.keys(matches).length
  const [won, setWon] = useState(false)

  const svgRef = useRef(null)
  const wiresRef = useRef(null)
  const ghostRef = useRef(null)
  const cursorRef = useRef(null)
  const activeRef = useRef(null)

  // lock page scrolling while game is open
  useEffect(()=>{ document.body.classList.add('no-scroll'); return ()=> document.body.classList.remove('no-scroll') }, [])

  const preventTouchMove = (ev)=> ev.preventDefault()

  useEffect(()=>{
    const onMove = (ev)=>{ if(!activeRef.current) return; const p=clientToSvg(svgRef.current, ev); drawActive(p.x,p.y) }
    const onUp = (ev)=>{ if(!activeRef.current) return; const p=clientToSvg(svgRef.current, ev); const toDot=pickTarget(p.x,p.y); finalizeWire(toDot) }
    window.addEventListener('pointermove', onMove, {passive:false})
    window.addEventListener('pointerup', onUp, {passive:false})
    window.addEventListener('touchcancel', onUp, {passive:false})
    return ()=>{ window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp); window.removeEventListener('touchcancel', onUp) }
  }, [])

  useEffect(()=>{ if(score===left.length) setWon(true) }, [score, left.length])

  // reset wires when shuffled arrays change
  useEffect(()=>{ 
    wiresRef.current && (wiresRef.current.innerHTML='')
    ghostRef.current && (ghostRef.current.innerHTML='')
    cursorRef.current && (cursorRef.current.innerHTML='')
    activeRef.current=null; setMatches({}); setWon(false)
    document.querySelectorAll('.card').forEach(c=> c.classList.remove('matched'))
  }, [left,right])

  function startWire(id, fromDot, startPt){
    const {x,y}=anchorPos(svgRef.current, fromDot)
    const lineBg=makeSvg('path','wire bg')
    const line=makeSvg('path','wire')
    const ghost=makeSvg('path','wire ghost')
    const cursor=makeSvg('circle')
    cursor.setAttribute('r','12'); cursor.setAttribute('fill','url(#wireGradient)')
    wiresRef.current.appendChild(lineBg); wiresRef.current.appendChild(line)
    ghostRef.current.appendChild(ghost); cursorRef.current.appendChild(cursor)
    activeRef.current={id, fromDot, lineBg, line, ghost, cursor, start:{x,y}}
    drawActive(startPt.x,startPt.y)
  }
  function drawActive(toX,toY){
    const a=activeRef.current; if(!a) return
    const d=curve(a.start.x,a.start.y,toX,toY)
    a.lineBg.setAttribute('d',d); a.line.setAttribute('d',d); a.ghost.setAttribute('d',d)
    a.cursor.setAttribute('cx',toX); a.cursor.setAttribute('cy',toY)
  }
  function finalizeWire(toDot){
    const a=activeRef.current; if(!a) return
    const fromId=a.id; const toId=toDot?.dataset.id
    const ok=toId&&toId===fromId&&!matches[fromId]
    if(ok){
      const end=anchorPos(svgRef.current,toDot)
      const d=curve(a.start.x,a.start.y,end.x,end.y)
      a.lineBg.setAttribute('d',d); a.line.setAttribute('d',d)
      a.ghost.remove(); a.cursor.remove()
      setMatches(m=>({...m,[fromId]:true}))
      a.fromDot.closest('.card').classList.add('matched')
      toDot.closest('.card').classList.add('matched')
    }else{
      a.lineBg.remove(); a.line.remove(); a.ghost.remove(); a.cursor.remove()
      if(toDot) flashWrong(toDot.closest('.card'))
    }
    a.fromDot.classList.remove('active')
    document.body.classList.remove('is-dragging')
    window.removeEventListener('touchmove', preventTouchMove)
    activeRef.current=null
  }
  function makeSvg(tag, cls){ const el=document.createElementNS('http://www.w3.org/2000/svg',tag); if(cls) el.setAttribute('class',cls); return el }
  function clientToSvg(svg, ev){ const r=svg.getBoundingClientRect(); const t=ev.touches?.[0]; const p=t?{x:t.clientX,y:t.clientY}:{x:ev.clientX,y:ev.clientY}; return {x:p.x-r.left,y:p.y-r.top} }
  function anchorPos(svg, dot){ const rect=svg.getBoundingClientRect(); const r=dot.getBoundingClientRect(); return {x:r.left+r.width/2-rect.left, y:r.top+r.height/2-rect.top} }
  function curve(x1,y1,x2,y2){ const dx=Math.abs(x2-x1); const c=Math.max(60, dx*0.6); return `M ${x1} ${y1} C ${x1+c} ${y1}, ${x2-c} ${y2}, ${x2} ${y2}` }
  function flashWrong(el){ if(!el||!el.animate) return; el.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:280,easing:'ease-in-out'}) }
  const isMobile=()=> typeof window!=='undefined' && window.innerWidth<720
  function pickTarget(x,y){ const MAX=isMobile()?84:60; const dots=document.querySelectorAll('.right .dot'); let best=null,bd=1e9; dots.forEach(d=>{ const a=anchorPos(svgRef.current,d); const dist=Math.hypot(a.x-x,a.y-y); if(dist<bd){bd=dist;best=d} }); return bd<=MAX?best:null }
  const onStartDrag=(e,id,dot)=>{ e.preventDefault(); try{dot.setPointerCapture?.(e.pointerId)}catch(_){}; document.body.classList.add('is-dragging'); window.addEventListener('touchmove', preventTouchMove, { passive:false }); dot.classList.add('active'); const p=clientToSvg(svgRef.current,e); startWire(id, dot, p) }

  const scoreTotal = left.length

  return (
    <div style={{display:'flex',flexDirection:'column',gap:6,height:'100%'}}>
      <div className="board" style={{touchAction:'none'}}>
        {/* Left Column */}
        <div className="col left">
          <h2>Products</h2>
          <div className="list">
            {left.map((p,i)=> (
              <div key={p.id} className="card left">
                <div className="vimg">{p.image ? <img src={p.image} alt={p.caption || 'product'} /> : <span style={{color:'#8aa9cc'}}>No image</span>}</div>
                <div className="cap">{p.caption || `Product ${i+1}`}</div>
                <div className="dot" data-id={p.id} onPointerDown={(e)=> onStartDrag(e, p.id, e.currentTarget)} onTouchStart={(e)=> onStartDrag(e, p.id, e.currentTarget)} />
              </div>
            ))}
          </div>
        </div>

        {/* Center Score */}
        <div className="rail">
          <div className="stats"><div className="score">{score}/{scoreTotal}</div><div className="small">matches</div></div>
        </div>

        {/* Right Column */}
        <div className="col right">
          <h2>Skin Concerns</h2>
          <div className="list">
            {right.map((e,i)=> (
              <div key={e.id} className="card right">
                <div className="vimg">{e.image ? <img src={e.image} alt={e.text || 'effect'} /> : <span style={{color:'#8aa9cc'}}>No image</span>}</div>
                <div className="cap">{e.text || `Effect ${i+1}`}</div>
                <div className="dot" data-id={e.pid} />
              </div>
            ))}
          </div>
        </div>

        {/* SVG Wires */}
        <div className="wires">
          <svg ref={svgRef}>
            <defs><linearGradient id="wireGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#5fd0ff" /><stop offset="100%" stopColor="#2f6fff" /></linearGradient></defs>
            <g ref={wiresRef}></g><g ref={ghostRef}></g><g ref={cursorRef}></g>
          </svg>
        </div>
      </div>

      <div className="hint" style={{paddingBottom:'74px'}}>Drag from the left blue dot to the matching concern.</div>

      {won ? (
        <div style={{position:'fixed',inset:0,background:'rgba(241,249,255,.7)',backdropFilter:'blur(6px)',display:'grid',placeItems:'center',zIndex:30}}>
          <div style={{background:'#fff',padding:18,borderRadius:18,boxShadow:'var(--shadow)',textAlign:'center'}}>
            <h3 style={{marginTop:0}}>Great job! ✨</h3>
          </div>
        </div>
      ) : null}
    </div>
  )
}
