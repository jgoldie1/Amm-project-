import React, { useMemo, useState } from 'react'
import { calculateRentalSubtotalCents, type CarShareVehicle } from '../mobility/tryammCarShare'

const DEMO_VEHICLES: CarShareVehicle[] = [
  { id: 'demo-1', ownerUserId: 'demo-host', displayName: 'City Compact', vehicleClass: 'COMPACT', pickupArea: 'Chicago', dailyRateCents: 4900, currency: 'USD', status: 'AVAILABLE', provider: 'TRYAMM' },
  { id: 'demo-2', ownerUserId: 'demo-host', displayName: 'Family SUV', vehicleClass: 'SUV', pickupArea: 'Chicago', dailyRateCents: 7900, currency: 'USD', status: 'AVAILABLE', provider: 'TRYAMM' },
]

export default function TryAMMCarShareCenter({ onClose }: { onClose?: () => void }) {
  const [mode, setMode] = useState<'RENT' | 'HOST'>('RENT')
  const [selected, setSelected] = useState<CarShareVehicle | null>(null)
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString()
  const dayAfter = new Date(Date.now() + 172_800_000).toISOString()
  const subtotal = useMemo(() => selected ? calculateRentalSubtotalCents(selected, { vehicleId: selected.id, renterUserId: 'preview', startsAt: tomorrow, endsAt: dayAfter }) : 0, [selected, tomorrow, dayAfter])

  return <section aria-label="TRYAMM Car Share" style={{ padding: 16, maxWidth: 720, margin: '0 auto' }}>
    <header style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
      <div><h2>TRYAMM Car Share</h2><p>Native peer-to-peer vehicle marketplace. Preview only until compliance and production services are certified.</p></div>
      {onClose && <button onClick={onClose} aria-label="Close car share">Close</button>}
    </header>
    <nav aria-label="Car share modes" style={{ display: 'flex', gap: 8 }}>
      <button onClick={() => setMode('RENT')} aria-pressed={mode === 'RENT'}>Rent a car</button>
      <button onClick={() => setMode('HOST')} aria-pressed={mode === 'HOST'}>List my car</button>
    </nav>
    {mode === 'RENT' ? <div>
      <h3>Available preview vehicles</h3>
      {DEMO_VEHICLES.map(vehicle => <article key={vehicle.id} style={{ border: '1px solid currentColor', borderRadius: 12, padding: 12, marginBottom: 10 }}>
        <strong>{vehicle.displayName}</strong><div>{vehicle.vehicleClass} · {vehicle.pickupArea} · ${(vehicle.dailyRateCents / 100).toFixed(2)}/day</div>
        <button onClick={() => setSelected(vehicle)}>View rental preview</button>
      </article>)}
      {selected && <aside aria-live="polite"><h3>{selected.displayName}</h3><p>Estimated one-day subtotal: ${(subtotal / 100).toFixed(2)}</p><p>Booking remains disabled until identity, driver eligibility, vehicle verification, protection/insurance, payments, disputes and support are production-certified.</p><button disabled>Request booking — coming soon</button></aside>}
    </div> : <div>
      <h3>Become a host</h3>
      <p>Hosts will add a vehicle, ownership/authorization evidence, availability, pickup rules and pricing. A listing cannot become AVAILABLE until vehicle and host verification pass.</p>
      <button disabled>Start verified listing — coming soon</button>
    </div>}
  </section>
}
