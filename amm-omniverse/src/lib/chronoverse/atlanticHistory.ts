export type EvidenceTier='DOCUMENTED FACT'|'PRIMARY SOURCE'|'ARCHAEOLOGICAL EVIDENCE'|'SCHOLARLY INTERPRETATION'|'DISPUTED CLAIM'|'LEGEND / MYTH'|'ALTERNATE TIMELINE'

export type ChronoMission={
 id:string
 title:string
 era:string
 objective:string
 evidence:EvidenceTier[]
 outcome:string
}

export const ATLANTIC_BLACK_HISTORY_MISSIONS:ChronoMission[]=[
 {id:'africa-before-captivity',title:'Africa Before Captivity',era:'pre-Atlantic slave trade',objective:'Explore African kingdoms, families, scholarship, trade, agriculture, faith, arts and technologies before enslavement.',evidence:['DOCUMENTED FACT','PRIMARY SOURCE','ARCHAEOLOGICAL EVIDENCE','SCHOLARLY INTERPRETATION'],outcome:'Black history begins with civilizations and people, not slavery.'},
 {id:'mali-atlantic-expedition',title:'The Lost Atlantic Expedition',era:'Mali Empire',objective:'Investigate accounts of the Atlantic expedition associated with Mansa Musa’s predecessor and distinguish the surviving account from later claims about its destination.',evidence:['PRIMARY SOURCE','SCHOLARLY INTERPRETATION','DISPUTED CLAIM'],outcome:'Evidence literacy and Atlantic-navigation investigation.'},
 {id:'indigenous-americas',title:'Indigenous Americas',era:'pre-1492 Americas',objective:'Explore Indigenous civilizations on their own terms before European colonization.',evidence:['DOCUMENTED FACT','PRIMARY SOURCE','ARCHAEOLOGICAL EVIDENCE','SCHOLARLY INTERPRETATION'],outcome:'Centers Indigenous histories rather than treating the Americas as empty before European arrival.'},
 {id:'pre-columbian-contact-lab',title:'Pre-Columbian Contact Evidence Lab',era:'pre-1492',objective:'Compare claims of African, Hebrew-speaking and other transoceanic contact with the evidence supporting or challenging each claim.',evidence:['ARCHAEOLOGICAL EVIDENCE','SCHOLARLY INTERPRETATION','DISPUTED CLAIM'],outcome:'Players investigate claims without disputed ideas being presented as established fact.'},
 {id:'1492-language-mystery',title:'1492 Language Mystery',era:'1492',objective:'Investigate Columbus-era interpreting, Luis de Torres, attempted communication, Indigenous languages and the limits of the surviving evidence.',evidence:['PRIMARY SOURCE','DOCUMENTED FACT','SCHOLARLY INTERPRETATION','DISPUTED CLAIM'],outcome:'Communication becomes a historical investigation rather than automatic translation.'},
 {id:'transatlantic-slave-trade',title:'Transatlantic Slave Trade',era:'Atlantic world',objective:'Trace communities before capture, forced displacement, Atlantic routes, the Middle Passage, arrival in the Americas, survival, culture, family and resistance.',evidence:['PRIMARY SOURCE','DOCUMENTED FACT','ARCHAEOLOGICAL EVIDENCE','SCHOLARLY INTERPRETATION'],outcome:'Connects African life before captivity to slavery, resistance and later freedom struggles.'},
 {id:'freedom-reconstruction',title:'Freedom and Reconstruction',era:'19th century',objective:'Study emancipation, citizenship, family reunification, institutions, political participation, violence and rebuilding.',evidence:['PRIMARY SOURCE','DOCUMENTED FACT','SCHOLARLY INTERPRETATION'],outcome:'Shows that emancipation was a transition into another contested historical period.'},
 {id:'civil-rights',title:'Civil Rights Movement',era:'20th century',objective:'Study organizing, legal challenges, direct action, community institutions and primary-source testimony.',evidence:['PRIMARY SOURCE','DOCUMENTED FACT','SCHOLARLY INTERPRETATION'],outcome:'Connects earlier struggles with modern civil-rights history.'},
 {id:'newmerica',title:'Newmerica Civilization Lab',era:'alternate future',objective:'After studying historical evidence, build a speculative society and observe consequences across education, business, housing, agriculture, technology, justice, culture, faith and space exploration.',evidence:['ALTERNATE TIMELINE'],outcome:'Players form their own conclusions and test future-building decisions without rewriting documented history.'}
]

export const CHRONO_EVIDENCE_RULES={
 neverPromoteDisputedToFact:true,
 preserveIndigenousAgency:true,
 distinguishFaithAndHistory:true,
 alternateHistoryMustBeLabeled:true,
 playerConclusionRemainsPlayerOwned:true
} as const

export const NEWMERICA_SYSTEMS=['education','business','housing','agriculture','technology','justice','culture','faith','transportation','space-age'] as const
