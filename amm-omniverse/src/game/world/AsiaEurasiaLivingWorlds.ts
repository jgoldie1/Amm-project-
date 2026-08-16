export type EurasiaWorldHub={id:string;label:string;region:string;cities:string[];languages:string[];travel:string[];activities:string[];systems:string[]}

const commonSystems=['Copy Smart NPC','Dynamic Mission Director','Secret Missions','Teen Takeover','SportsOS','Creator Economy','Businesses','OmniPlayer','Stubbs AI','HoloGPT','Quantum Beat','Holo Portal','Accessibility','Translation','Cloud Save','Multiplayer']
const travel=['walk','bike','car','bus','metro','train','high-speed-rail','plane','boat','ferry','holo-portal']

export const asiaEurasiaLivingWorlds:EurasiaWorldHub[]=[
{id:'japan',label:'Japan Living World',region:'East Asia',cities:['Tokyo','Osaka','Kyoto','Yokohama','Sapporo','Fukuoka','Okinawa'],languages:['Japanese','English fallback'],travel,activities:['baseball','football','basketball','racing','esports','winter sports','creator/music','technology','food','history'],systems:commonSystems},
{id:'taiwan',label:'Taiwan Living World',region:'East Asia',cities:['Taipei','New Taipei','Taichung','Tainan','Kaohsiung','Hualien'],languages:['Traditional Chinese','Mandarin','English fallback'],travel,activities:['baseball','basketball','cycling','esports','technology','night markets','creator/music','mountain exploration'],systems:commonSystems},
{id:'south-korea',label:'Korea Living World',region:'East Asia',cities:['Seoul','Busan','Incheon','Daegu','Jeju'],languages:['Korean','English fallback'],travel,activities:['football','baseball','esports','basketball','creator/music','film','technology','winter sports'],systems:commonSystems},
{id:'mongolia',label:'Mongolia Living World',region:'East/Central Asia',cities:['Ulaanbaatar','Darkhan','Erdenet'],languages:['Mongolian','English fallback'],travel,activities:['horse sports','wrestling','archery','racing','steppe exploration','creator culture'],systems:commonSystems},
{id:'russia',label:'Russia Living World',region:'Eurasia',cities:['Moscow','Saint Petersburg','Kazan','Sochi','Yekaterinburg','Novosibirsk','Vladivostok'],languages:['Russian','English fallback'],travel,activities:['football','ice hockey','basketball','winter sports','racing','rail journeys','creator/music','history'],systems:commonSystems},
{id:'ukraine',label:'Ukraine Living World',region:'Eastern Europe',cities:['Kyiv','Lviv','Odesa','Dnipro'],languages:['Ukrainian','English fallback'],travel,activities:['football','basketball','boxing','creator/music','technology','history','community rebuilding fiction'],systems:commonSystems},
{id:'central-asia',label:'Central Asia Living Worlds',region:'Central Asia',cities:['Almaty','Astana','Tashkent','Bishkek','Dushanbe','Ashgabat'],languages:['Kazakh','Uzbek','Kyrgyz','Tajik','Turkmen','Russian fallback','English fallback'],travel,activities:['football','boxing','wrestling','horse sports','mountain/desert exploration','Silk Road quests'],systems:commonSystems},
{id:'southeast-asia',label:'Southeast Asia Living Worlds',region:'Southeast Asia',cities:['Bangkok','Singapore','Kuala Lumpur','Manila','Jakarta','Ho Chi Minh City','Hanoi','Phnom Penh','Vientiane','Bandar Seri Begawan','Dili','Yangon'],languages:['regional localization','English fallback'],travel,activities:['football','basketball','badminton','combat sports','esports','island travel','creator/music','food','business'],systems:commonSystems},
{id:'south-asia',label:'South Asia Living Worlds',region:'South Asia',cities:['Delhi','Mumbai','Bengaluru','Dhaka','Karachi','Lahore','Kathmandu','Colombo','Thimphu','Male'],languages:['regional localization','English fallback'],travel,activities:['cricket','football','field hockey','boxing','esports','film/music','technology','mountain/ocean exploration'],systems:commonSystems},
{id:'west-asia',label:'West Asia Living Worlds',region:'West Asia',cities:['Dubai','Abu Dhabi','Riyadh','Doha','Muscat','Amman','Beirut','Baghdad','Kuwait City','Manama'],languages:['Arabic','regional localization','English fallback'],travel,activities:['football','racing','esports','basketball','business','creator/media','desert exploration','future-city missions'],systems:commonSystems}
]

export const asiaCampaigns=[
{id:'asia-grand-tour',title:'Living Worlds: Asia Grand Tour',hubs:['japan','taiwan','south-korea','mongolia','central-asia','southeast-asia','south-asia','west-asia']},
{id:'eurasia-rail',title:'Eurasia Rail & Portal Quest',hubs:['russia','central-asia','mongolia']},
{id:'world-champions-asia',title:'World Champions: Asia Circuit',hubs:['japan','taiwan','south-korea','southeast-asia','south-asia','west-asia']},
{id:'silk-road-secrets',title:'Silk Road Secrets',hubs:['central-asia','south-asia','west-asia']}
]

// Territorial/political labels must remain configurable and sourced separately from gameplay.
// The game must not turn real active conflicts into entertainment objectives. Ukraine/Russia content defaults to civilian culture, sports, travel, history, creator and community gameplay; any current-conflict references require editorial/legal review.
export const geopoliticalContentGuard={
  configurableLabels:true,
  noActiveWarGamification:true,
  noRealPersonTargets:true,
  noPropagandaMissions:true,
  requireEditorialReviewForCurrentConflict:true
}
