const crypto = require('crypto');

function createNewsManager() {
  const stories = new Map();
  const channels = new Map();

  function createStory(input = {}) {
    if (!input.title) throw new Error('TITLE_REQUIRED');
    const id = crypto.randomUUID();
    const story = {
      id,
      title: String(input.title).slice(0, 240),
      summary: String(input.summary || '').slice(0, 2000),
      category: input.category || 'general',
      region: input.region || 'global',
      sourceName: input.sourceName || 'TryAMM Newsroom',
      sourceUrl: input.sourceUrl || null,
      author: input.author || null,
      publishedAt: input.publishedAt || new Date().toISOString(),
      status: input.status || 'draft',
      verification: input.verification || 'unverified',
      media: input.media || {},
      tags: Array.isArray(input.tags) ? input.tags.slice(0, 20) : [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    stories.set(id, story);
    return story;
  }

  function updateStory(id, patch = {}) {
    const story = stories.get(id);
    if (!story) return null;
    const allowed = ['title','summary','category','region','sourceName','sourceUrl','author','publishedAt','status','verification','media','tags'];
    for (const key of allowed) if (Object.prototype.hasOwnProperty.call(patch, key)) story[key] = patch[key];
    story.updatedAt = new Date().toISOString();
    return story;
  }

  function listStories({ category, region, status = 'published', limit = 50 } = {}) {
    return [...stories.values()]
      .filter(s => !status || s.status === status)
      .filter(s => !category || s.category === category)
      .filter(s => !region || s.region === region)
      .sort((a,b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, Math.max(1, Math.min(200, Number(limit) || 50)));
  }

  function createChannel(input = {}) {
    if (!input.name) throw new Error('NAME_REQUIRED');
    const id = crypto.randomUUID();
    const channel = {
      id,
      name: String(input.name).slice(0,120),
      slug: input.slug || `channel-${id.slice(0,8)}`,
      description: String(input.description || '').slice(0,1000),
      regions: Array.isArray(input.regions) ? input.regions : ['global'],
      categories: Array.isArray(input.categories) ? input.categories : ['general'],
      liveUrl: input.liveUrl || null,
      status: input.status || 'draft',
      createdAt: new Date().toISOString()
    };
    channels.set(id, channel);
    return channel;
  }

  function listChannels() { return [...channels.values()]; }

  return { createStory, updateStory, listStories, createChannel, listChannels };
}

module.exports = { createNewsManager };
