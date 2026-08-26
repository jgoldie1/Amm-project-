'use strict';

const RIGHTS = [
  'beneficiary',
  'economicOwnership',
  'votingControl',
  'managementAuthority',
  'educationAccess',
  'ipRoyaltyRights'
];

const DEFAULT_ENTERPRISES = [
  { id: 'all-american-university', name: 'All American University', category: 'education', purpose: 'Career discovery, training, labs, apprenticeships, certifications and pathways into accredited or licensed programs where required.' },
  { id: 'personal-broadcasting-department', name: 'Personal Broadcasting Department', category: 'media', purpose: 'Founder creator studio, AI-assisted production crew, accessible controls and broadcast-once distribution workflow.' },
  { id: 'tryamm-broadcast-studio', name: 'TRYAMM Broadcast Studio', category: 'media', purpose: 'Commercial station, network, agency, newsroom, sports, weather and remote production control room.' },
  { id: 'all-american-live', name: 'All American Live', category: 'entertainment', purpose: 'Concerts, festivals, ticketing, livestream, pay-per-view, merchandise, sponsorship and virtual events.' },
  { id: 'aniyah-64-track', name: 'Aniyah 64-Track Studio', category: 'music', purpose: 'Music creation, recording, production, mix, master, rights metadata, distribution, video, concerts, royalties and analytics.' },
  { id: 'aniyah-global-pay', name: 'Aniyah Global Pay', category: 'financial-services', purpose: 'Cross-border payment experience designed around compliant, licensed payment partners and auditable ledgers.' },
  { id: 'jacobie-vision', name: 'Jacobie Vision', category: 'technology-real-estate', purpose: 'Cybersecurity, computer vision, 3D and property media, real-estate analysis, home flipping and property development workflows.' },
  { id: 'isaiah-ai-tv', name: 'Isaiah AI TV', category: 'media', purpose: 'Creator television, live channels, sports, music, podcasts, subscriptions, advertising and commerce.' },
  { id: 'who-wants-to-be-a-star', name: 'Who Wants to Be a Star', category: 'entertainment', purpose: 'Talent discovery, auditions, training, competition and progression into professional production opportunities.' },
  { id: 'starverse', name: 'StarVerse', category: 'entertainment', purpose: 'Persistent performance world for virtual shows, creator communities, commerce and fan experiences.' }
];

const DEFAULT_PATHWAYS = [
  { id: 'become-anything', name: 'Become Anything', steps: ['dream', 'requirements', 'skills', 'courses', 'mentor', 'projects', 'internship', 'college-or-trade', 'funding', 'credential-or-license', 'career-or-business', 'continuing-education'] },
  { id: 'health-professions', name: 'Health Professions', note: 'Preparation pathway only. Regulated medical careers must route to appropriately accredited schools, clinical training, residency, licensing and board requirements.' },
  { id: 'real-estate-development', name: 'Real Estate & Development', note: 'Training can include deal analysis, construction budgets, property media and project management. Licensed activity must be performed through appropriately licensed professionals where required.' },
  { id: 'media-music-entertainment', name: 'Media, Music & Entertainment', note: 'Learn-to-lab-to-real-project pathway for audio, video, broadcasting, live events, rights, marketing and production.' }
];

module.exports = function registerFamilyEnterpriseRoutes({ app, auth, admin, clean, id, getStore, saveStore }) {
  function store() {
    const state = getStore();
    state.familyEnterprise ||= {
      members: [],
      enterprises: DEFAULT_ENTERPRISES,
      pathways: DEFAULT_PATHWAYS,
      opportunityFunds: [],
      ipAssets: [],
      succession: [],
      council: []
    };
    state.familyEnterprise.enterprises ||= DEFAULT_ENTERPRISES;
    state.familyEnterprise.pathways ||= DEFAULT_PATHWAYS;
    state.familyEnterprise.members ||= [];
    state.familyEnterprise.opportunityFunds ||= [];
    state.familyEnterprise.ipAssets ||= [];
    state.familyEnterprise.succession ||= [];
    state.familyEnterprise.council ||= [];
    return state.familyEnterprise;
  }

  function bool(value) { return value === true || value === 'true'; }
  function rights(body = {}) {
    return Object.fromEntries(RIGHTS.map(key => [key, bool(body[key])]));
  }
  function adminChain(req, res, next) { return auth(req, res, () => admin(req, res, next)); }

  app.get('/api/family-enterprise/overview', adminChain, (req, res) => {
    const data = store();
    res.json({
      members: data.members,
      enterprises: data.enterprises,
      pathways: data.pathways,
      counts: {
        members: data.members.length,
        enterprises: data.enterprises.length,
        opportunityFunds: data.opportunityFunds.length,
        ipAssets: data.ipAssets.length,
        successionDirectives: data.succession.length,
        councilMembers: data.council.length
      },
      guardrails: {
        familyTreeMembershipDoesNotGrantOwnership: true,
        employmentDoesNotGrantOwnership: true,
        beneficiaryStatusIsSeparate: true,
        votingControlIsSeparate: true,
        regulatedCareersRequireExternalCredentials: true,
        regulatedFinancialActivityRequiresCompliantPartnersOrLicensing: true
      }
    });
  });

  app.post('/api/family-enterprise/members', adminChain, async (req, res) => {
    const data = store();
    const displayName = clean(req.body.displayName, 120);
    if (!displayName) return res.status(400).json({ error: 'Display name is required' });
    const member = {
      id: id('family'),
      displayName,
      relationship: clean(req.body.relationship, 80) || 'family',
      careerGoal: clean(req.body.careerGoal, 240),
      careerFlexible: req.body.careerFlexible !== false,
      rights: rights(req.body.rights || {}),
      notes: clean(req.body.notes, 500),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.members.push(member);
    await saveStore();
    res.status(201).json({ member });
  });

  app.patch('/api/family-enterprise/members/:memberId', adminChain, async (req, res) => {
    const data = store();
    const member = data.members.find(item => item.id === clean(req.params.memberId, 100));
    if (!member) return res.status(404).json({ error: 'Family member not found' });
    if (req.body.displayName !== undefined) member.displayName = clean(req.body.displayName, 120) || member.displayName;
    if (req.body.relationship !== undefined) member.relationship = clean(req.body.relationship, 80);
    if (req.body.careerGoal !== undefined) member.careerGoal = clean(req.body.careerGoal, 240);
    if (req.body.careerFlexible !== undefined) member.careerFlexible = bool(req.body.careerFlexible);
    if (req.body.rights) member.rights = rights(req.body.rights);
    if (req.body.notes !== undefined) member.notes = clean(req.body.notes, 500);
    member.updatedAt = new Date().toISOString();
    await saveStore();
    res.json({ member });
  });

  app.post('/api/family-enterprise/opportunity-funds', adminChain, async (req, res) => {
    const data = store();
    const fund = {
      id: id('opp'),
      name: clean(req.body.name, 120) || 'Family Opportunity Fund',
      purpose: clean(req.body.purpose, 500) || 'Education, retraining, entrepreneurship and approved life opportunities.',
      beneficiaryMemberIds: Array.isArray(req.body.beneficiaryMemberIds) ? req.body.beneficiaryMemberIds.map(value => clean(value, 100)).filter(Boolean) : [],
      status: ['planned', 'funding', 'active', 'paused'].includes(req.body.status) ? req.body.status : 'planned',
      createdAt: new Date().toISOString()
    };
    data.opportunityFunds.push(fund);
    await saveStore();
    res.status(201).json({ fund });
  });

  app.post('/api/family-enterprise/ip-assets', adminChain, async (req, res) => {
    const data = store();
    const name = clean(req.body.name, 160);
    if (!name) return res.status(400).json({ error: 'Asset name is required' });
    const asset = {
      id: id('ip'),
      name,
      assetType: clean(req.body.assetType, 80) || 'other',
      legalOwner: clean(req.body.legalOwner, 160),
      creator: clean(req.body.creator, 160),
      successor: clean(req.body.successor, 160),
      royaltyNotes: clean(req.body.royaltyNotes, 500),
      licenseNotes: clean(req.body.licenseNotes, 500),
      verificationStatus: 'needs-legal-review',
      createdAt: new Date().toISOString()
    };
    data.ipAssets.push(asset);
    await saveStore();
    res.status(201).json({ asset });
  });

  app.post('/api/family-enterprise/succession', adminChain, async (req, res) => {
    const data = store();
    const directive = {
      id: id('succession'),
      trigger: clean(req.body.trigger, 80) || 'future-review',
      subject: clean(req.body.subject, 160),
      intendedOutcome: clean(req.body.intendedOutcome, 700),
      legalStatus: 'planning-only',
      requiresAttorneyReview: true,
      createdAt: new Date().toISOString()
    };
    if (!directive.subject || !directive.intendedOutcome) return res.status(400).json({ error: 'Subject and intended outcome are required' });
    data.succession.push(directive);
    await saveStore();
    res.status(201).json({ directive });
  });
};
