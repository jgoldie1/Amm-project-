function readProviderConfig(env = process.env) {
  const providers = [
    {
      id: 'tryamm-local',
      name: 'TryAMM Local Renderer',
      capabilities: ['poster', 'animatic', 'production-plan'],
      configured: true,
      mode: 'local'
    },
    {
      id: 'image-api',
      name: 'External Image Provider',
      capabilities: ['character-sheet', 'background', 'keyframe', 'poster'],
      configured: Boolean(env.ANIME_IMAGE_API_URL && env.ANIME_IMAGE_API_KEY),
      mode: 'remote',
      requiredEnvironment: ['ANIME_IMAGE_API_URL', 'ANIME_IMAGE_API_KEY']
    },
    {
      id: 'video-api',
      name: 'External Video Provider',
      capabilities: ['image-to-video', 'text-to-video', 'mp4'],
      configured: Boolean(env.ANIME_VIDEO_API_URL && env.ANIME_VIDEO_API_KEY),
      mode: 'remote',
      requiredEnvironment: ['ANIME_VIDEO_API_URL', 'ANIME_VIDEO_API_KEY']
    }
  ];

  return providers;
}

function chooseProvider(requested, providers) {
  if (requested) {
    const match = providers.find(provider => provider.id === requested);
    if (!match) throw new Error('Unknown generation provider');
    if (!match.configured) throw new Error(`${match.name} is not configured`);
    return match;
  }
  return providers.find(provider => provider.configured) || providers[0];
}

module.exports = { readProviderConfig, chooseProvider };
