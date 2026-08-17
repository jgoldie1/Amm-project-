'use strict';

(function (global) {
  const DEFAULT_ICE = [{ urls: 'stun:stun.l.google.com:19302' }];

  class HoloMediaTransport {
    constructor({ socket, localVideo, remoteVideo, onStatus = () => {}, iceServers = DEFAULT_ICE } = {}) {
      if (!socket) throw new Error('socket_required');
      this.socket = socket;
      this.localVideo = localVideo || null;
      this.remoteVideo = remoteVideo || null;
      this.onStatus = onStatus;
      this.iceServers = Array.isArray(iceServers) && iceServers.length ? iceServers : DEFAULT_ICE;
      this.localStream = null;
      this.peers = new Map();
      this.bound = false;
    }

    status(type, detail = {}) {
      this.onStatus({ type, ...detail, at: Date.now() });
    }

    async startCapture({ video = true, audio = true } = {}) {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('media_devices_unavailable');
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
        audio: audio ? { echoCancellation: true, noiseSuppression: true, autoGainControl: true } : false
      });
      if (this.localVideo) {
        this.localVideo.srcObject = this.localStream;
        this.localVideo.muted = true;
        this.localVideo.playsInline = true;
        await this.localVideo.play().catch(() => {});
      }
      this.status('capture-started', { tracks: this.localStream.getTracks().map(t => t.kind) });
      return this.localStream;
    }

    bind() {
      if (this.bound) return;
      this.bound = true;
      this.socket.on('holo:peer', async ({ socketId, status }) => {
        if (!socketId || socketId === this.socket.id) return;
        if (status === 'left') return this.closePeer(socketId);
        if (status === 'joined' && String(this.socket.id).localeCompare(String(socketId)) < 0) {
          await this.call(socketId).catch(error => this.status('peer-error', { socketId, error: error.message }));
        }
      });
      this.socket.on('holo:signal', async ({ from, data }) => {
        try { await this.handleSignal(from, data); }
        catch (error) { this.status('signal-error', { from, error: error.message }); }
      });
    }

    createPeer(socketId) {
      if (this.peers.has(socketId)) return this.peers.get(socketId);
      const pc = new RTCPeerConnection({ iceServers: this.iceServers });
      this.localStream?.getTracks().forEach(track => pc.addTrack(track, this.localStream));
      pc.onicecandidate = event => {
        if (event.candidate) this.socket.emit('holo:signal', { to: socketId, data: { type: 'ice', candidate: event.candidate } });
      };
      pc.ontrack = event => {
        const stream = event.streams?.[0];
        if (stream && this.remoteVideo) {
          this.remoteVideo.srcObject = stream;
          this.remoteVideo.playsInline = true;
          this.remoteVideo.play().catch(() => {});
        }
        this.status('remote-track', { socketId, kind: event.track?.kind });
      };
      pc.onconnectionstatechange = () => {
        this.status('peer-state', { socketId, state: pc.connectionState });
        if (['failed', 'closed', 'disconnected'].includes(pc.connectionState)) this.closePeer(socketId);
      };
      this.peers.set(socketId, pc);
      return pc;
    }

    async call(socketId) {
      if (!this.localStream) throw new Error('capture_not_started');
      const pc = this.createPeer(socketId);
      if (pc.signalingState !== 'stable') return;
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      this.socket.emit('holo:signal', { to: socketId, data: { type: 'offer', sdp: pc.localDescription } });
      this.status('offer-sent', { socketId });
    }

    async handleSignal(from, data) {
      if (!from || !data?.type) return;
      const pc = this.createPeer(from);
      if (data.type === 'offer') {
        if (!this.localStream) await this.startCapture();
        if (!pc.getSenders().length) this.localStream.getTracks().forEach(track => pc.addTrack(track, this.localStream));
        await pc.setRemoteDescription(data.sdp);
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        this.socket.emit('holo:signal', { to: from, data: { type: 'answer', sdp: pc.localDescription } });
        this.status('answer-sent', { socketId: from });
      } else if (data.type === 'answer') {
        await pc.setRemoteDescription(data.sdp);
        this.status('answer-applied', { socketId: from });
      } else if (data.type === 'ice' && data.candidate) {
        await pc.addIceCandidate(data.candidate);
      }
    }

    setMuted(muted) {
      this.localStream?.getAudioTracks().forEach(track => { track.enabled = !muted; });
      this.status('mute-changed', { muted: Boolean(muted) });
    }

    setCameraEnabled(enabled) {
      this.localStream?.getVideoTracks().forEach(track => { track.enabled = Boolean(enabled); });
      this.status('camera-changed', { enabled: Boolean(enabled) });
    }

    closePeer(socketId) {
      const pc = this.peers.get(socketId);
      if (pc) pc.close();
      this.peers.delete(socketId);
      this.status('peer-closed', { socketId });
    }

    stop() {
      for (const socketId of [...this.peers.keys()]) this.closePeer(socketId);
      this.localStream?.getTracks().forEach(track => track.stop());
      this.localStream = null;
      if (this.localVideo) this.localVideo.srcObject = null;
      if (this.remoteVideo) this.remoteVideo.srcObject = null;
      this.status('transport-stopped');
    }
  }

  global.HoloMediaTransport = HoloMediaTransport;
})(window);
