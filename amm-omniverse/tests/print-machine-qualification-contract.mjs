import assert from 'node:assert/strict'
import fs from 'node:fs'

const read=rel=>fs.readFileSync(new URL(rel,import.meta.url),'utf8')
const migration=read('../supabase/migrations/20261002133000_print_machine_qualification.sql')
const network=read('../api/_lib/print-network.js')
const api=read('../api/print-network/index.js')
const swarm=read('../api/_lib/print-swarm.js')

for(const token of [
 'create table if not exists public.print_network_printers',
 "qualification_status text not null default 'unverified'",
 "check (qualification_status in ('unverified','sample-required','review','qualified','suspended','retired','rejected'))",
 'assigned_printer_id uuid references public.print_network_printers',
 'printer_id uuid references public.print_network_printers',
 'grant select,insert,update,delete on table public.print_network_printers to service_role',
]) assert.ok(migration.includes(token),`printer qualification migration missing ${token}`)

for(const token of [
 'printerQualificationForJob',
 "printer.qualification_status!=='qualified'",
 "printer.availability!=='available'",
 "printer-maintenance-required",
 "process-mismatch",
 "material-mismatch",
 "build-volume-too-small",
 "tolerance-not-qualified",
 'selectQualifiedPrinter',
 'assigned_printer_id:printer.id',
]) assert.ok(network.includes(token),`print acceptance gate missing ${token}`)

assert.ok(network.includes('qualificationDoesNotImplyExternalCertification:true'),'internal qualification must not imply regulatory/manufacturer certification')
assert.ok(network.includes("printer_sample_evidence_required_before_qualification"),'qualification must require sample/calibration evidence')
assert.ok(api.includes("action==='register-printer'"),'API must allow printer registration')
assert.ok(api.includes("action==='submit-printer-sample'"),'API must allow sample evidence submission')
assert.ok(api.includes("action==='qualify-printer'"),'authorized reviewer must be able to qualify a printer')
assert.ok(api.includes("Job accepted only after certified-operator + qualified-compatible-printer checks passed."),'claim response must state the combined operator+machine acceptance gate')

assert.ok(swarm.includes('printerQualificationForJob(entry.printer,job).qualified'),'swarm planning must require a qualified compatible printer for each shard')
assert.ok(swarm.includes('printer_id:printer.id'),'swarm assignment must bind a real qualified printer')
assert.ok(swarm.includes('swarm_printer_no_longer_qualified'),'swarm acceptance must re-check qualification at acceptance time')
assert.ok(swarm.includes('qualifiedPrinterPerShard:true'),'swarm policy must require one qualified printer per shard')

console.log('TRYAMM printer qualification + job acceptance contract: PASS')
