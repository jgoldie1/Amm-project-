/** Community governance for StreetVerse. Advisory voting is not equity, securities, token voting, or control of TRYAMM LLC. */
export type ProposalCategory='creator-tools'|'accessibility'|'community-project'|'gameplay'|'marketplace-policy'
export type Proposal={id:string;authorId:string;category:ProposalCategory;title:string;description:string;createdAt:string;closesAt:string;status:'open'|'closed'|'approved'|'rejected';votes:Record<string,'yes'|'no'|'abstain'>;ownerDecision?:{decision:'approved'|'rejected';reason:string;reviewerId:string}}
export type GovernancePolicy={platformOwner:'TRYAMM LLC';communityVoting:'advisory';ownershipTransferAllowed:false;cashPayoutByVoteAllowed:false;tokenRequired:false}
export const GOVERNANCE_POLICY:GovernancePolicy={platformOwner:'TRYAMM LLC',communityVoting:'advisory',ownershipTransferAllowed:false,cashPayoutByVoteAllowed:false,tokenRequired:false}
const validId=(id:string)=>/^[a-z0-9-]{3,64}$/.test(id)
export function createProposal(input:Pick<Proposal,'id'|'authorId'|'category'|'title'|'description'|'createdAt'|'closesAt'>):Proposal{
 if(!validId(input.id)||!input.authorId.trim()||!input.title.trim()||input.title.length>120||input.description.length>2000)throw new Error('Invalid proposal')
 if(!Number.isFinite(Date.parse(input.createdAt))||!Number.isFinite(Date.parse(input.closesAt))||Date.parse(input.closesAt)<=Date.parse(input.createdAt))throw new Error('Invalid voting dates')
 return {...input,status:'open',votes:{}}
}
export function castCommunityVote(proposal:Proposal,voterId:string,choice:'yes'|'no'|'abstain',now:string):Proposal{
 if(proposal.status!=='open'||Date.parse(now)>=Date.parse(proposal.closesAt))throw new Error('Voting closed')
 if(!voterId.trim()||!Number.isFinite(Date.parse(now))||Date.parse(now)<Date.parse(proposal.createdAt))throw new Error('Invalid voter or voting date')
 if(proposal.votes[voterId])throw new Error('Duplicate vote')
 return {...proposal,votes:{...proposal.votes,[voterId]:choice}}
}
export function tallyCommunityVotes(proposal:Proposal){
 const votes=Object.values(proposal.votes)
 return {yes:votes.filter(v=>v==='yes').length,no:votes.filter(v=>v==='no').length,abstain:votes.filter(v=>v==='abstain').length,total:votes.length}
}
export function closeCommunityProposal(proposal:Proposal,now:string):Proposal{
 if(proposal.status!=='open'||!Number.isFinite(Date.parse(now))||Date.parse(now)<Date.parse(proposal.closesAt))throw new Error('Proposal not ready to close')
 return {...proposal,status:'closed'}
}
export function decideCommunityProposal(proposal:Proposal,reviewerId:string,decision:'approved'|'rejected',reason:string):Proposal{
 if(proposal.status!=='closed'||!reviewerId.trim()||!reason.trim())throw new Error('Documented owner decision required after voting')
 return {...proposal,status:decision,ownerDecision:{decision,reason,reviewerId}}
}
export type CreatorOwnershipRecord={assetId:string;creatorId:string;license:'original'|'licensed';platformLicense:'nonexclusive';creatorRetainsCopyright:true;verifiedBy:string}
export function registerCreatorOwnership(record:CreatorOwnershipRecord):CreatorOwnershipRecord{
 if(!validId(record.assetId)||!record.creatorId||!record.verifiedBy||record.platformLicense!=='nonexclusive'||record.creatorRetainsCopyright!==true)throw new Error('Invalid creator ownership declaration')
 return record
}
