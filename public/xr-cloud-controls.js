'use strict';
(() => {
  const status = document.querySelector('#xrStatus');
  const presence = document.querySelector('#studioPresence');
  const roomInput = document.querySelector('#studioRoomId');
  let connection = null;
  function announce(message) { if (status) status.textContent = message; }
  function bind() {
    const cloud = window.TryAMMStudioCloud;
    if (!cloud) return announce('Studio cloud client is unavailable.');
    document.querySelector('#saveXRCloud')?.addEventListener('click', async () => {
      try {
        const layout = JSON.parse(localStorage.getItem('tryamm-xr-layout') || '[]');
        const project = await cloud.saveCurrentProject({ layout, anchor: localStorage.getItem('tryamm-xr-anchor') || null });
        announce(`XR layout saved with cloud project ${project.id}.`);
      } catch (error) { announce(error.message); }
    });
    document.querySelector('#createStudioRoom')?.addEventListener('click', async () => {
      try {
        const projectId = localStorage.getItem('tryamm_cloud_project_id') || '';
        const room = await cloud.createStudioRoom(projectId, 'TryAMM XR Vocal Session');
        roomInput.value = room.id;
        announce(`XR collaboration room created: ${room.id}`);
      } catch (error) { announce(error.message); }
    });
    document.querySelector('#joinStudioRoom')?.addEventListener('click', () => {
      try {
        connection?.disconnect();
        const roomId = roomInput.value.trim() || localStorage.getItem('tryamm_xr_studio_room_id');
        if (!roomId) throw new Error('Enter or create an XR studio room first.');
        connection = cloud.connectStudioRoom(roomId, {
          onPresence: ({ count }) => { if (presence) presence.textContent = `${count} collaborator${count === 1 ? '' : 's'} connected`; },
          onPeerJoined: ({ name }) => announce(`${name} joined the XR studio.`),
          onState: (event) => window.dispatchEvent(new CustomEvent('tryamm:xr-remote-state', { detail: event })),
          onError: ({ error }) => announce(error)
        });
        window.tryammStudioSocket = { emit: (_name, event) => connection.send(event.type, event.payload) };
        localStorage.setItem('tryamm_xr_studio_room_id', roomId);
        announce(`Joining XR collaboration room ${roomId}.`);
      } catch (error) { announce(error.message); }
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind); else bind();
  window.addEventListener('beforeunload', () => connection?.disconnect());
})();
