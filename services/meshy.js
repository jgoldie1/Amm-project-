async function createTextTo3D({ prompt, artStyle = 'realistic' }) {
  if (!process.env.MESHY_API_KEY) return { mode: 'mock', id: `meshy_mock_${Date.now()}`, status: 'PENDING', prompt };
  const response = await fetch('https://api.meshy.ai/openapi/v2/text-to-3d', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ mode: 'preview', prompt, art_style: artStyle, negative_prompt: 'low quality, broken geometry' })
  });
  if (!response.ok) throw new Error(`Meshy returned ${response.status}`);
  const data = await response.json();
  return { mode: 'live', id: data.result || data.id, status: 'PENDING' };
}

async function getTask(id) {
  if (!process.env.MESHY_API_KEY || String(id).startsWith('meshy_mock_')) return { mode: 'mock', id, status: 'SUCCEEDED', model_urls: {} };
  const response = await fetch(`https://api.meshy.ai/openapi/v2/text-to-3d/${encodeURIComponent(id)}`, { headers: { Authorization: `Bearer ${process.env.MESHY_API_KEY}` } });
  if (!response.ok) throw new Error(`Meshy returned ${response.status}`);
  return { mode: 'live', ...(await response.json()) };
}

module.exports = { createTextTo3D, getTask, connected: () => Boolean(process.env.MESHY_API_KEY) };
