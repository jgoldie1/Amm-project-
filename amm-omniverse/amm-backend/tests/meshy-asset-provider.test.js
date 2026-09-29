'use strict'

const assert=require('node:assert/strict')
const {createMeshyAssetProvider,cleanPrompt,safeTaskId}=require('../lib/meshy-asset-provider')

async function main(){
  assert.equal(cleanPrompt(' hello '),'hello')
  assert.throws(()=>cleanPrompt(''),/PROMPT_REQUIRED/)
  assert.throws(()=>cleanPrompt('x'.repeat(801)),/PROMPT_TOO_LONG/)
  assert.equal(safeTaskId('abc-123_def'),'abc-123_def')
  assert.throws(()=>safeTaskId('../secret'),/INVALID_MESHY_TASK_ID/)

  const requests=[]
  const fakeFetch=async(url,options={})=>{
    requests.push({url,options})
    if(String(url).endsWith('/openapi/v2/text-to-3d')&&options.method==='POST'){
      return {ok:true,status:200,json:async()=>({result:requests.length===1?'preview-1':'refine-1'})}
    }
    return {ok:true,status:200,json:async()=>({
      id:'preview-1',type:'text-to-3d-preview',status:'SUCCEEDED',progress:100,
      model_urls:{glb:'https://assets.meshy.ai/example/model.glb'},
      thumbnail_url:'https://assets.meshy.ai/example/preview.png',
    })}
  }

  const provider=createMeshyAssetProvider({apiKey:'test-key',fetchImpl:fakeFetch})
  assert.equal(provider.configured,true)

  const preview=await provider.createPreview({prompt:'original Chicago street bench, production game asset',targetPolycount:60000})
  assert.equal(preview.taskId,'preview-1')
  const previewBody=JSON.parse(requests[0].options.body)
  assert.equal(previewBody.mode,'preview')
  assert.equal(previewBody.ai_model,'latest')
  assert.deepEqual(previewBody.target_formats,['glb'])
  assert.equal(previewBody.should_remesh,true)
  assert.equal(requests[0].options.headers.Authorization,'Bearer test-key')

  const refine=await provider.createRefine({previewTaskId:'preview-1',texturePrompt:'weathered painted metal PBR',textureResolution:'4k'})
  assert.equal(refine.taskId,'refine-1')
  const refineBody=JSON.parse(requests[1].options.body)
  assert.equal(refineBody.mode,'refine')
  assert.equal(refineBody.preview_task_id,'preview-1')
  assert.equal(refineBody.enable_pbr,true)
  assert.equal(refineBody.texture_resolution,'4k')
  assert.equal(refineBody.auto_size,true)

  const task=await provider.getTask('preview-1')
  assert.equal(task.status,'SUCCEEDED')
  assert.ok(task.modelUrls.glb)
  assert.ok(task.thumbnailUrl)

  const unconfigured=createMeshyAssetProvider({apiKey:'',fetchImpl:fakeFetch})
  assert.equal(unconfigured.configured,false)
  await assert.rejects(()=>unconfigured.createPreview({prompt:'x'}),/MESHY_NOT_CONFIGURED/)

  console.log('Meshy Asset Forge provider contract: PASS')
}

main().catch(error=>{console.error(error);process.exit(1)})
