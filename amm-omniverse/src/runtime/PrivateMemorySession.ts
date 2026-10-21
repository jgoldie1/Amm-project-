/** Account-scoped memory. No signed-in payload is stored in browser localStorage. */
export class PrivateMemorySession {
 owner:string|null=null
 generation=0
 row:any=null
 ready=false
 constructor(public namespace:'world'|'catalog'|'business',private client:any){}
 switchOwner(owner:string|null){this.owner=owner;this.generation++;this.row=null;this.ready=false}
 async load(){
  const owner=this.owner,generation=this.generation
  if(!owner||!this.client)return null
  const {data,error}=await this.client.from('private_memory_documents').select('*').eq('user_id',owner).eq('namespace',this.namespace).maybeSingle()
  if(generation!==this.generation)return null
  if(error)throw new Error('Memory could not be loaded. Your saved data has not been replaced.')
  this.row=data;this.ready=true;return data
 }
 async save(payload:unknown){
  const owner=this.owner,generation=this.generation,row=this.row
  if(!owner||!this.ready)throw new Error('Sign in and load memory before saving.')
  if(new TextEncoder().encode(JSON.stringify(payload)).length>240000)throw new Error('Memory limit reached. Export and reduce the record size.')
  const table=this.client.from('private_memory_documents')
  const request=row?table.update({payload}).eq('user_id',owner).eq('namespace',this.namespace).eq('revision',row.revision):table.insert({user_id:owner,namespace:this.namespace,payload})
  const {data,error}=await request.select('*').maybeSingle()
  if(generation!==this.generation)return null
  if(error||!data)throw new Error('Memory changed elsewhere or saving failed. Reload before trying again.')
  this.row=data;return data
 }
 async remove(){
  const owner=this.owner,generation=this.generation,row=this.row
  if(!owner||!this.ready)throw new Error('Sign in and load memory first.')
  if(!row)return true
  const {data,error}=await this.client.from('private_memory_documents').delete().eq('user_id',owner).eq('namespace',this.namespace).eq('revision',row.revision).select('revision').maybeSingle()
  if(generation!==this.generation)return false
  if(error||!data)throw new Error('Memory changed elsewhere or deletion failed. Reload first.')
  this.row=null;return true
 }
}
