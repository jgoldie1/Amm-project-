/**
 * Near West education directory for StreetVerse Chicago.
 * Geographic addresses are published campus/school reference locations, NOT
 * coordinates in the small playable Circle Park scene. Do not convert them to
 * invented in-game x/z destinations. A map-reference site is NOT a built 3D school.
 */
export type EducationLevel='legacy'|'elementary'|'high-school'|'university'|'community-college'
export type EducationAccess=
 |Readonly<{kind:'mobile-3d';x:number;z:number;travelEvent:'tryamm:west-side-route-request'|'tryamm:school-route-request'}>
 |Readonly<{kind:'campusverse';campusId:string;district?:'East Campus'|'West Campus';hubId?:string}>
 |Readonly<{kind:'directory-only'}>
export type NearWestEducationSite=Readonly<{
 id:string
 name:string
 level:EducationLevel
 address:string
 district:string
 note:string
 sourceUrl:string
 access:EducationAccess
 formerName?:string
 currentName?:string
}>
export const NEAR_WEST_EDUCATION_SITES:readonly NearWestEducationSite[]=[
 {id:'thomas-jefferson-legacy',name:'Thomas Jefferson School • Legacy Campus',level:'legacy',address:'1522 W Fillmore St, Chicago, IL 60607',district:'Circle Park / ABLA',note:'Preserved TRYAMM historical interior, gym, library and classroom reconstruction. Current school at the historical site is STEM Magnet Academy.',currentName:'STEM Magnet Academy',sourceUrl:'https://propertyleases.cps.edu/',access:{kind:'mobile-3d',x:-46,z:48,travelEvent:'tryamm:school-route-request'}},
 {id:'stem-magnet',name:'STEM Magnet Academy (former Thomas Jefferson site)',level:'elementary',address:'1522 W Fillmore St, Chicago, IL 60607',district:'University Village',note:'Current CPS identity for the historical Thomas Jefferson building. This shares the legacy site; no duplicate 3D building.',formerName:'Thomas Jefferson School',sourceUrl:'https://www.apply.cps.edu/en/program/UHJvZ3JhbToxMTM1',access:{kind:'directory-only'}},
 {id:'galileo',name:'Galileo Scholastic Academy of Math & Science',level:'elementary',address:'820 S Carpenter St, Chicago, IL 60607',district:'Little Italy / UIC',note:'Mathematics and science neighborhood-school directory anchor.',sourceUrl:'https://galileoscholasticacademy.org/apps/contact/',access:{kind:'directory-only'}},
 {id:'world-language',name:'Chicago World Language Academy',level:'elementary',address:'1340 W Harrison St, Chicago, IL 60607',district:'Near West Side',note:'Language-learning school directory anchor.',sourceUrl:'https://www.chicagoworldlanguageacademy.cps.edu/',access:{kind:'directory-only'}},
 {id:'skinner-west',name:'Skinner West Elementary',level:'elementary',address:'1260 W Adams St, Chicago, IL 60607',district:'West Loop',note:'CPS neighborhood and classical-program school directory anchor.',sourceUrl:'https://www.skinnerwest.cps.edu/',access:{kind:'directory-only'}},
 {id:'smyth',name:'John M. Smyth Elementary School',level:'elementary',address:'1059 W 13th St, Chicago, IL 60608',district:'University Village',note:'IB pathway and community sports directory anchor.',sourceUrl:'https://www.cps.edu/schools/profiles/',access:{kind:'directory-only'}},
 {id:'brown-magnet',name:'William H. Brown Math & Science Magnet',level:'elementary',address:'54 N Hermitage Ave, Chicago, IL 60612',district:'Near West Side',note:'Science and mathematics directory anchor.',sourceUrl:'https://www.cps.edu/schools/profiles/',access:{kind:'directory-only'}},
 {id:'saint-ignatius',name:'St. Ignatius College Prep',level:'high-school',address:'1076 W Roosevelt Rd, Chicago, IL 60608',district:'Roosevelt Road',note:'Existing original 3D exterior game reconstruction and historical campus mission hook.',sourceUrl:'https://www.ignatius.org/',access:{kind:'mobile-3d',x:42,z:-2,travelEvent:'tryamm:west-side-route-request'}},
 {id:'whitney-young',name:'Whitney M. Young Magnet High School',level:'high-school',address:'211 S Laflin St, Chicago, IL 60607',district:'Near West Side / Laflin',note:'Academics, performing arts, and sports game-directory anchor.',sourceUrl:'https://www.cps.edu/schools/profiles/',access:{kind:'directory-only'}},
 {id:'crane-medical',name:'Richard T. Crane Medical Preparatory HS',level:'high-school',address:'2245 W Jackson Blvd, Chicago, IL 60612',district:'Medical District / West Side',note:'Healthcare and biomedical career-pathway directory anchor.',sourceUrl:'https://www.cps.edu/academics/career-and-technical-education/health-science/',access:{kind:'directory-only'}},
 {id:'phoenix-military',name:'Phoenix Military Academy HS',level:'high-school',address:'145 S Campbell Ave, Chicago, IL 60612',district:'Near West Side',note:'Academic leadership and service-oriented school reference; no real-school staff or students simulated.',sourceUrl:'https://www.cps.edu/schools/profiles/',access:{kind:'directory-only'}},
 {id:'juarez',name:'Benito Juárez Community Academy HS',level:'high-school',address:'1450 W Cermak Rd, Chicago, IL 60608',district:'Pilsen / Lower West Side',note:'High school and career education directory anchor.',sourceUrl:'https://www.cps.edu/academics/career-and-technical-education/health-science/',access:{kind:'directory-only'}},
 {id:'chitech',name:'Chicago Tech Academy',level:'high-school',address:'1301 W 14th St, Chicago, IL 60608',district:'University Village',note:'Technology education directory anchor; its live school operations require later verification.',sourceUrl:'https://www.cps.edu/schools/profiles/',access:{kind:'directory-only'}},
 {id:'uic-east',name:'University of Illinois Chicago • East Campus',level:'university',address:'750 S Halsted St, Chicago, IL 60607',district:'UIC East Campus',note:'Existing CampusVerse East facilities include Student Center East and Richard J. Daley Library.',sourceUrl:'https://studentcenters.uic.edu/about/locations/',access:{kind:'campusverse',campusId:'uic',district:'East Campus',hubId:'student-center-east'}},
 {id:'uic-west',name:'University of Illinois Chicago • West Campus',level:'university',address:'828 S Wolcott Ave, Chicago, IL 60612',district:'UIC West / Illinois Medical District',note:'Existing CampusVerse West facilities include Medicine, Dentistry, Pharmacy, Nursing, UI Hospital and health-sciences library.',sourceUrl:'https://studentcenters.uic.edu/about/locations/',access:{kind:'campusverse',campusId:'uic',district:'West Campus',hubId:'student-center-west'}},
 {id:'dett',name:'Robert Nathaniel Dett Elementary',level:'elementary',address:'2131 W Monroe St, Chicago, IL 60612',district:'Near West Side',note:'Present-day Dett school; distinguish from its former 2306 W Maypole building.',sourceUrl:'https://www.dett.cps.edu/',access:{kind:'directory-only'}},
 {id:'irving',name:'Washington Irving Elementary School',level:'elementary',address:'749 S Oakley Blvd, Chicago, IL 60612',district:'Near West Side',note:'Neighborhood elementary school directory anchor.',sourceUrl:'https://www.cps.edu/schools/networks/network-6/',access:{kind:'directory-only'}},
 {id:'suder-montessori',name:'Suder Montessori Magnet School',level:'elementary',address:'2022 W Washington Blvd, Chicago, IL 60612',district:'Near West Side',note:'Montessori magnet education directory anchor.',sourceUrl:'https://www.sudermontessori.org/',access:{kind:'directory-only'}},
 {id:'noble-bulls',name:'Chicago Bulls College Prep',level:'high-school',address:'2040 W Adams St, Chicago, IL 60612',district:'Near West Side',note:'Noble charter high school directory anchor near United Center.',sourceUrl:'https://nobleschools.org/bulls/contact/',access:{kind:'directory-only'}},
 {id:'noble-uic',name:'UIC College Prep (Noble)',level:'high-school',address:'1231 S Damen Ave, Chicago, IL 60608',district:'Illinois Medical District / Near West',note:'Noble charter high school; distinct from the University of Illinois Chicago itself.',sourceUrl:'https://nobleschools.org/uic/contact/',access:{kind:'directory-only'}},
 {id:'chicago-hope',name:'Chicago Hope Academy',level:'high-school',address:'2189 W Bowler St, Chicago, IL 60612',district:'Near West Side',note:'Independent high school and athletics directory anchor.',sourceUrl:'https://www.chicagohopeacademy.net/contact',access:{kind:'directory-only'}},
 {id:'rush-university',name:'Rush University',level:'university',address:'600 S Paulina St, Chicago, IL 60612',district:'Illinois Medical District',note:'Rush medical, nursing and health sciences education directory anchor.',sourceUrl:'https://www.rushu.rush.edu/about-rush-university/visitor-information',access:{kind:'directory-only'}},
 {id:'malcolm-x',name:'Malcolm X College • Main Campus',level:'community-college',address:'1900 W Jackson Blvd, Chicago, IL 60612',district:'Medical District / West Side',note:'Existing CampusVerse healthcare workforce and simulated hospital pathway.',sourceUrl:'https://www.ccc.edu/malcolm-x/home/',access:{kind:'campusverse',campusId:'malcolm-x'}},
] as const
export const NEAR_WEST_EDUCATION_COUNTS=Object.freeze({
 sites:NEAR_WEST_EDUCATION_SITES.length,
 elementary:NEAR_WEST_EDUCATION_SITES.filter(site=>site.level==='elementary').length,
 highSchool:NEAR_WEST_EDUCATION_SITES.filter(site=>site.level==='high-school').length,
 postsecondary:NEAR_WEST_EDUCATION_SITES.filter(site=>site.level==='university'||site.level==='community-college').length,
 built3d:NEAR_WEST_EDUCATION_SITES.filter(site=>site.access.kind==='mobile-3d').length,
 existingCampusverse:NEAR_WEST_EDUCATION_SITES.filter(site=>site.access.kind==='campusverse').length
})
