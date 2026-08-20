export type EntityVersion={id:string;version:number;updatedAt:string};
export type PersistenceResult<T>={ok:true;value:T}|{ok:false;code:'not_found'|'conflict'|'unauthorized'|'validation'|'provider_error';message:string};

export interface AccountRepository<TAccount extends EntityVersion>{get(accountId:string):Promise<PersistenceResult<TAccount>>;save(account:TAccount,expectedVersion?:number):Promise<PersistenceResult<TAccount>>;}
export interface OrderRepository<TOrder extends EntityVersion>{get(orderId:string,accountId:string):Promise<PersistenceResult<TOrder>>;save(order:TOrder,expectedVersion?:number):Promise<PersistenceResult<TOrder>>;listByAccount(accountId:string):Promise<PersistenceResult<TOrder[]>>;}
export interface DeliveryEventRepository<TEvent>{append(orderId:string,event:TEvent):Promise<PersistenceResult<TEvent>>;list(orderId:string,accountId:string):Promise<PersistenceResult<TEvent[]>>;}
export interface AuditRepository<TAudit>{append(event:TAudit):Promise<PersistenceResult<TAudit>>;listByCorrelationId(correlationId:string,authorizedAccountId:string):Promise<PersistenceResult<TAudit[]>>;}
export interface MoneyEventRepository<TMoney>{append(event:TMoney):Promise<PersistenceResult<TMoney>>;listRange(start:string,end:string):Promise<PersistenceResult<TMoney[]>>;}

export type LaunchCoreEvent={id:string;type:'account.updated'|'jarvis.action_requested'|'jarvis.action_approved'|'order.created'|'order.updated'|'delivery.updated'|'money.recorded'|'gift.created'|'payout.updated'|'sustainability.updated';accountId?:string;correlationId:string;occurredAt:string;payload:Record<string,unknown>};
export interface EventBus{publish(event:LaunchCoreEvent):Promise<void>;subscribe(type:LaunchCoreEvent['type'],handler:(event:LaunchCoreEvent)=>Promise<void>):()=>void;}

export class InMemoryEventBus implements EventBus{
 private handlers=new Map<LaunchCoreEvent['type'],Set<(event:LaunchCoreEvent)=>Promise<void>>>();
 async publish(event:LaunchCoreEvent){for(const h of this.handlers.get(event.type)??[])await h(event);}
 subscribe(type:LaunchCoreEvent['type'],handler:(event:LaunchCoreEvent)=>Promise<void>){const set=this.handlers.get(type)??new Set();set.add(handler);this.handlers.set(type,set);return()=>set.delete(handler);}
}

export type ProviderAdapterStatus='sandbox'|'gated'|'production';
export interface ProviderAdapter<TRequest,TResponse>{id:string;status:ProviderAdapterStatus;execute(request:TRequest):Promise<PersistenceResult<TResponse>>;health():Promise<{ok:boolean;detail?:string}>;}

// Production implementations must enforce authenticated ownership/RLS server-side.
// Client/localStorage implementations are never authoritative for balances, roles, audit, identity or provider state.
