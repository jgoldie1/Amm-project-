export type TryOnMode = 'avatar-3d' | 'camera-ar' | 'photo-preview' | 'room-preview' | 'streetverse';
export type TryOnCategory = 'wig' | 'hair' | 'makeup' | 'nails' | 'apparel' | 'shoes' | 'jewelry' | 'accessory' | 'furniture' | 'home';

export type TryOnAsset = {
  sku: string;
  category: TryOnCategory;
  glbUrl?: string;
  imageUrl?: string;
  masks?: string[];
  anchor: 'head' | 'face' | 'hand' | 'body' | 'foot' | 'room';
  scaleHint?: number;
  variants: Array<{ id: string; label: string; mediaUrl?: string; glbUrl?: string }>;
  provenance: { source: string; licensed: boolean; generated: boolean };
};

export type TryOnSession = {
  sessionId: string;
  userId?: string;
  sku: string;
  mode: TryOnMode;
  variantId?: string;
  consent: boolean;
  createdAt: string;
  savedLook?: boolean;
};

export const TRY_ON_PIPELINE = [
  'REAL SKU',
  'HOLOFORGE/GLE DIGITAL TWIN',
  'CATEGORY + ANCHOR METADATA',
  'USER CONSENT',
  'CAMERA / PHOTO / AVATAR / ROOM INPUT',
  'PREVIEW RENDER',
  'VARIANT SWITCH',
  'SAVE LOOK',
  'SHARE / REEL',
  'ADD TO CART',
  'GUARDIAN CHECKOUT',
  'FULFILLMENT',
] as const;

export function canStartTryOn(asset: TryOnAsset, consent: boolean) {
  if (!consent) return { ok: false, reason: 'User consent required for camera/photo/avatar preview' } as const;
  if (!asset.glbUrl && !asset.imageUrl) return { ok: false, reason: 'Preview media required' } as const;
  if (!asset.provenance.licensed) return { ok: false, reason: 'Asset provenance/license must be verified' } as const;
  return { ok: true, reason: 'Try-on preview may start' } as const;
}
