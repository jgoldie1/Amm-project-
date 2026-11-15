/** Advisory, non-token creator governance. No ownership interests, investment rights or automatic spending. */
export type ProposalCategory='creator-tools'|'accessibility'|'community-project'|'marketplace-policy'
export type ProposalStatus='open'|'closed'|'approved-for-review'|'rejected'|'executed'
export type Proposal={id:string;authorId:string;category:ProposalCategory;title:string;description:string;status:ProposalStatus;votes:Record<string,'yes'|'no'>;createdAt:string;closedAt?:string;authorizedBy?:string;executionReference?:string}
export const GOVERNANCE_POLICY={quorum:5,approvalPercent:60,treasuryAutospend:false,equityVotes:false,tokenVotes:false} as const
export function createProposal(id:string,authorId:string,category:ProposalCategory,title:string,description:string,createdAt:string):Proposal{
 if(!/^[a-z0-9-]{3,64}$/.test(id)||!authorId.trim()||title.trim().length<8||title.length>100||description.trim().length<20||description.length>2000)throw new Error('Invalid governance proposal')
 if(!['creator-tools','accessibility','community-project','marketplace-policy'].includes(category))throw new Error('Invalid proposal category')
 return {id,authorId,category,title,description,status:'open',votes:{},createdAt}
}
export function castCreatorVote(proposal:Proposal,voterId:string,choice:'yes'|'no',eligibleCreatorIds:ReadonlySet<string>):Proposal{
 if(proposal.status!=='open')throw new Error('Voting is closed')
 if(!eligibleCreatorIds.has(voterId))throw new Error('Not an eligible creator')
 if(proposal.votes[voterId])throw new Error('Duplicate vote prohibited')
 return {...proposal,votes:{...proposal.votes,[voterId]:choice}}
}
export function closeCreatorVote(proposal:Proposal,closedAt:string):Proposal{
 if(proposal.status!=='open')throw new Error('Proposal already closed')
 const votes=Object.values(proposal.votes),yes=votes.filter(v=>v==='yes').length
 const passed=votes.length>=GOVERNANCE_POLICY.quorum&&yes*100>=votes.length*GOVERNANCE_POLICY.approvalPercent
 return {...proposal,status:passed?'approved-for-review':'rejected',closedAt}
}
export function authorizeCreatorProposal(proposal:Proposal,authorizedBy:string,executionReference:string):Proposal{
 if(proposal.status!=='approved-for-review')throw new Error('Proposal did not pass advisory review')
 if(!authorizedBy.trim()||!executionReference.trim())throw new Error('TRYAMM authorization and audit reference required')
 return {...proposal,status:'executed',authorizedBy,executionReference}
}
export type GovernanceRights={creatorOwnsOriginalContent:boolean;platformRetainsCoreIP:boolean;creatorVotingIsAdvisory:boolean;automaticPayouts:boolean;companyEquityGranted:boolean}
export const CREATOR_GOVERNANCE_RIGHTS:GovernanceRights={creatorOwnsOriginalContent:true,platformRetainsCoreIP:true,creatorVotingIsAdvisory:true,automaticPayouts:false,companyEquityGranted:false}
