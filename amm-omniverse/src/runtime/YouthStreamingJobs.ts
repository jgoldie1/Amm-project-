export type YouthStreamingJob={title:string;role:'youth-stream-admin'|'senior-youth-stream-admin'|'youth-safety-supervisor';duties:string[];requirements:string[]}
export const YOUTH_STREAMING_JOBS:YouthStreamingJob[]=[
 {title:'Youth Streaming Admin',role:'youth-stream-admin',duties:['review youth streaming requests','verify guardian requirements','moderate youth live rooms','route safety concerns'],requirements:['adult staff account','youth-safety training','MFA','audited admin access']},
 {title:'Senior Youth Streaming Admin',role:'senior-youth-stream-admin',duties:['approve routine eligible youth tickets','review escalations','coach admins','audit moderation quality'],requirements:['adult staff account','advanced youth-safety training','MFA','least-privilege access']},
 {title:'Youth Safety Supervisor',role:'youth-safety-supervisor',duties:['handle sensitive escalations','review appeals','manage youth admin coverage','coordinate trust and safety'],requirements:['adult staff account','supervisor authorization','MFA','enhanced audit']}
]
