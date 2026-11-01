import {type CaptureRecord,type CaptureView,REQUIRED_VIEWS,validateCapture} from './StreetVerseMultiViewScan';
export type QualityResult={view:CaptureView;valid:boolean;warnings:string[];width:number;height:number};
export async function inspectScanImage(record:CaptureRecord):Promise<QualityResult>{
 const warnings:string[]=[];
 try{validateCapture(record)}catch(e){warnings.push(e instanceof Error?e.message:'Invalid image')}
 let width=0,height=0;
 if(warnings.length===0){
  try{
   const image=await createImageBitmap(record.blob);
   width=image.width;height=image.height;image.close();
   if(width<512||height<512)warnings.push('Image is below recommended 512 × 512 resolution');
   if(width>8192||height>8192)warnings.push('Image dimensions exceed 8192 pixels');
  }catch{warnings.push('Image could not be decoded')}
 }
 return {view:record.view,valid:warnings.length===0,warnings,width,height};
}
export async function reviewScanQuality(records:CaptureRecord[]){
 const results=await Promise.all(records.map(inspectScanImage));
 const found=new Set(records.map(r=>r.view));
 const missing=REQUIRED_VIEWS.filter(view=>!found.has(view));
 return {ready:missing.length===0&&results.every(r=>r.valid),missing,results};
}
// Quality checks are preliminary only: they do not measure face similarity,
// pose alignment, spoofing, identity, lighting or 3D reconstruction accuracy.
