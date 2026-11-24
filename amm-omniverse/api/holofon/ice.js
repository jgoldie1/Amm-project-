import {createHmac} from 'node:crypto'
import {requireUser} from '../_lib/security.js'

// Only temporary credentials leave the server. Relay service is optional.
export default async function handler(req,res){
  res.setHeader('Cache-Control','no-store')
  if(req.method!=='GET')return res.status(405).end()
  const user=await requireUser(req,res)
  if(!user)return
  const iceServers=[]
  const stun=process.env.HOLOFON_STUN_URL
  if(stun)iceServers.push({urls:stun})
  const urls=(process.env.HOLOFON_TURN_URLS||'').split(',').map(x=>x.trim()).filter(Boolean)
  const secret=process.env.HOLOFON_TURN_SECRET
  if(urls.length&&secret){
    const username=Math.floor(Date.now()/1000+3600)+':'+user.id
    iceServers.push({urls,username,credential:createHmac('sha1',secret).update(username).digest('base64')})
  }
  return res.status(200).json({iceServers})
}
