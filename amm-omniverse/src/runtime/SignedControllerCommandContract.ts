export type SignedControllerEnvelope={sessionId:string;deviceId:string;playerId:string;seq:number;issuedAt:number;nonce:string;action:string;value?:number;keyId:string;signature:string}
export const SIGNED_CONTROLLER_COMMANDS={
 algorithm:'HMAC-SHA-256-or-stronger-server-approved',
 canonicalPayloadRequired:true,
 uniqueNonceRequired:true,
 signingKeyNeverInClientBundle:true,
 shortLivedSessionKey:true,
 keyRotationSupported:true,
 constantTimeSignatureCompare:true,
 signatureVerifiedBeforeGameplay:true,
 tlsRequired:true,
 rejectUnsignedCommands:true,
 audienceEventsNeverSignedAsControllerCommands:true
} as const
export function canonicalControllerPayload(e:Omit<SignedControllerEnvelope,'signature'>){
 return [e.sessionId,e.deviceId,e.playerId,e.seq,e.issuedAt,e.nonce,e.action,e.value??'',e.keyId].map(v=>String(v)).join('|')
}
export function controllerEnvelopeComplete(e:Partial<SignedControllerEnvelope>){
 return Boolean(e.sessionId&&e.deviceId&&e.playerId&&Number.isInteger(e.seq)&&e.issuedAt&&e.nonce&&e.action&&e.keyId&&e.signature)
}
