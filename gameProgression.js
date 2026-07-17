const progressionFramework = {
  recommendedLaunchLevelsPerGame: 12,
  fullSeasonLevelsPerGame: 25,
  longTermCampaignLevelsPerGame: 100,
  structure: [
    { range: "1-5", phase: "Welcome", purpose: "Teach controls through short, rewarding missions" },
    { range: "6-15", phase: "Discovery", purpose: "Introduce builds, characters, maps, and cooperative play" },
    { range: "16-30", phase: "Mastery", purpose: "Add tactical choices, skill challenges, and ranked readiness" },
    { range: "31-50", phase: "World Expansion", purpose: "Unlock new regions, stories, bosses, and creator content" },
    { range: "51-75", phase: "Elite", purpose: "Advanced missions, tournaments, team roles, and prestige cosmetics" },
    { range: "76-100", phase: "Legacy", purpose: "Endgame stories, community events, mastery trials, and New Game Plus" }
  ],
  engagementSystems: [
    "Clear three-minute first mission",
    "Meaningful choices and multiple play styles",
    "Co-op missions and family teams",
    "Story cliffhangers without forced spending",
    "Daily and weekly optional challenges",
    "Creator-made levels with moderation",
    "Seasonal events that preserve earned items",
    "Cosmetic and skill-based rewards",
    "Fair matchmaking",
    "Accessibility and adaptive difficulty",
    "Cross-game achievements",
    "AR/VR/MR and holographic bonus experiences"
  ],
  safetyRules: [
    "No pay-to-win power",
    "No purchased loot boxes for minors",
    "No punishment for taking breaks",
    "No fake scarcity or deceptive countdowns",
    "Parent-controlled spending and playtime",
    "Age-appropriate social and recommendation lanes"
  ]
};

module.exports = { progressionFramework };
