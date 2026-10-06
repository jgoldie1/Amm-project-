export type OmniLiveLayout='panel'|'grid'|'fixed'
export type OmniLiveSeat={id:string;participantId:string|null;displayName:string;mode:'video'|'audio'|'empty';verified:boolean}
export type OmniLiveProgram={id:string;label:string;votes:number;giftBoost:number;enabled:boolean}
export type OmniLiveSuperRoomState={roomId:string;layout:OmniLiveLayout;seatCount:4|6|9|12;seats:OmniLiveSeat[];requests:Array<{id:string;participantId:string;displayName:string;mode:'video'|'audio'}>;pk:{enabled:boolean;opponentRoomId:string|null;left:number;right:number;endsAt:number|null};programs:OmniLiveProgram[];productId:string|null}

const KEY='tryamm.omni-live-super-room.v1'
const emptySeats=(count:4|6|9|12):OmniLiveSeat[]=>Array.from({length:count},(_,i)=>({id:'seat-'+(i+1),participantId:null,displayName:'EMPTY',mode:'empty',verified:false}))
function fresh():OmniLiveSuperRoomState{return{roomId:'tryamm-live',layout:'panel',seatCount:4,seats:emptySeats(4),requests:[],pk:{enabled:false,opponentRoomId:null,left:0,right:0,endsAt:null},programs:[],productId:null}}
function load(){try{const raw=JSON.parse(localStorage.getItem(KEY)||'null');if(!raw)return fresh();const count=([4,6,9,12].includes(Number(raw.seatCount))?Number(raw.seatCount):4) as 4|6|9|12;return{...fresh(),...raw,seatCount:count,seats:Array.isArray(raw.seats)?raw.seats.slice(0,count):emptySeats(count),requests:[],pk:{...fresh().pk,...raw.pk}}}catch{return fresh()}}
function save(state:OmniLiveSuperRoomState){try{localStorage.setItem(KEY,JSON.stringify({...state,requests:[]}))}catch{}}
function emit(state:OmniLiveSuperRoomState,reason:string){window.dispatchEvent(new CustomEvent('tryamm:omni-live-super-room-state',{detail:{...state,reason,noFakeParticipants:true,providerConnectionRequiredForGuests:true}}))}

export function installOmniLiveSuperRoomRuntime(){
 if(typeof window==='undefined')return()=>{}
 let state=load()
 const publish=(reason:string)=>{save(state);emit(state,reason)}
 const onRoom=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};if(d.roomName)state.roomId=String(d.roomName);publish('room')}
 const onLayout=(event:Event)=>{const d=(event as CustomEvent<{layout?:OmniLiveLayout;seatCount?:number}>).detail||{};if(['panel','grid','fixed'].includes(String(d.layout)))state.layout=d.layout as OmniLiveLayout;const count=Number(d.seatCount);if([4,6,9,12].includes(count)){state.seatCount=count as 4|6|9|12;state.seats=emptySeats(state.seatCount)}publish('layout')}
 const onRequest=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};const id=String(d.id||d.participantId||'');if(!id)return;if(!state.requests.some(x=>x.id===id))state.requests=[...state.requests,{id,participantId:String(d.participantId||id),displayName:String(d.displayName||'Guest'),mode:d.mode==='audio'?'audio':'video'}].slice(-30);publish('guest-request')}
 const onAccept=(event:Event)=>{const d=(event as CustomEvent<{id?:string}>).detail||{};const req=state.requests.find(x=>x.id===d.id);if(!req)return;const idx=state.seats.findIndex(x=>!x.participantId);if(idx<0)return;state.seats[idx]={id:state.seats[idx].id,participantId:req.participantId,displayName:req.displayName,mode:req.mode,verified:true};state.requests=state.requests.filter(x=>x.id!==req.id);publish('guest-accepted')}
 const onRemove=(event:Event)=>{const d=(event as CustomEvent<{participantId?:string}>).detail||{};state.seats=state.seats.map(x=>x.participantId===d.participantId?{...x,participantId:null,displayName:'EMPTY',mode:'empty',verified:false}:x);publish('guest-removed')}
 const onPk=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};state.pk={enabled:Boolean(d.enabled),opponentRoomId:d.opponentRoomId?String(d.opponentRoomId):null,left:Number(d.left||0),right:Number(d.right||0),endsAt:d.endsAt?Number(d.endsAt):null};publish('pk')}
 const onProgram=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};if(!d.id||!d.label)return;const existing=state.programs.find(x=>x.id===String(d.id));if(existing){existing.label=String(d.label);existing.enabled=d.enabled!==false}else state.programs.push({id:String(d.id),label:String(d.label),votes:0,giftBoost:0,enabled:d.enabled!==false});state.programs=state.programs.slice(-12);publish('program')}
 const onVote=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};const p=state.programs.find(x=>x.id===String(d.programId));if(!p)return;p.votes+=1;if(d.verifiedGiftValue)p.giftBoost+=Math.max(0,Number(d.verifiedGiftValue)||0);publish('vote')}
 const onProduct=(event:Event)=>{const d=(event as CustomEvent<any>).detail||{};state.productId=d.productId?String(d.productId):null;publish('product')}
 addEventListener('tryamm:live-session',onRoom)
 addEventListener('tryamm:live-super-room-layout',onLayout)
 addEventListener('tryamm:live-guest-request',onRequest)
 addEventListener('tryamm:live-guest-accept',onAccept)
 addEventListener('tryamm:live-guest-remove',onRemove)
 addEventListener('tryamm:live-super-room-pk',onPk)
 addEventListener('tryamm:live-program-upsert',onProgram)
 addEventListener('tryamm:live-program-vote',onVote)
 addEventListener('tryamm:live-shopping-product-featured',onProduct)
 publish('startup')
 return()=>{removeEventListener('tryamm:live-session',onRoom);removeEventListener('tryamm:live-super-room-layout',onLayout);removeEventListener('tryamm:live-guest-request',onRequest);removeEventListener('tryamm:live-guest-accept',onAccept);removeEventListener('tryamm:live-guest-remove',onRemove);removeEventListener('tryamm:live-super-room-pk',onPk);removeEventListener('tryamm:live-program-upsert',onProgram);removeEventListener('tryamm:live-program-vote',onVote);removeEventListener('tryamm:live-shopping-product-featured',onProduct)}
}