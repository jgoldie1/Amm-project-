import {executeOne} from '../api/_lib/ai-cafe-executor.js';
// Bounded invocation: schedule externally only after deployment and budget review.
if(!process.env.SUPABASE_SERVICE_ROLE_KEY)throw new Error('Server service-role configuration required');
let count=0;
try{
 for(let i=0;i<10;i++){
  const result=await executeOne();
  if(!result.executed)break;
  count++;
  console.log(JSON.stringify(result));
 }
 console.log(JSON.stringify({processed:count}));
}catch{console.error('Execution worker stopped: database unavailable. Leased jobs recover after 60 seconds.');process.exitCode=1}
