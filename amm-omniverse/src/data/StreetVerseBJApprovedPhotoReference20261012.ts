/**
 * BJ Stubbs — current-era user-selected face authority, 12 Oct 2026.
 *
 * This file is a non-biometric, non-image record of the user's selection.
 * Keep the approved photo in the private reference package and do NOT
 * commit the image to a public repository without explicit permission.
 *
 * IMPORTANT: Selection alone does NOT replace the shipped 3D model face.
 * 3D likeness remains unverified until a private image-to-3D/texture pass
 * is imported, rendered and visually approved by the user.
 */
export const BJ_STUBBS_APPROVED_PHOTO_REFERENCE_20261012={
  characterId:'bj-stubbs',
  status:'user-selected-reference',
  referenceId:'bj-stubbs-chicago-river-front-face-2026-10-12',
  selectedDate:'2026-10-12',
  faceAuthority:'user-supplied Chicago portrait, not the older generated waving man',
  visualTarget:'the Chicago-based BJ Stubbs multiview character sheet approved after the portrait',
  faceFeatures:[
    'preserve face silhouette, eyes, nose, natural lips and brow of supplied photo',
    'long locs with true current-era hairline',
    'full salt-and-pepper beard, prominent gray-forward chin area',
    'avoid substituting an invented younger or different face',
  ],
  outfitFeatures:[
    'black ONLY YAHAVAH CAN JUDGE ME shirt',
    'gold pendant necklace',
    'dark trousers',
    'backpack and watch in travel outfit',
  ],
  privateReferenceFile:'BJ_Stubbs_Approved_Face_and_Character_Reference.zip',
  requirePrivateTextureImport:true,
  publicPhotoCommitAuthorized:false,
  certifiedFaceLikeness:false,
  animatedGLBFaceReplaced:false,
  productionDeployed:false,
  qualityGate:[
    'side-by-side real 3D render vs selected portrait',
    'front and 3/4 head geometry review',
    'face texture UV does not distort under animation',
    'preserve idle, walking and greeting clips',
    'approve user-visible result before public rollout',
  ],
} as const
