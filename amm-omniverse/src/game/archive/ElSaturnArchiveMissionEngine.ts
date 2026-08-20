export type ArchiveMission = {
  id: string
  title: string
  archiveSeries: string
  evidenceTargets: string[]
  gameplay: string[]
  unlocks: string[]
  rightsMode: 'metadata-and-original-recreation' | 'license-required-for-archival-media'
}

export const EL_SATURN_ARCHIVE_MISSIONS: ArchiveMission[] = [
  {
    id:'new-release-1956', title:'Super-Sonic Release Room', archiveSeries:'Series VI — Business Records',
    evidenceTargets:['new release announcement circa 1956','financial records 1956–1957'],
    gameplay:['inspect a holographic facsimile-style metadata card','build an original release campaign','choose pressing quantity','budget printing, promotion and mailing','compare results to direct-audience strategy'],
    unlocks:['Seventy-Five Copies','Build the Label Without the Gatekeepers'], rightsMode:'metadata-and-original-recreation'
  },
  {
    id:'distribution-1957', title:'The Distribution Agreement', archiveSeries:'Series VI — Business Records',
    evidenceTargets:['record distribution draft agreement 1957','account book 1957'],
    gameplay:['trace how a record reaches listeners','negotiate an original fictional distribution agreement','compare distributor vs direct-sale margins','write provenance to World Memory'],
    unlocks:['The Artist Ledger','From Saturn to Streaming'], rightsMode:'metadata-and-original-recreation'
  },
  {
    id:'mailing-list-1967', title:'The Mailing List Network', archiveSeries:'Series VI — Business Records',
    evidenceTargets:['record mailing list 1967','El Saturn catalogs circa 1967','copyright forms circa 1967'],
    gameplay:['build a rights-safe simulated fan network','segment listeners by city','mail an original catalog','measure simulated response','translate the lesson into opt-in creator CRM mechanics'],
    unlocks:['Direct Audience','Creator Cooperative'], rightsMode:'metadata-and-original-recreation'
  },
  {
    id:'fan-club', title:'Saturn Fan Club', archiveSeries:'Series VI — Business Records',
    evidenceTargets:["Saturn's Fan Club postcards circa 1960s",'customer orders and fan mail'],
    gameplay:['curate a fan-history exhibit','design an original fan membership experience','reward participation without pay-to-win mechanics','connect fans to creator storefronts'],
    unlocks:['Community Signal','All American Network fan missions'], rightsMode:'metadata-and-original-recreation'
  },
  {
    id:'printing-blocks', title:'Print the Future', archiveSeries:'Series IX — Art and Artifacts',
    evidenceTargets:['album-cover printing blocks','Saturn Records catalog printing block','Arkestra member-list printing blocks','metal stampers'],
    gameplay:['enter an immersive virtual print shop','design original rights-clean cover art','operate a simulated press','mint a provenance record for the new artwork','project the design as a holographic mural'],
    unlocks:['Immersive Art Corridor','Original Release Gallery'], rightsMode:'license-required-for-archival-media'
  },
  {
    id:'lacy-gibson-poster', title:'Poster in Box 136', archiveSeries:'Series X — Oversize / Business Records',
    evidenceTargets:['Lacy Gibson posters circa 1960s'],
    gameplay:['discover the documented Lacy Gibson archive reference','separate what the poster proves from what it does not prove','research Chicago blues connections','create an original blues-to-cosmic-jazz performance'],
    unlocks:['Chicago Blues Meets Saturn','Archive Roundtable'], rightsMode:'license-required-for-archival-media'
  },
  {
    id:'navy-pier-1979', title:'Contract on the Pier', archiveSeries:'Series VI — Business Records',
    evidenceTargets:['Navy Pier performance contract 1979'],
    gameplay:['time-machine jump to a rights-safe 1979 Chicago event economy','staff an original concert production','solve transport, stage, payroll and promotion problems','return to modern Navy Pier and compare the event economy'],
    unlocks:['Chicago Event Producer','Time Machine: Performance History'], rightsMode:'metadata-and-original-recreation'
  },
  {
    id:'archive-artifacts', title:'Objects That Remember', archiveSeries:'Series IX — Art and Artifacts',
    evidenceTargets:['tuning fork','mbira','record adapter','printing tools','Saturn/Alton stamps'],
    gameplay:['scan artifact metadata','hear original educational sound demonstrations rather than archival recordings','solve instrument and printing puzzles','assemble an original interactive museum installation'],
    unlocks:['Living Museum Curator','SpaceVerse Signal Lab'], rightsMode:'license-required-for-archival-media'
  },
]

export const ARCHIVE_MISSION_LOOP = [
  'DISCOVER ARCHIVE CLUE',
  'OPEN UNIVERSITY SOURCE',
  'IDENTIFY BOX/FOLDER OR SERIES',
  'CLASSIFY FACT vs INTERPRETATION vs FAMILY/COMMUNITY MEMORY',
  'PLAY ORIGINAL RIGHTS-SAFE RECONSTRUCTION',
  'MAKE A CHOICE',
  'WRITE EVIDENCE + CONSEQUENCE TO WORLD MEMORY',
  'CREATE ORIGINAL MUSIC / ART / BUSINESS OUTPUT',
  'UNLOCK NEXT HISTORICAL OR CREATOR MISSION',
] as const
