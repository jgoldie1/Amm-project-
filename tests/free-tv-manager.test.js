const assert = require('assert');
const { createFreeTvManager } = require('../lib/free-tv-manager');

const manager = createFreeTvManager();
const title = manager.createTitle({ title: 'Crown House Pilot', type: 'reality', lane: 'mature_18_plus' });
assert(title.id);

let result = manager.publishTitle(title.id);
assert.strictEqual(result.ok, false, 'Draft title must not publish before release gates pass');

manager.updateTitle(title.id, {
  assets: { master: 's3://example/master.m3u8', poster: 's3://example/poster.jpg' },
  rights: {
    ownershipDeclaration: true,
    participantReleases: 'approved',
    musicRights: 'approved',
    footageRights: 'approved',
    locationReleases: 'approved',
    territoryRights: 'approved'
  },
  review: { technicalQc: 'passed', compliance: 'passed', moderation: 'passed' }
});

result = manager.publishTitle(title.id);
assert.strictEqual(result.ok, true, 'Fully cleared title should publish');
assert.strictEqual(result.title.status, 'published');

const progress = manager.saveProgress('user-1', title.id, 120, 3600);
assert.strictEqual(progress.positionSeconds, 120);

const channel = manager.createChannel({ name: 'TryAMM Reality', lane: 'mature_18_plus' });
const scheduled = manager.setSchedule(channel.id, [{ titleId: title.id, startsAt: '2026-07-24T20:00:00Z' }]);
assert.strictEqual(scheduled.schedule.length, 1);

console.log('Free TV manager smoke test passed');
