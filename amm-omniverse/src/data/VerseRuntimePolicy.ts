import {VERSE_OS,VerseRating} from './VerseOS';
import {ABILITY_FORGE} from './VerseAbilityForge';

const rank:Record<VerseRating,number>={family:0,teen:1,mature:2};
export type VersePassport={ageBand:'child'|'teen'|'adult';unlocked:string[];accessibility?:string[]};
export type VerseDecision={allowed:boolean;reason:string};

export function canEnterVerse(passport:VersePassport,verseId:string):VerseDecision{
 const verse=VERSE_OS.find(v=>v.id===verseId);
 if(!verse)return {allowed:false,reason:'unknown verse'};
 if(verse.rating==='mature'&&passport.ageBand!=='adult')return {allowed:false,reason:'adult age gate required'};
 const prerequisites=verse.entry.filter(x=>x!=='passport');
 if(prerequisites.length&&!prerequisites.some(x=>passport.unlocked.includes(x)))return {allowed:false,reason:'entry prerequisite not unlocked'};
 return {allowed:true,reason:'entry permitted'};
}
export function canUseAbility(passport:VersePassport,verseId:string,abilityId:string):VerseDecision{
 const entry=canEnterVerse(passport,verseId);if(!entry.allowed)return entry;
 const verse=VERSE_OS.find(v=>v.id===verseId),ability=ABILITY_FORGE.find(a=>a.id===abilityId);
 if(!verse||!ability)return {allowed:false,reason:'unknown ability or verse'};
 if(!ability.verses.includes(verseId))return {allowed:false,reason:'ability not permitted in this verse'};
 if(rank[ability.rating]>rank[verse.rating])return {allowed:false,reason:'ability exceeds verse rating'};
 return {allowed:true,reason:'ability permitted'};
}
export const CROSS_VERSE_PERSISTENCE=['passport','creator identity','XP','approved inventory','business identity','earnings ledger references','accessibility preferences'] as const;
export const SERVER_AUTHORITY=['purchases','rewards','payouts','competitive outcomes','inventory mutations','ability physics','portal destination','world publication'] as const;
