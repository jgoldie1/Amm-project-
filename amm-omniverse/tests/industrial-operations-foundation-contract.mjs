import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const sourcePath=path.join(process.cwd(),'src/foundation/industrialOperationsFoundation.ts')
if(!fs.existsSync(sourcePath))throw new Error('Industrial operations foundation is missing')
const source=fs.readFileSync(sourcePath,'utf8')

for(const token of[
  "'ADDITIVE_MANUFACTURING'",
  "'WAREHOUSE'",
  "'IMPORT_EXPORT'",
  "'MINING'",
  "'CROP_GROWING'",
  "'SUPPLIER_NETWORK'",
  'TRYAMM 12D Forge',
  '12D printing is a TRYAMM brand/research label',
  'warehouse-digital-twin',
  'global-import-export-control',
  'mine-operations-digital-twin',
  'crop-production-control',
  'supplier-network-crm',
  'validateSupplierOutreach',
  'human-approval-required',
  'compliance-check-required',
  'supplier-opted-out',
  'restricted-party-hold',
  'providerActionRequired:true',
  'mayIndustrialAIFileCustoms(){return false as const}',
  'mayIndustrialAIApproveMiningPermit(){return false as const}',
  'mayIndustrialAIBypassWarehouseInventoryTruth(){return false as const}',
  'mayIndustrialAIAutoSendSupplierOutreachWithoutApproval(){return false as const}',
]){
  if(!source.includes(token))throw new Error(`Industrial operations contract missing: ${token}`)
}

if(!source.includes("regulatedOperatorOnly:['customs filing/admissibility'"))throw new Error('Regulated operator authority boundary must remain explicit')
if(!source.includes("neverAutoAuthorize:['supplier payment'"))throw new Error('Industrial AI auto-authorization denylist must remain explicit')

console.log('Industrial operations foundation contract: PASS')
