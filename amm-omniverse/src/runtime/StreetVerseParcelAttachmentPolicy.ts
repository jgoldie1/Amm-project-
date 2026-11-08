/**
 * Canonical visual parcel policy. This is a game-world attachment state machine,
 * not a financial reward or real delivery authority.
 */
export type StreetVerseParcelStage='dispatch'|'pickup'|'drive'|'handoff'|'complete'
export type StreetVerseParcelParent='hero'|'van'|'vendor'
export type StreetVerseParcelAttachment=Readonly<{parent:StreetVerseParcelParent;visible:boolean}>

export function parcelAttachmentState(stage:string,inHoloVan:boolean):StreetVerseParcelAttachment{
  if(stage==='complete')return {parent:'vendor',visible:true}
  const carrying=stage==='drive'||stage==='handoff'
  return {parent:carrying&&inHoloVan?'van':'hero',visible:carrying}
}
