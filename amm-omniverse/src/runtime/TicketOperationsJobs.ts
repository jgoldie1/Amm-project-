export type TicketJob={title:string;role:'ticket-agent'|'senior-ticket-agent'|'ticket-supervisor';duties:string[];metrics:string[]}
export const TICKET_JOBS:TicketJob[]=[
 {title:'Streaming Ticket Agent',role:'ticket-agent',duties:['review requests','verify required fields','request missing information','route safety issues'],metrics:['response time','accurate routing','quality']},
 {title:'Senior Streaming Ticket Agent',role:'senior-ticket-agent',duties:['approve routine eligible tickets','decline ineligible routine tickets','coach agents','escalate exceptions'],metrics:['decision accuracy','resolution time','appeal quality']},
 {title:'Ticket Operations Supervisor',role:'ticket-supervisor',duties:['assign queues','review elevated tickets','audit agent decisions','manage coverage'],metrics:['queue health','quality assurance','escalation accuracy']}
]
