#!/data/data/com.termux/files/usr/bin/bash

set -e

ROOT="$HOME/aam_full_system"
mkdir -p $ROOT && cd $ROOT

pkg update -y
pkg install -y nodejs python git

mkdir -p apps services data logs scripts

# -----------------------------
# DASHBOARD
# -----------------------------
cat > apps/dashboard.js << 'APP'
const http = require('http');
const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./data/family.json','utf-8'));

http.createServer((req,res)=>{
  if(req.url === "/"){
    res.writeHead(200,{'Content-Type':'application/json'});
    res.end(JSON.stringify({
      system:"AAM OS LIVE",
      members:data.people.length,
      businesses:data.people.map(p=>p.businesses).flat()
    },null,2));
  }
}).listen(4900);

console.log("Dashboard running on 4900");
APP

# -----------------------------
# JARVIS CORE
# -----------------------------
cat > apps/jarvis.js << 'APP'
const http = require('http');

http.createServer((req,res)=>{
  if(req.url.startsWith("/command")){
    res.writeHead(200);
    res.end("Jarvis command received");
  }
}).listen(5000);

console.log("Jarvis running on 5000");
APP

# -----------------------------
# FAMILY DATA
# -----------------------------
cat > data/family.json << 'DATA'
{
  "people":[
    {"name":"James","role":"Root","businesses":["AAM","Jarvis","University"]},
    {"name":"Tasha Ash","role":"Ops","businesses":["March & Lewis","Sculptify"]},
    {"name":"Nekira Frances","role":"HR Logistics","businesses":["HR","Freight","Dispatch"]},
    {"name":"BJ","role":"Music","businesses":["Record Label","Store"]},
    {"name":"Game Dev Brother","role":"Dev","businesses":["Games","Store"]},
    {"name":"Raymond Jarreau","role":"Insurance","businesses":["OmniCare 360","Infinite Banking"]},
    {"name":"Deon Hamilton","role":"Builder","businesses":["Free Biz 1","Free Biz 2"]},
    {"name":"Asia Watson","role":"Builder","businesses":["Free Biz 1","Free Biz 2"]},
    {"name":"Pastor Kofi Ofri","role":"Spiritual","businesses":["SOC Network","BloomNourish"]},
    {"name":"Mya Ofri","role":"Herbalist","businesses":["BloomNourish"]}
  ]
}
DATA

# -----------------------------
# START SCRIPT
# -----------------------------
cat > scripts/start.sh << 'START'
#!/data/data/com.termux/files/usr/bin/bash
node apps/dashboard.js &
node apps/jarvis.js &
echo "SYSTEM STARTED"
START

chmod +x scripts/start.sh

echo "SETUP COMPLETE"
echo "Run: bash scripts/start.sh"
