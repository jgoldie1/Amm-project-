/** Readiness report generated from configured service gates.
 * Not a live provider test; no browser claims can authorize a service. */
export const HOLO_SERVICES=['advertising','rideshare','delivery','freight','drone','payments','support','identity','privacy','accessibility','safety','analytics']
export function buildHoloReadinessReport(evaluate,at=new Date()){
 const services=HOLO_SERVICES.map(service=>{
  const status=evaluate(service,[])
  return {service,ready:false,verifiedGates:status.passed,requiredGates:status.total,missing:status.missing}
 })
 return {
  schema:'tryamm.holoservices.readiness.v1',generatedAt:at.toISOString(),scope:'launch-gate-policy-audit',
  evidenceSource:'no independently verified provider evidence supplied',
  liveProviderChecksPerformed:false,realTransactionsPerformed:false,
  providerAuthorizations:0,publicLaunchReady:false,services,
  warnings:[
   'A readiness audit is not a unit, integration, live dispatch, payment or device test.',
   'Provider passport registry SQL has not been applied or independently audited.',
   'No operating permits, provider callbacks, monetary settlement or freight tracking were verified.'
  ]
 }
}
