/**
 * Removes bright, nearly neutral photographic background connected to the
 * OUTER portrait border. Unlike a color-key filter, this does not erase
 * disconnected eye highlights, gray beard, or skin within the center.
 * In-place RGBA operation on the existing 256² canvas: no models, network,
 * external credits or image upload. Not a true face segmentation/UV scan.
 */
export function suppressBJPortraitBackdrop(rgba:Uint8ClampedArray,width:number,height:number):number {
 const count=width*height
 if(!Number.isInteger(width)||!Number.isInteger(height)||width<2||height<2||rgba.length<count*4||count>1024*1024)return 0
 const visited=new Uint8Array(count)
 const queue=new Uint32Array(count)
 let tail=0,head=0
 const isOuterPale=(index:number)=>{
  const a=index*4
  if(rgba[a+3]<12)return false
  const r=rgba[a],g=rgba[a+1],b=rgba[a+2]
  const luminosity=(.2126*r+.7152*g+.0722*b)/255
  const chroma=(Math.max(r,g,b)-Math.min(r,g,b))/255
  if(luminosity<.49||chroma>.245||b<r*.79)return false
  const x=index%width,y=Math.floor(index/width)
  const nx=(x-(width-1)*.5)/(width*.5),ny=(y-(height-1)*.5)/(height*.5)
  // Keep the central gray beard/temples even if similar to a bright backdrop.
  return nx*nx/(.65*.65)+ny*ny/(.82*.82)>1
 }
 const enqueue=(i:number)=>{if(visited[i]||!isOuterPale(i))return;visited[i]=1;queue[tail++]=i}
 for(let x=0;x<width;x++){enqueue(x);enqueue((height-1)*width+x)}
 for(let y=0;y<height;y++){enqueue(y*width);enqueue(y*width+width-1)}
 while(head<tail){
  const i=queue[head++],x=i%width,y=Math.floor(i/width)
  if(x>0)enqueue(i-1)
  if(x+1<width)enqueue(i+1)
  if(y>0)enqueue(i-width)
  if(y+1<height)enqueue(i+width)
 }
 for(let i=0;i<count;i++)if(visited[i])rgba[i*4+3]=0
 return tail
}
