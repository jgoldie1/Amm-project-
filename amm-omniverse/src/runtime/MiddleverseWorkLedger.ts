export type VerifiedWork={workItemId:string;workerId:string;startedAt:number;endedAt:number;reviewed:boolean;approved:boolean}
export function payableMinutes(w:VerifiedWork){if(!w.reviewed||!w.approved||w.endedAt<=w.startedAt)return 0;return Math.min(12*60,Math.floor((w.endedAt-w.startedAt)/60000))}
export const WORK_LEDGER={serverAuthoritative:true,separateFromPog:true,pogNotCash:true,approvalRequired:true,disputePath:true,noPayForFakeEngagement:true} as const
