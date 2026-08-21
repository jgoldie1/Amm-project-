export const IMMERSIVE_COMPLETION_EVIDENCE={
  principle:'Immersive completion is evidence-backed and separate from academic credit, licensure, employment or money.',
  evidence:['experienceId','userId','startedAt','completedAt','accessibilityProfileVersion','missionCheckpoints','evidenceReviewed','originalCreationId','rightsState','worldMemoryCheckpoint'],
  handoffs:{
    university:'May update a Learning Passport or course activity only when the mapped course/program rules explicitly accept the immersive activity.',
    gameverse:'May unlock the next mission/world checkpoint without fabricating academic credit.',
    movieBox:'May attach rights-cleared scene/checkpoint references for creator projects.',
    worldMemory:'Persists choices, completion and original creation references for return-state consequences.'
  },
  gates:['authenticated-owner','server-completion-proof','rights/provenance-where-needed','course-mapping-if-academic','no-client-issued-credentials'],
} as const

export const IMMERSIVE_TO_UNIVERSITY_PATH='ARCHIVE/EVIDENCE → IMMERSIVE RECONSTRUCTION → PLAYABLE MISSION → COMPLETION EVIDENCE → ORIGINAL CREATION → RIGHTS/PROVENANCE → LEARNING PASSPORT ACTIVITY → INSTRUCTOR/PROGRAM RULES → CREDENTIAL ONLY IF AUTHORIZED → WORLD MEMORY'
