import { useState, useEffect } from 'react'
import SetupPanel from '../components/SetupPanel'
import GameBoard from '../components/GameBoard'
import { loadSets } from '../utils/storage'

function Intro({ onBegin }){
  return (
    <div className="intro">
      <div className="introCard">
        <div className="introTitle">
          <div className="logo"/><div>How to Play</div>
        </div>
        <p className="introBody">
          Match each <b>product</b> to the correct <b>skin concern</b>.
        </p>
        <ul className="introList">
          <li>Touch the <b>blue dot</b> on a product and drag to its matching concern.</li>
          <li>Make <b>3/3</b> matches to finish.</li>
          <li>Tap <b>Play Again</b> to shuffle a new round.</li>
        </ul>
        <p className="introBody">Our skin care solutions target dullness, dryness, and pimples — find the perfect pair!</p>
        <div className="introActions">
          <button className="btn secondary" onClick={onBegin}>Start Matching</button>
        </div>
      </div>
    </div>
  )
}

export default function Home(){
  const [mode, setMode] = useState('setup') // 'setup' | 'intro' | 'game'
  const [gameSet, setGameSet] = useState(null)

  useEffect(()=>{ document.body.classList.remove('no-scroll') }, [mode])

  const pickRandomSet = ()=>{
    const s = loadSets()
    if(!s) return null
    const available = s.filter(set =>
      set &&
      set.products?.some(p=>p.caption || p.image) &&
      set.effects?.some(e=>e.text) // text-only now
    )
    if(available.length === 0) return null
    return available[Math.floor(Math.random()*available.length)]
  }

  const startGame = ()=>{
    const pick = pickRandomSet()
    if(!pick){ alert('Please complete at least one set and press Save.'); return }
    setGameSet(pick); setMode('intro')        // show intro first
  }
  const beginAfterIntro = ()=> setMode('game')

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

      {mode==='setup' && <SetupPanel onStart={startGame} />}
      {mode==='intro' && <>
        <GameBoard data={gameSet} />
        <Intro onBegin={beginAfterIntro} />
      </>}
      {mode==='game' && <GameBoard data={gameSet} />}

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
