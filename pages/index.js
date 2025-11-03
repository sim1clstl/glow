import { useState, useEffect } from 'react'
import SetupPanel from '../components/SetupPanel'
import GameBoard from '../components/GameBoard'
import { loadSets } from '../utils/storage'

export default function Home(){
  const [mode, setMode] = useState('setup')
  const [gameSet, setGameSet] = useState(null)

  useEffect(()=>{ document.body.classList.remove('no-scroll') }, [mode])

  const pickRandomSet = ()=>{
    const s = loadSets()
    if(!s) return null
    const available = s.filter(set =>
      set &&
      set.products?.some(p=>p.caption || p.image) &&
      set.effects?.some(e=>e.text || e.image)
    )
    if(available.length === 0) return null
    return available[Math.floor(Math.random()*available.length)]
  }

  const startGame = ()=>{
    const pick = pickRandomSet()
    if(!pick){ alert('Please complete at least one set and press Save.'); return }
    setGameSet(pick); setMode('game')
  }

  const playAgain = ()=>{
    const pick = pickRandomSet()
    if(!pick){ alert('Please complete at least one set and press Save.'); setMode('setup'); return }
    setGameSet(pick)
  }

  const toggleFull = ()=>{
    const d=document.documentElement
    if(!document.fullscreenElement){ d.requestFullscreen?.() } else { document.exitFullscreen?.() }
  }

  return (
    <div className="container">
      <div className="header">
        <div className="logo" />
        <div className="title">Skin Care Match</div>
      </div>

      {mode==='setup' ? <SetupPanel onStart={startGame} /> : <GameBoard data={gameSet} />}

      <div className="bottomBar">
        {mode==='setup' ? (
          <>
            <button className="btn" onClick={startGame}>Start Game</button>
            <button className="btn" onClick={toggleFull}>Fullscreen</button>
          </>
        ) : (
          <>
            <button className="btn ghost" onClick={()=> setMode('setup')}>Setup</button>
            <button className="btn secondary" onClick={playAgain}>New Set</button>
            <button className="btn" onClick={toggleFull}>Fullscreen</button>
          </>
        )}
      </div>
    </div>
  )
}
