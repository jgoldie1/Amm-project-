'use strict';
/* Polls are local gameplay opinion signals, never payments, elections, or verified ratings. */
const OPTIONS=['A','B','C','D'];
function createPoll({id,question,choices}){
 if(!/^[a-z0-9-]{1,60}$/i.test(id||'')||typeof question!=='string'||!question.trim())throw Error('Invalid poll');
 if(!Array.isArray(choices)||choices.length<2||choices.length>4||choices.some(x=>typeof x!=='string'||!x.trim()))throw Error('Poll requires 2-4 choices');
 const counts=Object.fromEntries(OPTIONS.slice(0,choices.length).map(x=>[x,0]));const votes=new Map();
 function result(){const total=Object.values(counts).reduce((a,b)=>a+b,0);return {id,question,total,options:choices.map((label,i)=>({key:OPTIONS[i],label,votes:counts[OPTIONS[i]],percent:total?Math.round(counts[OPTIONS[i]]/total*100):0})),rating:total?Number((choices.reduce((sum,_,i)=>sum+(i+1)*counts[OPTIONS[i]],0)/total).toFixed(2)):null,scale:[1,choices.length]};}
 return {vote(voter,choice){if(typeof voter!=='string'||!voter.trim()||voter.length>128)throw Error('Invalid voter');if(!Object.hasOwn(counts,choice))throw Error('Invalid choice');const previous=votes.get(voter);if(previous===choice)return result();if(previous)counts[previous]--;votes.set(voter,choice);counts[choice]++;return result();},result};
}
module.exports={createPoll,OPTIONS};
