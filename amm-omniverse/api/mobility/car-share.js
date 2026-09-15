const json = (res, status, body) => res.status(status).json(body)

export default async function handler(req, res) {
  if (req.method === 'GET') {
    return json(res, 200, {
      service: 'TRYAMM_CAR_SHARE',
      status: 'PREVIEW_NOT_LIVE',
      capabilities: ['vehicle-search-preview', 'host-onboarding-preview'],
      releaseGates: ['identity', 'driver-eligibility', 'vehicle-verification', 'protection-or-insurance', 'payments', 'disputes', 'support'],
    })
  }

  if (req.method === 'POST') {
    return json(res, 503, {
      code: 'CAR_SHARE_NOT_LIVE',
      message: 'Real listings and bookings are disabled until server-authoritative compliance, payment, protection and support services are certified.',
    })
  }

  res.setHeader('Allow', 'GET, POST')
  return json(res, 405, { code: 'METHOD_NOT_ALLOWED' })
}
