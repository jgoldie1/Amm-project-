export type BiographyChapterId =
  | 'childhood' | 'school' | 'family-1' | 'chicago' | 'sports' | 'hollywood'
  | 'mural-art' | 'tv-film' | 'soul-train' | 'hollywood-showcase' | 'music'
  | 'las-vegas' | 'spiritual-experience' | 'long-road-home' | 'business'
  | 'family-2' | 'travel' | 'return' | 'legacy'

export type BiographyChapter = {
  id: BiographyChapterId
  title: string
  unlocks: BiographyChapterId[]
  memoryScopes: string[]
  persistentEffects: string[]
}

export const LIFE_BIOGRAPHY: BiographyChapter[] = [
  { id:'childhood', title:'Childhood', unlocks:['school','family-1','chicago'], memoryScopes:['home','neighborhood','relationships'], persistentEffects:['origin dialogue','home-region reputation','childhood contacts'] },
  { id:'school', title:'School', unlocks:['sports','music'], memoryScopes:['education','friends'], persistentEffects:['skills','alumni memories','career prerequisites'] },
  { id:'family-1', title:'Family', unlocks:['chicago'], memoryScopes:['relationships','home'], persistentEffects:['family trust','family missions','legacy witnesses'] },
  { id:'chicago', title:'Chicago', unlocks:['sports','business','travel'], memoryScopes:['city','neighborhood','jobs'], persistentEffects:['Chicago reputation','local contacts','district changes'] },
  { id:'sports', title:'Sports', unlocks:['travel'], memoryScopes:['sports','events'], persistentEffects:['athletic reputation','stadium jobs','sports media opportunities'] },
  { id:'hollywood', title:'Hollywood', unlocks:['mural-art','tv-film','soul-train','hollywood-showcase'], memoryScopes:['city','creator','career'], persistentEffects:['Hollywood reputation','production network','time-machine era access'] },
  { id:'mural-art', title:'Mural Art', unlocks:['tv-film'], memoryScopes:['art','mentor','public-space'], persistentEffects:['creator reputation','living-mural layers','art missions'] },
  { id:'tv-film', title:'TV / Film', unlocks:['soul-train','hollywood-showcase'], memoryScopes:['production','creator'], persistentEffects:['camera/scenic skills','production contacts','media missions'] },
  { id:'soul-train', title:'Soul Train Memory', unlocks:['music'], memoryScopes:['dance','television','creator'], persistentEffects:['dance reputation','Soul Train Line access','creator replay history'] },
  { id:'hollywood-showcase', title:'Hollywood Showcase', unlocks:['music','business'], memoryScopes:['performance','network'], persistentEffects:['audition access','showcase contacts','talent discovery'] },
  { id:'music', title:'Music', unlocks:['las-vegas','business'], memoryScopes:['music','performance','relationships'], persistentEffects:['artist reputation','tour opportunities','studio missions'] },
  { id:'las-vegas', title:'Las Vegas', unlocks:['spiritual-experience','long-road-home'], memoryScopes:['travel','music','relationships'], persistentEffects:['Vegas memories','travel contacts','turning-point setup'] },
  { id:'spiritual-experience', title:'Spiritual Experience', unlocks:['long-road-home'], memoryScopes:['values','reflection'], persistentEffects:['life-path value change','Eve dialogue shift','legacy reflection'] },
  { id:'long-road-home', title:'Long Road Home', unlocks:['business','family-2','return'], memoryScopes:['travel','vehicle','relationships'], persistentEffects:['interstate knowledge','crew trust','homecoming setup'] },
  { id:'business', title:'Business', unlocks:['travel','legacy'], memoryScopes:['business','employees','customers'], persistentEffects:['storefront history','employee relationships','marketplace reputation'] },
  { id:'family-2', title:'Family Legacy', unlocks:['legacy'], memoryScopes:['family','relationships'], persistentEffects:['generational stories','family milestones','legacy witnesses'] },
  { id:'travel', title:'Travel', unlocks:['return'], memoryScopes:['city','country','diaspora'], persistentEffects:['cross-city contacts','international reputation','new markets'] },
  { id:'return', title:'Return', unlocks:['legacy'], memoryScopes:['home','city','relationships'], persistentEffects:['return dialogue','before/after world state','reconciliation opportunities'] },
  { id:'legacy', title:'Legacy', unlocks:[], memoryScopes:['legacy','world'], persistentEffects:['legacy score','world monuments/memorialized original art','next-generation mission hooks'] },
]

export type BiographyState = {
  completed: BiographyChapterId[]
  active: BiographyChapterId[]
  rememberedChoices: Record<string,string>
  legacyScore: number
}

export function completeBiographyChapter(state: BiographyState, chapterId: BiographyChapterId, choiceSummary?: string): BiographyState {
  const chapter = LIFE_BIOGRAPHY.find(c => c.id === chapterId)
  if (!chapter) return state
  const completed = Array.from(new Set([...state.completed, chapterId]))
  const active = Array.from(new Set([...state.active.filter(id => id !== chapterId), ...chapter.unlocks]))
  return {
    completed,
    active,
    rememberedChoices: choiceSummary ? { ...state.rememberedChoices, [chapterId]: choiceSummary } : state.rememberedChoices,
    legacyScore: state.legacyScore + 10 + chapter.persistentEffects.length,
  }
}

export function getBiographyEcho(state: BiographyState, currentChapter: BiographyChapterId) {
  const prior = state.completed.slice(-5)
  return {
    currentChapter,
    rememberedChapters: prior,
    choiceEchoes: prior.map(id => state.rememberedChoices[id]).filter(Boolean),
    legacyScore: state.legacyScore,
  }
}

export const WORLD_CONTINUES_RULES = [
  'NPC schedules continue while the player is away',
  'businesses can gain or lose simulated customers and employees',
  'relationships track time since last contact',
  'district event calendars advance',
  'schools and careers preserve milestones',
  'creator media can continue accumulating simulated audience history',
  'return missions compare departure state with current state',
  'major player-authored memories remain reviewable in the private evidence/rights pathway',
] as const
