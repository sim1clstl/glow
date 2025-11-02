
import { useEffect, useState } from 'react'
import SetupPanel from '../components/SetupPanel'
import GameBoard from '../components/GameBoard'
import { loadSets } from '../utils/storage'

export default function Home(){
  const [mode, setMode] = useState('setup')
  const [gameSet, setGameSet] = useState(null)

  const pickRandomSet = ()=>{
    const s = loadSets()
    if(!s) return null
    const available = s.filter(set => set && set.products?.some(p=>p.caption || p.image) && set.effects?.some(e=>e.text || e.image))
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

  return (
    <div className="container">
      {mode==='setup' ? (
        <>
          <div className="header">
            <div style={{display:'flex',alignItems:'center'}}>
              <div className="logo" /><div className="title">Glow Match</div>
            </div>
            <div className="toolbar">
              <button className="btn" onClick={startGame}>Start Game</button>
              <button className="btn" onClick={()=>{const d=document.documentElement; if(!document.fullscreenElement){ d.requestFullscreen?.(); } else { document.exitFullscreen?.(); }}}>Fullscreen</button>
            </div>
          </div>
          <SetupPanel onStart={startGame} />
        </>
      ) : (
        <GameBoard data={gameSet} onBack={()=> setMode('setup')} onPlayAgain={playAgain} />
      )}
    </div>
  )
}
