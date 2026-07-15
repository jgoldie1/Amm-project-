const Anthropic = require('@anthropic-ai/sdk');

async function askClaude({ system, messages, maxTokens = 1200 }) {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const response = await client.messages.create({
    model: process.env.CLAUDE_MODEL || 'claude-sonnet-4-5',
    max_tokens: maxTokens,
    system,
    messages: messages.filter((m) => m.role !== 'system').map((m) => ({ role: m.role, content: m.content }))
  });
  return response.content.filter((item) => item.type === 'text').map((item) => item.text).join('\n');
}

module.exports = { askClaude, connected: () => Boolean(process.env.ANTHROPIC_API_KEY) };
