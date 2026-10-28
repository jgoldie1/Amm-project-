/** Staged CrossVerse fly-in directory. These are virtual hubs, not airports, flights or completed 3D scenes. */
export type CrossVerseCity={id:string;name:string;region:string;country:string;scope:'pilot'|'planned'|'global-concept';businessIds:readonly string[];arrival:string}
export const CROSSVERSE_CITIES:readonly CrossVerseCity[]=[
 {id:'chicago',name:'Chicago',region:'Illinois',country:'USA',scope:'pilot',businessIds:['stubbs-mobility','nuemerica','sculptify'],arrival:'Circle Park / West Side → Magnificent Mile and River North'},
 {id:'san-diego',name:'San Diego',region:'California',country:'USA',scope:'pilot',businessIds:['tasha-san-diego'],arrival:'Serra Mesa → Downtown'},
 {id:'detroit',name:'Detroit',region:'Michigan',country:'USA',scope:'pilot',businessIds:['nikki-detroit'],arrival:'Detroit arrival hub'},
 {id:'tampa',name:'Tampa',region:'Florida',country:'USA',scope:'pilot',businessIds:['la-teasia'],arrival:'Tampa BeautyVerse portal'},
 {id:'los-angeles',name:'Los Angeles',region:'California',country:'USA',scope:'planned',businessIds:[],arrival:'Los Angeles creator and entertainment gateway'},
 {id:'las-vegas',name:'Las Vegas',region:'Nevada',country:'USA',scope:'planned',businessIds:[],arrival:'Las Vegas entertainment hub'},
 {id:'atlanta',name:'Atlanta',region:'Georgia',country:'USA',scope:'planned',businessIds:[],arrival:'Atlanta media and culture gateway'},
 {id:'philadelphia',name:'Philadelphia',region:'Pennsylvania',country:'USA',scope:'planned',businessIds:[],arrival:'Philadelphia culture and creator gateway'},
 {id:'new-york',name:'New York City',region:'New York',country:'USA',scope:'planned',businessIds:[],arrival:'New York global media gateway'},
 {id:'east-st-louis',name:'East St. Louis',region:'Illinois',country:'USA',scope:'planned',businessIds:[],arrival:'Southern Illinois community gateway'},
 {id:'mount-vernon',name:'Mount Vernon',region:'Illinois',country:'USA',scope:'planned',businessIds:[],arrival:'Southern Illinois education and community gateway'},
 {id:'mexico',name:'Mexico CrossVerse',region:'To be selected',country:'Mexico',scope:'global-concept',businessIds:[],arrival:'Cross-border business and creator destination — location pending'},
 {id:'global',name:'Global CrossVerse',region:'Worldwide',country:'Multiple',scope:'global-concept',businessIds:[],arrival:'Global destination registry — individual cities pending approval'}
]
export function crossVerseCity(id:string){return CROSSVERSE_CITIES.find(city=>city.id===id)}
