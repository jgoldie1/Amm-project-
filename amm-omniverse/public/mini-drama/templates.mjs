import {original} from './story.mjs'

// Ordered shot data keeps templates independent of the renderer, as in Editly's clip sequence.
const build=(rows)=>rows.map(([scene,shot,line],i)=>({...original[i],scene,shot,line,speaker:'NARRATOR'}))
export const templates={
  drama:{title:'One Slot, Two Mics',shots:original},
  business:{title:'A business in five shots',shots:build([
    ['EXT. STOREFRONT - DAY','Start on the finished work. Let the viewer see the detail.','Here is what we made.'],
    ['INT. WORKSHOP - DAY','Show the problem before the work began.','This is how it started.'],
    ['INT. WORKSHOP - CONTINUOUS','Film the maker performing one decisive step.','Watch this part closely.'],
    ['INT. SHOP - DAY','Hold on the result in use.','Here is the difference.'],
    ['EXT. STOREFRONT - DAY','End on the actual booking address or contact card.','Ask us for a walkthrough.']
  ])},
  isaiah:{title:'Isaiah AI TV introduction',shots:build([
    ['INT. STUDIO - DAY','Show the host on camera.','Welcome to Isaiah AI TV.'],
    ['EXT. LOCATION - DAY','Establish where this episode happens.','Today we visit Greenville.'],
    ['INT. STUDIO - DAY','Show the featured guest with their permission.','Meet the creator behind the show.'],
    ['INT. SCREENING ROOM - DAY','Cut to a cleared excerpt and credit the production.','Here is a look at the featured episode.'],
    ['INT. STUDIO - DAY','Hold the program title long enough to read.','Watch the full story on Free TV.']
  ])}
}
