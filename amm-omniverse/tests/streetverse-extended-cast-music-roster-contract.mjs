import fs from 'node:fs'
import assert from 'node:assert/strict'

const music=fs.readFileSync(new URL('../src/data/ChicagoMusicLegacyMissionRegistry.ts',import.meta.url),'utf8')
const cast=fs.readFileSync(new URL('../src/game/characters/meetTheStubbsFamilyFriends.ts',import.meta.url),'utf8')
const playable=fs.readFileSync(new URL('../src/runtime/StreetVersePlayableCharactersRuntime.ts',import.meta.url),'utf8')
const star=fs.readFileSync(new URL('../src/components/StreetVerseCelebrityRapperMissions.tsx',import.meta.url),'utf8')
const encounter=fs.readFileSync(new URL('../src/components/StreetVerseStarMissionEncounterLayer.tsx',import.meta.url),'utf8')

const artists=[
 'Twista','Common','Lupe Fiasco','Da Brat','Shawnna','Crucial Conflict','Tink','Juice WRLD','King Von','Lil Durk',
 'Chief Keef','Chance the Rapper','G Herbo','Polo G','Do or Die','Psycho Drama','Saba','Noname','Vic Mensa','Rhymefest',
 'Bump J','Lil Bibby','King Louie','Lil Reese','Dreezy','Mick Jenkins','Katie Got Bandz','Sasha Go Hard','CupcakKe',
 'Rockie Fresh','Joey Purp','Kanye West','R. Kelly'
]
for(const name of artists)assert.ok(music.includes(`displayName:'${name}'`),`missing Chicago music artist: ${name}`)
assert.equal((music.match(/\{id:'[^']+',displayName:/g)||[]).length,artists.length,'Chicago music registry must preserve every protected artist entry')
assert.ok(star.includes('CHICAGO_MUSIC_LEGACY_ARTISTS.map'),'music registry must materialize into playable missions')
assert.ok(encounter.includes("missionId?.startsWith('chicago-music-legacy-')"),'legacy missions must have encounter navigation')

const namedCast=['BJ Stubbs','Marcus','Al B','Tatti','Brielle','Mike','Alphonso','Jasmine','Tae Monroe','Nikki','Tasha','Uncle Ray','J','Sarah','Messa','Pastor Kofi','Jacobie Stubbs','Isaiah Stubbs','Aniyah Stubbs','Benny']
for(const name of namedCast)assert.ok(cast.includes(`displayName:'${name}'`),`missing persistent cast member: ${name}`)
assert.ok(cast.includes('Array.from({length:10}'),'cast must preserve ten editable social creator slots')
for(const lane of ['Chicago Rap / Open Mic','Chicago Singer / Live Stage','Music Producer / Studio','DJ / Holo LIVE','Live Stream Creator','Acting / Holo Drama','Film / Video','Fashion / Design','Beauty / Style']){
 assert.ok(playable.includes(lane),`missing creator mission lane: ${lane}`)
}

console.log('streetverse extended cast + Chicago music roster contract OK')
