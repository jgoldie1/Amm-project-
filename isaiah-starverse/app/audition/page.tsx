"use client"
import { useState } from "react"
import Nav from "../components/Nav"

export default function AuditionPage() {
  const [form, setForm] = useState({name:"",talent:"",city:"",state:"",age:"",videoUrl:"",story:"",parentName:"",parentConsent:false,ageGroup:""})
  const [result, setResult] = useState("")
  const [score, setScore] = useState(0)
  const [loading, setLoading] = useState(false)
  const isYouth = form.age && parseInt(form.age) < 18
  const u = (k:string,v:string|boolean) => setForm(f=>({...f,[k]:v}))

  async function submit(){
    if(!form.name||!form.talent||!form.story) return
    if(isYouth && !form.parentConsent){setResult("Parent or guardian consent is required for performers under 18. Please check the consent box.");return}
    setLoading(true)
    const res=await fetch("/api/auditions",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(form)})
    const data=await res.json()
    setResult(data.message)
    setScore(data.score||0)
    setLoading(false)
  }

  return (
    <>
      <Nav/>
      <section style={{padding:"60px 24px 40px",background:"radial-gradient(circle at top,#064e3b,#070713 55%)",textAlign:"center"}}>
        <span className="badge badge-holo">🎤 Submit Audition</span>
        <h1 style={{marginTop:12,color:"var(--holo)"}}>This Is Your Moment</h1>
        <p style={{maxWidth:500,margin:"12px auto 0"}}>Every star started somewhere. Isaiah AI MD reviews every submission personally. Make your story count.</p>
      </section>
      <main className="container" style={{marginTop:32}}>
        <div className="grid-2">
          <div className="card">
            <h2 style={{marginBottom:16}}>Your Audition</h2>
            <input className="input" placeholder="Full name *" onChange={e=>u("name",e.target.value)}/>
            <select className="input" onChange={e=>u("talent",e.target.value)}>
              <option value="">Select talent category *</option>
              {["Athlete","Dancer","Singer","Actor","Comedian","Musician","Speaker","Creator","Gamer","Artist","Poet","Chef"].map(t=>(
                <option key={t}>{t}</option>
              ))}
            </select>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
              <input className="input" placeholder="City" onChange={e=>u("city",e.target.value)}/>
              <input className="input" placeholder="State" onChange={e=>u("state",e.target.value)}/>
            </div>
            <input className="input" placeholder="Age" type="number" onChange={e=>u("age",e.target.value)}/>
            <select className="input" onChange={e=>u("ageGroup",e.target.value)}>
              <option value="">Age group</option>
              {["6–10","11–14","15–18","19+","Parent-Child Duo"].map(g=><option key={g}>{g}</option>)}
            </select>
            <input className="input" placeholder="Video URL or demo title" onChange={e=>u("videoUrl",e.target.value)}/>
            <textarea className="input" placeholder="Tell your story. Why do you want to be a star? What drives you? The more real, the better. *" style={{minHeight:120}} onChange={e=>u("story",e.target.value)}/>
            {isYouth && (
              <div className="parent-child-banner" style={{margin:"10px 0",flexDirection:"column",gap:10}}>
                <div style={{display:"flex",gap:10,alignItems:"center",width:"100%"}}>
                  <span style={{fontSize:24}}>👨‍👧</span>
                  <div>
                    <div style={{fontSize:13,color:"var(--family)",fontWeight:700}}>Parent/Guardian Required</div>
                    <p style={{fontSize:12,margin:"4px 0 0"}}>Performers under 18 must have a parent or guardian complete this section.</p>
                  </div>
                </div>
                <input className="input" placeholder="Parent/Guardian full name *" onChange={e=>u("parentName",e.target.value)}/>
                <label style={{display:"flex",gap:10,alignItems:"flex-start",cursor:"pointer",fontSize:13,color:"var(--text-dim)"}}>
                  <input type="checkbox" onChange={e=>u("parentConsent",e.target.checked)} style={{marginTop:2,flexShrink:0}}/>
                  I am the parent or legal guardian of {form.name||"this performer"}. I give consent for their participation in the Isaiah AI Starverse program, including online showcases and media content. I understand this is a family-safe, faith-centered platform.
                </label>
              </div>
            )}
            <button className="btn-holo" onClick={submit} disabled={loading||!form.name||!form.talent||!form.story} style={{width:"100%",marginTop:8,opacity:(!form.name||!form.talent||!form.story)?0.5:1}}>
              {loading?"Isaiah AI MD is reviewing...":"🎤 Submit Audition"}
            </button>
          </div>
          <div>
            {score>0 && (
              <div className="card card-gold" style={{marginBottom:16,textAlign:"center"}}>
                <div className="rank-big">{score}</div>
                <div style={{color:"var(--text-muted)",fontSize:14}}>Isaiah AI Score</div>
                <div className="score-bar" style={{margin:"12px 0 6px"}}>
                  <div className="score-fill" style={{width:`${score}%`}}/>
                </div>
              </div>
            )}
            <div className="card" style={{background:"#09091c"}}>
              <h2 style={{marginBottom:12}}>🤖 Isaiah AI MD Review</h2>
              {result ? (
                <div style={{whiteSpace:"pre-wrap",fontSize:13,color:"var(--text-dim)",lineHeight:1.7}}>{result}</div>
              ) : (
                <div style={{textAlign:"center",padding:"30px 0"}}>
                  <div style={{fontSize:48,marginBottom:12}}>🎤</div>
                  <p>Submit your audition and Isaiah AI MD will score it immediately — no waiting. Every submission gets a real response.</p>
                  <div style={{marginTop:20}}>
                    <h3 style={{marginBottom:12}}>What We Score On</h3>
                    {[["Story","Your why — purpose and drive"],["Talent","Category and demonstrated skill"],["Consistency","Track record and commitment"],["Character","Values and community"],["Potential","Long-term trajectory"]].map(([s,d])=>(
                      <div key={s} style={{display:"flex",gap:10,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                        <span style={{color:"var(--gold)",fontWeight:700,width:100,flexShrink:0}}>{s}</span>
                        <span style={{fontSize:13,color:"var(--text-muted)"}}>{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
