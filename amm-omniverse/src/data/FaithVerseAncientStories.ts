// Scripture-bound educational reenactment outlines, not quotations or historical proof.
export type AncientStoryId='creation-flood'|'nephilim-genesis'|'watchers-enoch'|'david-goliath'|'tower-babel'|'red-sea'
export type AncientStory={id:AncientStoryId;title:string;primary:string[];additional:string[];setting:string;cast:string[];
  style:'flood'|'giants'|'watchers'|'battle'|'tower'|'sea';storySteps:readonly [string,string,string,string];
  lesson:string;interpretation:string;stageAge:'everyone'|'teen';}
export const FAITHVERSE_ANCIENT_STORIES:readonly AncientStory[]=[
 {id:'creation-flood',title:'Noah, the Ark and the Great Flood',primary:['Genesis 6:9–22','Genesis 7:1–24','Genesis 8:1–22','Genesis 9:1–17'],additional:[],setting:'Ancient flood narrative',cast:['Noah','Noah’s family','animals','neighbors'],style:'flood',stageAge:'everyone',
 storySteps:['Explore the land and learn about Noah and his family','Help gather supplies and identify the kinds of animals in the story','Watch animated rain and floodwater rise as the ark remains afloat','After the waters recede, study the covenant and rainbow symbolism'],
 lesson:'Stewardship, responsibility, survival, and covenant',interpretation:'A scripture-guided immersive retelling, not proof of the flood’s extent, dating or geological mechanism.'},
 {id:'nephilim-genesis',title:'Nephilim and Giants in the Biblical Texts',primary:['Genesis 6:1–4','Numbers 13:32–33'],additional:[],setting:'Ancient narrative and later report',cast:['narrator','Nephilim (stylized figures)','Israelite scouts'],style:'giants',stageAge:'teen',
 storySteps:['Read Genesis 6:1–4 with the original narrative context','Compare the scouts’ report in Numbers 13:32–33','Explore a stylized landscape with towering shadowed figures','Discuss translation uncertainty, interpretation and the distinction between ancient text and later traditions'],
 lesson:'Textual comparison, Hebrew translation and interpretive caution',interpretation:'The nature of the Nephilim, their relationship to the sons of God, and literal physical size are debated; this visual depiction is creative interpretation.'},
 {id:'watchers-enoch',title:'The Watchers and Fallen-Angel Tradition',primary:['Genesis 6:1–4'],additional:['1 Enoch 6–15 (Book of Watchers; separate source tradition)'],setting:'Second Temple literary tradition',cast:['narrator','Watchers (stylized symbolic figures)','human communities'],style:'watchers',stageAge:'teen',
 storySteps:['Introduce the short Genesis passage before discussing its interpretations','Enter an imaginative landscape inspired by the Book of Watchers','Watch clearly fictional symbolic figures rather than graphic violence','Compare traditions and the place of 1 Enoch in different religious canons'],
 lesson:'Distinguishing canonical texts, commentary and apocalyptic imagery',interpretation:'1 Enoch is scripture in the Ethiopian Orthodox Tewahedo tradition but not in most Protestant Bibles. The Watchers’ appearance is not historically verified.'},
 {id:'david-goliath',title:'David and Goliath',primary:['1 Samuel 17:1–58'],additional:[],setting:'Valley of Elah',cast:['David','Goliath','Saul','Philistine soldiers','Israelite soldiers'],style:'battle',stageAge:'teen',
 storySteps:['Enter the Valley of Elah and meet the two armies','Prepare a sling with practice targets and one-handed controls','Witness a non-graphic reenactment of David confronting Goliath','Compare courage, strategy, and the actual text of 1 Samuel 17'],
 lesson:'Courage and confronting an intimidating challenge',interpretation:'The fight is depicted as a non-graphic educational reenactment, not encouragement for real-life violence.'},
 {id:'tower-babel',title:'The Tower of Babel',primary:['Genesis 11:1–9'],additional:[],setting:'Ancient city-building story',cast:['builders','families','visitors'],style:'tower',stageAge:'everyone',
 storySteps:['Enter a growing ancient city','Help arrange building materials in a pretend cooperative task','Experience a language puzzle when speech becomes harder to understand','Study the text and its messages about cooperation and human limits'],
 lesson:'Languages, communication and humility',interpretation:'An imaginative educational scenario; reconstructed speech is not verified ancient language.'},
 {id:'red-sea',title:'The Crossing of the Sea',primary:['Exodus 14:1–31'],additional:[],setting:'Exodus narrative',cast:['Moses','Israelite families','Egyptian army'],style:'sea',stageAge:'everyone',
 storySteps:['Join the journey toward the sea','Help families reach a safe crossing viewpoint','Observe animated water separating in a symbolic reconstruction','Read the Exodus passage and reflect on fear, freedom and responsibility'],
 lesson:'Deliverance, care for others and trust',interpretation:'The visual effect illustrates scripture, not historical footage or a verified hydrological explanation.'}
]
export const ANCIENT_STORY_RELEASE_GATE={textSourceReviewRequired:true,approvedTranslationsRequired:true,verifiedRiggedGLB:false,
 multiplayerVerified:false,deviceAcceptanceVerified:false,scriptureSourcesVerifiedByEditor:false,productionReady:false,
 distinction:'Original illustration and narration must remain distinct from direct quotations and contested historical claims.'} as const
