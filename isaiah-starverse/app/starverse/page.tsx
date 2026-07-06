"use client"
import { useState } from "react"
import Nav from "../components/Nav"
import { STARS } from "../lib/data"

export default function StarversePage() {
  const [stars, setStars] = useState([...STARS].sort((a,b)=>b.score-a.score))
  const [voted, setVoted] = useState<number[]>([])
  const [filter, setFilter] = useState("All")

  const categories = ["All","Athlete","Dancer","Singer","Actor","Musician","Creator","Speaker"]
  const filtered = filter==="All" ? stars : stars.filter(s=>s.talent.includes(filter as any))

  function vote(id:number){
    if(voted.includes(id)) return
    setVoted(v=>[...v,id])
    setStars(prev=>[...prev.map(s=>s.id===id?{...s,votes:s.votes+1,score:Math.min(100,s.score+1)}:s)].sort((a,b)=>b.score-a.score))
  }

  return (
    <>
      <Nav/>
      <section className="hero">
        <div className="container">
          <span className="badge badge-gold">⭐ Live Starverse</span>
          <h1 style={{marginTop:12}}>The <span style={{color:"var(--gold)"}}>Starverse</span></h1>
          <p style={{maxWidth:500,margin:"12px auto 0"}}>Fan votes + Isaiah AI scores = Starverse ranking. Vote for stars you believe in. Rankings update in real time.</p>
        </div>
      </section>
      <main className="container">
        <div style={{display:"flex",gap:8,flexWrap:"wrap",margin:"24px 0"}}>
          {categories.map(c=>(
            <button key={c} onClick={()=>setFilter(c)} className={filter===c?"btn-gold":"btn-outline"} style={{fontSize:12,padding:"8px 14px"}}>
              {c}
            </button>
          ))}
        </div>
        <div className="grid">
          {filtered.map((star,i)=>(
            <div className="card card-star" key={star.id}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                <span className="badge badge-gold">#{i+1}</span>
                <span style={{fontSize:28}}>{star.emoji}</span>
              </div>
              <div className="rank" style={{margin:"8px 0 4px"}}>{star.score}</div>
              <h2>{star.name}</h2>
              <p style={{fontSize:13}}>{star.talent.join(" · ")}</p>
              <p style={{fontSize:13}}>{star.city}, {star.state}</p>
              <p style={{fontSize:13,marginTop:8}}>{star.bio}</p>
              <div style={{marginTop:10}}>
                <span className={`badge badge-gold`}>{star.level}</span>
                {star.parentSupported && <span className="badge badge-family" style={{marginLeft:6,fontSize:10}}>👨‍👧 Parent</span>}
              </div>
              <div className="score-bar" style={{margin:"10px 0 6px"}}>
                <div className="score-fill" style={{width:`${star.score}%`}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{fontSize:13,color:"var(--text-muted)"}}>🗳️ {star.votes.toLocaleString()} votes</span>
                <button onClick={()=>vote(star.id)} disabled={voted.includes(star.id)} className={voted.includes(star.id)?"btn-outline":"btn-gold"} style={{fontSize:12,padding:"6px 14px"}}>
                  {voted.includes(star.id)?"✓ Voted":"⭐ Vote"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
