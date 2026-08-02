'use strict';
const $ = id => document.getElementById(id);
async function request(path, token) {
  const response = await fetch(path, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || `${response.status}`);
  return data;
}
function show(id, value) { $(id).textContent = JSON.stringify(value, null, 2); }
async function loadPublic() {
  try { show('africa', await request('/api/africa/providers')); } catch (error) { $('africa').textContent = error.message; }
}
$('load').addEventListener('click', async () => {
  const token = $('token').value.trim();
  for (const [id, path] of [['creator','/api/creator/dashboard'],['wallet','/api/wallet'],['media','/api/media/ice-servers'],['admin','/api/admin/control-center']]) {
    try { show(id, await request(path, token)); } catch (error) { $(id).textContent = error.message; }
  }
});
loadPublic();
