'use strict';
(() => {
  const token = () => localStorage.getItem('tryamm_token') || '';
  async function api(url, options = {}) {
    const auth = token();
    if (!auth) throw new Error('Sign in to TryAMM before using cloud studio features.');
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${auth}`,
        ...(options.headers || {})
      }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || 'Studio cloud request failed');
    return data;
  }

  async function readLocalProject() {
    const db = await new Promise((resolve, reject) => {
      const request = indexedDB.open('tryamm-vocal-studio', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    return new Promise((resolve, reject) => {
      const request = db.transaction('projects').objectStore('projects').get('current');
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async function saveCurrentProject(extra = {}) {
    const project = await readLocalProject();
    if (!project?.tracks?.length) throw new Error('Save a project on this device before sending it to the cloud.');
    const cloudId = localStorage.getItem('tryamm_cloud_project_id') || undefined;
    const result = await api('/api/studio/projects', {
      method: 'POST',
      body: JSON.stringify({ id: cloudId, state: project, xr: extra })
    });
    localStorage.setItem('tryamm_cloud_project_id', result.project.id);
    return result.project;
  }

  async function listProjects() { return (await api('/api/studio/projects')).projects; }
  async function loadProject(projectId) { return (await api(`/api/studio/projects/${encodeURIComponent(projectId)}`)).project; }
  async function deleteProject(projectId) { return api(`/api/studio/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' }); }
  async function createStudioRoom(projectId, name) {
    const result = await api('/api/studio/rooms', { method: 'POST', body: JSON.stringify({ projectId, name }) });
    localStorage.setItem('tryamm_xr_studio_room_id', result.room.id);
    return result.room;
  }

  function connectStudioRoom(roomId, handlers = {}) {
    if (!window.io) throw new Error('Socket.IO client is unavailable.');
    const auth = token();
    if (!auth) throw new Error('Sign in to join an XR collaboration room.');
    const socket = window.io({ auth: { token: auth } });
    socket.on('connect', () => socket.emit('studio:join', { studioRoomId: roomId }));
    socket.on('studio:presence', (event) => handlers.onPresence?.(event));
    socket.on('studio:peer-joined', (event) => handlers.onPeerJoined?.(event));
    socket.on('xr_studio_state', (event) => handlers.onState?.(event));
    socket.on('studio:error', (event) => handlers.onError?.(event));
    socket.on('connect_error', (error) => handlers.onError?.({ error: error.message }));
    return {
      socket,
      send(type, payload) { socket.emit('xr_studio_state', { studioRoomId: roomId, type, payload }); },
      disconnect() { socket.disconnect(); }
    };
  }

  window.TryAMMStudioCloud = { api, saveCurrentProject, listProjects, loadProject, deleteProject, createStudioRoom, connectStudioRoom };

  const cloudButton = document.querySelector('#cloudSave');
  const status = document.querySelector('#studioStatus');
  if (cloudButton) cloudButton.onclick = async () => {
    cloudButton.disabled = true;
    if (status) status.textContent = 'Saving project metadata to TryAMM cloud…';
    try {
      const project = await saveCurrentProject();
      if (status) status.textContent = `Cloud project “${project.name}” saved as version ${project.version}. Audio-object storage remains the next backend stage.`;
    } catch (error) {
      if (status) status.textContent = error.message;
    } finally { cloudButton.disabled = false; }
  };
})();
