function degToRad(v){return Number(v)*Math.PI/180}
function clamp(v,min,max){return Math.max(min,Math.min(max,v))}
function buildViewSectors({viewCount=4,viewingConeDeg=90,startDeg=0}={}){
  const count=Math.max(1,Math.floor(Number(viewCount)||1));
  const cone=clamp(Number(viewingConeDeg)||90,1,360);
  const step=cone/count;
  return Array.from({length:count},(_,i)=>({index:i,azimuthDeg:startDeg+(i+0.5)*step,sectorStartDeg:startDeg+i*step,sectorEndDeg:startDeg+(i+1)*step}));
}
function buildCameraRig({viewCount=4,viewingConeDeg=90,viewerDistanceMm=500,opticalCenterOffsetMm={x:0,y:0,z:0},fovDeg=45}={}){
  return buildViewSectors({viewCount,viewingConeDeg,startDeg:-viewingConeDeg/2}).map(v=>{
    const a=degToRad(v.azimuthDeg),d=Math.max(50,Number(viewerDistanceMm)||500);
    return {...v,positionMm:{x:Number(opticalCenterOffsetMm.x||0)+Math.sin(a)*d,y:Number(opticalCenterOffsetMm.y||0),z:Number(opticalCenterOffsetMm.z||0)+Math.cos(a)*d},lookAtMm:{x:Number(opticalCenterOffsetMm.x||0),y:Number(opticalCenterOffsetMm.y||0),z:Number(opticalCenterOffsetMm.z||0)},fovDeg:Number(fovDeg)||45};
  });
}
function buildPackingPlan({viewCount=4,resolutionPx={width:1920,height:1080},layout='grid'}={}){
  const n=Math.max(1,Math.floor(Number(viewCount)||1)),w=Math.max(1,Math.floor(Number(resolutionPx.width)||1920)),h=Math.max(1,Math.floor(Number(resolutionPx.height)||1080));
  if(layout==='horizontal-strip') return Array.from({length:n},(_,i)=>({view:i,x:Math.floor(i*w/n),y:0,width:Math.floor(w/n),height:h}));
  if(layout==='vertical-strip') return Array.from({length:n},(_,i)=>({view:i,x:0,y:Math.floor(i*h/n),width:w,height:Math.floor(h/n)}));
  const cols=Math.ceil(Math.sqrt(n)),rows=Math.ceil(n/cols),cw=Math.floor(w/cols),ch=Math.floor(h/rows);
  return Array.from({length:n},(_,i)=>({view:i,x:(i%cols)*cw,y:Math.floor(i/cols)*ch,width:cw,height:ch}));
}
function calibrateQuantumCone(input={}){
  const geometry={coneAngleDeg:Number(input.coneAngleDeg)||45,coneHeightMm:Number(input.coneHeightMm)||120,viewerDistanceMm:Number(input.viewerDistanceMm)||500,displayWidthMm:Number(input.displayWidthMm)||300,displayHeightMm:Number(input.displayHeightMm)||170,viewCount:Math.max(1,Math.floor(Number(input.viewCount)||4)),viewingConeDeg:Number(input.viewingConeDeg)||90,opticalCenterOffsetMm:input.opticalCenterOffsetMm||{x:0,y:0,z:0},resolutionPx:input.resolutionPx||{width:1920,height:1080}};
  const slantMm=geometry.coneHeightMm/Math.max(0.1,Math.cos(degToRad(geometry.coneAngleDeg)));
  const footprintRadiusMm=geometry.coneHeightMm*Math.tan(degToRad(geometry.coneAngleDeg));
  const warnings=[];
  if(footprintRadiusMm*2>geometry.displayWidthMm) warnings.push('Cone footprint exceeds display width; crop/scale or change geometry.');
  if(geometry.viewCount>16) warnings.push('High view count may exceed mobile/browser performance budgets.');
  if(geometry.coneAngleDeg<=10||geometry.coneAngleDeg>=80) warnings.push('Extreme cone angle requires optical validation.');
  return {geometry:{...geometry,slantMm,footprintRadiusMm},cameraRig:buildCameraRig(geometry),packing:buildPackingPlan({viewCount:geometry.viewCount,resolutionPx:geometry.resolutionPx,layout:input.layout||'grid'}),warpModel:{type:'measured-homography-required',requiresMeasuredHomography:true},validationTargets:['checkerboard alignment','cross-view crosstalk','brightness uniformity','gamma consistency','optical center error','viewer sweet-spot width','ghost-image level'],warnings};
}
module.exports={buildViewSectors,buildCameraRig,buildPackingPlan,calibrateQuantumCone};
