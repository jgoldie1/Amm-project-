"use strict";
(() => {
  const palette = {
    time: [0.31,0.89,1.0],
    moon: [0.72,0.75,0.82],
    mars: [0.93,0.29,0.12],
    saturn: [0.91,0.73,0.36],
    moons: [0.43,0.68,0.92]
  };
  class SpaceVerseEngine {
    constructor(canvas) {
      this.canvas=canvas; this.world="time"; this.running=false; this.startedAt=0; this.elapsed=0; this.altitude=250; this.holographic=true;
      this.gl=canvas.getContext("webgl",{alpha:false,antialias:true});
      if(this.gl) this.setupWebGL(); else this.ctx=canvas.getContext("2d");
      this.resize=()=>this.resizeCanvas();
      addEventListener("resize",this.resize,{passive:true}); this.resizeCanvas(); this.render(0);
    }
    setupWebGL(){
      const gl=this.gl;
      const vertex="attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
      const fragment="precision mediump float;uniform vec2 r;uniform float t;uniform vec3 c;uniform float a;uniform float o;float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}void main(){vec2 uv=(gl_FragCoord.xy*2.-r)/min(r.x,r.y);float d=length(uv);vec3 col=vec3(.004,.007,.025);float stars=step(.997,h(floor(gl_FragCoord.xy/3.)));col+=stars*(.45+.55*sin(t+h(uv)*8.));float radius=.53-a*.00035;if(d<radius){float z=sqrt(max(0.,radius*radius-d*d));vec3 n=normalize(vec3(uv,z));float light=max(.10,dot(n,normalize(vec3(-.45,.55,.8))));float bands=.72+.18*sin((n.y+t*.035)*28.)+.10*sin((n.x+n.y)*17.);col=mix(c*.22,c*bands*light,smoothstep(radius,radius-.025,d));}float ring=abs(length(vec2(uv.x,uv.y*3.2))-.73);if(c.r>.75&&c.g>.55&&ring<.025&&d>.5)col=mix(col,c,1.-ring/.025);float scan=.04/(abs(uv.y-.72+.04*sin(t))+.03);col+=vec3(0.,.3,.45)*scan*.12;float grid=(step(.965,fract((uv.x+t*.015)*18.))+step(.975,fract((uv.y-t*.01)*18.)))*o;col+=vec3(0.,.55,.75)*grid*.22;col=mix(col,vec3(col.g*.35,col.g*1.15,col.b*1.35),o*.22);gl_FragColor=vec4(col,1.);}";
      const compile=(type,source)=>{const shader=gl.createShader(type);gl.shaderSource(shader,source);gl.compileShader(shader);if(!gl.getShaderParameter(shader,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(shader));return shader;};
      try{const program=gl.createProgram();gl.attachShader(program,compile(gl.VERTEX_SHADER,vertex));gl.attachShader(program,compile(gl.FRAGMENT_SHADER,fragment));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(program));gl.useProgram(program);const buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);const p=gl.getAttribLocation(program,"p");gl.enableVertexAttribArray(p);gl.vertexAttribPointer(p,2,gl.FLOAT,false,0,0);this.program=program;this.u={resolution:gl.getUniformLocation(program,"r"),time:gl.getUniformLocation(program,"t"),color:gl.getUniformLocation(program,"c"),altitude:gl.getUniformLocation(program,"a"),hologram:gl.getUniformLocation(program,"o")};}
      catch(error){console.warn("WebGL mission viewer unavailable",error);this.gl=null;this.ctx=this.canvas.getContext("2d");}
    }
    resizeCanvas(){const ratio=Math.min(devicePixelRatio||1,2),rect=this.canvas.getBoundingClientRect();this.canvas.width=Math.max(320,Math.round(rect.width*ratio));this.canvas.height=Math.max(240,Math.round(rect.height*ratio));if(this.gl)this.gl.viewport(0,0,this.canvas.width,this.canvas.height);}
    setWorld(world){this.world=palette[world]?world:"time";this.render(performance.now());}
    setAltitude(value){this.altitude=Number(value)||250;}\n    setHolographic(enabled){this.holographic=Boolean(enabled);this.canvas.classList.toggle("holographic",this.holographic);this.render(performance.now());}
    start(){if(!this.running){this.running=true;this.startedAt=performance.now()-this.elapsed;requestAnimationFrame(t=>this.render(t));}}
    pause(){this.running=false;}
    reset(){this.running=false;this.elapsed=0;this.render(0);}
    seconds(){return Math.floor(this.elapsed/1000);}
    render(now){if(this.running)this.elapsed=now-this.startedAt;if(this.gl){const gl=this.gl,c=palette[this.world];gl.useProgram(this.program);gl.uniform2f(this.u.resolution,this.canvas.width,this.canvas.height);gl.uniform1f(this.u.time,(now||0)/1000);gl.uniform3f(this.u.color,c[0],c[1],c[2]);gl.uniform1f(this.u.altitude,Math.min(this.altitude,900)/1000);gl.uniform1f(this.u.hologram,this.holographic?1:0);gl.drawArrays(gl.TRIANGLES,0,6);}else if(this.ctx){const ctx=this.ctx,w=this.canvas.width,h=this.canvas.height,c=palette[this.world];ctx.fillStyle="#02040e";ctx.fillRect(0,0,w,h);ctx.fillStyle="rgb("+c.map(v=>Math.round(v*255)).join(",")+")";ctx.beginPath();ctx.arc(w/2,h/2,Math.min(w,h)*.27,0,Math.PI*2);ctx.fill();}if(this.running)requestAnimationFrame(t=>this.render(t));}
  }
  window.SpaceVerseEngine=SpaceVerseEngine;
})();
