import type { ScaleAddress } from './scaleIntelligence'

export type InstrumentKind = 'digital-microscope' | 'telescope' | 'spectrometer' | 'material-characterization' | 'digital-twin' | 'simulation'

export type InstrumentDataset = {
  id: string
  instrument: InstrumentKind
  title: string
  capturedAt?: string
  rawAssetRefs: string[]
  scale: ScaleAddress
  metadata: Record<string, string | number | boolean | null>
}

export interface QuantumVerseInstrumentAdapter {
  id: string
  kind: InstrumentKind
  health(): Promise<{ available: boolean; detail: string }>
  ingest(input: unknown): Promise<InstrumentDataset>
}

export class UnconnectedInstrumentAdapter implements QuantumVerseInstrumentAdapter {
  constructor(public id: string, public kind: InstrumentKind) {}
  async health() {
    return { available: false, detail: `${this.kind} hardware/provider is not connected in this runtime.` }
  }
  async ingest(_input: unknown): Promise<InstrumentDataset> {
    throw new Error(`${this.kind} requires a verified dataset or connected instrument adapter before ingest.`)
  }
}

export function defaultQuantumVerseAdapters() {
  return [
    new UnconnectedInstrumentAdapter('qcl-digital-microscope', 'digital-microscope'),
    new UnconnectedInstrumentAdapter('qts-telescope', 'telescope'),
    new UnconnectedInstrumentAdapter('qts-spectrometer', 'spectrometer'),
    new UnconnectedInstrumentAdapter('materials-lab', 'material-characterization'),
  ]
}
