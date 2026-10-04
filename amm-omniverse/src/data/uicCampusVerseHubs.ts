export type UicCampusHub=Readonly<{
 id:string
 label:string
 district:'East Campus'|'West Campus'|'Taylor Street'|'Roosevelt Road'
 kind:'student-life'|'library'|'medicine'|'pharmacy'|'dentistry'|'nursing'|'hospital'|'outpatient'|'fitness'|'public-health'|'transit'|'academic'
 x:number
 z:number
 w:number
 d:number
 h:number
 color:string
}>

export const UIC_EAST_CAMPUS_HUBS:readonly UicCampusHub[]=[
 {id:'student-center-east',label:'Student Center East',district:'East Campus',kind:'student-life',x:-760,z:610,w:36,d:24,h:13,color:'#8c4b3b'},
 {id:'daley-library',label:'Richard J. Daley Library',district:'East Campus',kind:'library',x:-815,z:635,w:42,d:28,h:16,color:'#73665c'},
 {id:'taylor-street-building',label:'Taylor Street Building',district:'Taylor Street',kind:'academic',x:-560,z:700,w:34,d:22,h:12,color:'#7b4937'},
 {id:'roosevelt-road-building',label:'Roosevelt Road Building',district:'Roosevelt Road',kind:'academic',x:-690,z:560,w:38,d:24,h:14,color:'#655c54'},
]

export const UIC_WEST_CAMPUS_HUBS:readonly UicCampusHub[]=[
 {id:'student-center-west',label:'UIC Student Center West',district:'West Campus',kind:'student-life',x:-1110,z:650,w:34,d:24,h:12,color:'#8a4d3b'},
 {id:'health-sciences-library',label:'Library of the Health Sciences',district:'West Campus',kind:'library',x:-1065,z:630,w:32,d:22,h:13,color:'#74675d'},
 {id:'college-medicine-west',label:'College of Medicine West',district:'West Campus',kind:'medicine',x:-1130,z:705,w:42,d:28,h:17,color:'#7c4739'},
 {id:'college-pharmacy',label:'College of Pharmacy',district:'West Campus',kind:'pharmacy',x:-1040,z:700,w:34,d:24,h:15,color:'#815445'},
 {id:'college-dentistry',label:'College of Dentistry',district:'West Campus',kind:'dentistry',x:-955,z:685,w:38,d:26,h:15,color:'#8f5c49'},
 {id:'college-nursing',label:'College of Nursing',district:'West Campus',kind:'nursing',x:-1190,z:750,w:34,d:24,h:14,color:'#765245'},
 {id:'ui-hospital',label:'University of Illinois Hospital',district:'West Campus',kind:'hospital',x:-1015,z:775,w:48,d:34,h:22,color:'#d7d9d7'},
 {id:'outpatient-care',label:'Outpatient Care Center',district:'West Campus',kind:'outpatient',x:-955,z:790,w:38,d:28,h:18,color:'#c8d1d3'},
 {id:'sport-fitness-west',label:'UIC Sport and Fitness Center',district:'West Campus',kind:'fitness',x:-1170,z:655,w:44,d:30,h:12,color:'#5d6f7f'},
 {id:'public-health-west',label:'School of Public Health West',district:'West Campus',kind:'public-health',x:-1215,z:825,w:38,d:26,h:14,color:'#866046'},
 {id:'polk-pink-line',label:'Polk CTA Pink Line',district:'West Campus',kind:'transit',x:-995,z:645,w:18,d:10,h:7,color:'#d7b9c8'},
]

export const UIC_ALL_CAMPUS_HUBS:readonly UicCampusHub[]=[
 ...UIC_EAST_CAMPUS_HUBS,
 ...UIC_WEST_CAMPUS_HUBS,
]

export const UIC_WEST_CAMPUS_MISSIONS=[
 {id:'west-campus-orientation',title:'West Campus Orientation',hubId:'student-center-west',objective:'Reach Student Center West and activate the West Campus passport checkpoint.'},
 {id:'health-sciences-study',title:'Health Sciences Study Run',hubId:'health-sciences-library',objective:'Reach the Library of the Health Sciences and complete the CollegeBook research checkpoint.'},
 {id:'medical-career-path',title:'Medical Career Path',hubId:'college-medicine-west',objective:'Reach the College of Medicine West career checkpoint.'},
 {id:'ui-health-rounds',title:'UI Health Rounds',hubId:'ui-hospital',objective:'Reach the University of Illinois Hospital mission checkpoint.'},
 {id:'west-campus-fitness',title:'Campus Fitness Mission',hubId:'sport-fitness-west',objective:'Reach the Sport and Fitness Center checkpoint.'},
] as const
