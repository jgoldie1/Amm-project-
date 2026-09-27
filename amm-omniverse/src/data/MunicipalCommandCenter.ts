import { MUNICIPAL_JOBS, type MunicipalDepartment } from './MunicipalOperationsEngine'

export type MunicipalCareerLevel='worker'|'lead'|'supervisor'|'department-manager'|'city-administrator'|'elected-role-simulation'
export type ServicePriority='normal'|'service-due'|'urgent'
export type ServiceRequest={id:string;department:MunicipalDepartment;kind:string;district:string;priority:ServicePriority;status:'open'|'dispatched'|'active'|'resolved';source:'simulation'|'player-report';createdAt:number}
export type DepartmentBudget={department:MunicipalDepartment;operating:number;payroll:number;maintenance:number;capital:number;spent:number}
export type MunicipalKPI={department:MunicipalDepartment;serviceBacklog:number;avgResponseMinutes:number;assetCondition:number;residentSatisfaction:number}

export const MUNICIPAL_CAREER_LADDER:MunicipalCareerLevel[]=['worker','lead','supervisor','department-manager','city-administrator','elected-role-simulation']

export const CITY_HALL_DEPARTMENTS:MunicipalDepartment[]=['sanitation','water','streets','transit','parks','buildings','public-health','fire-ems','311-services','fleet','environment']

export const DEFAULT_DEPARTMENT_BUDGETS:DepartmentBudget[]=CITY_HALL_DEPARTMENTS.map(department=>({department,operating:0,payroll:0,maintenance:0,capital:0,spent:0}))

export function dispatchRequest(request:ServiceRequest){
 return {...request,status:'dispatched' as const}
}

export function availableMunicipalJobs(department?:MunicipalDepartment){
 return department?MUNICIPAL_JOBS.filter(job=>job.department===department):MUNICIPAL_JOBS
}

export function cityHallCommandCenter(){
 return{
  product:'StreetVerse Municipal Command Center',
  scope:'fictional gameplay simulation inspired by municipal operations',
  departments:CITY_HALL_DEPARTMENTS,
  careers:MUNICIPAL_CAREER_LADDER,
  panels:['service-map','311-queue','dispatch','work-orders','department-budgets','fleet','utilities','transit','parks','environment','jobs','city-kpis','events'],
  loops:[
   'service demand -> request -> dispatch -> worker/NPC mission -> resolution -> KPI/reward update',
   'asset wear -> inspection -> work order -> repair -> condition update',
   'weather/event -> demand spike -> staffing/route decision -> city outcome',
   'budget -> staffing/maintenance/capital decision -> service capacity -> simulated resident/business effects'
  ],
  safety:[
   'Do not present gameplay roles as actual City of Chicago employment.',
   'Do not expose sensitive real-world emergency, security, utility or access-control details.',
   'Use aggregate/synthetic resident data unless a person explicitly contributes authorized data.',
   'Real government data, branding and integrations require appropriate source terms and authorization.'
  ]
 } as const
}
