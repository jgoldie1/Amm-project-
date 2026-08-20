import type {
  Checkpoint,
  MatchAssignment,
  MatchRequest,
  MultiplayerTransportEvents,
  PlayerInput,
  WorldSnapshot,
} from './authoritativeMultiplayer';

export type MultiplayerClientOptions = {
  url: string;
  getAccessToken: () => Promise<string | null>;
  onSnapshot?: (snapshot: WorldSnapshot) => void;
  onMatch?: (assignment: MatchAssignment) => void;
  onReconnectState?: (state: MultiplayerTransportEvents['reconnect_state']) => void;
  onStatus?: (status: 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'unauthenticated') => void;
};

type WireMessage = { type: keyof MultiplayerTransportEvents; payload: MultiplayerTransportEvents[keyof MultiplayerTransportEvents] };

export class AuthenticatedMultiplayerClient {
  private options: MultiplayerClientOptions;
  private socket?: WebSocket;
  private reconnectAttempts = 0;
  private reconnectTimer?: number;
  private assignment?: MatchAssignment;
  private shouldReconnect = true;

  constructor(options: MultiplayerClientOptions) {
    this.options = options;
  }

  async connect() {
    const token = await this.options.getAccessToken();
    if (!token) {
      this.options.onStatus?.('unauthenticated');
      return false;
    }

    this.options.onStatus?.(this.reconnectAttempts ? 'reconnecting' : 'connecting');
    const url = new URL(this.options.url);
    url.searchParams.set('access_token', token);
    this.socket = new WebSocket(url);

    this.socket.addEventListener('open', () => {
      this.reconnectAttempts = 0;
      this.options.onStatus?.('connected');
      if (this.assignment) this.send('join_room', { roomId: this.assignment.roomId, reconnectToken: this.assignment.reconnectToken });
    });

    this.socket.addEventListener('message', (event) => this.handleMessage(String(event.data)));
    this.socket.addEventListener('close', () => {
      this.options.onStatus?.('disconnected');
      if (this.shouldReconnect) this.scheduleReconnect();
    });
    this.socket.addEventListener('error', () => this.socket?.close());
    return true;
  }

  disconnect() {
    this.shouldReconnect = false;
    if (this.reconnectTimer) window.clearTimeout(this.reconnectTimer);
    this.socket?.close();
  }

  matchmake(request: MatchRequest) {
    return this.send('matchmake', request);
  }

  sendInput(input: PlayerInput) {
    return this.send('player_input', input);
  }

  saveCheckpoint(checkpoint: Checkpoint) {
    return this.send('checkpoint_save', checkpoint);
  }

  private send<K extends keyof MultiplayerTransportEvents>(type: K, payload: MultiplayerTransportEvents[K]) {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) return false;
    this.socket.send(JSON.stringify({ type, payload } satisfies WireMessage));
    return true;
  }

  private handleMessage(raw: string) {
    try {
      const message = JSON.parse(raw) as WireMessage;
      if (message.type === 'world_snapshot') this.options.onSnapshot?.(message.payload as WorldSnapshot);
      if (message.type === 'match_assignment') {
        this.assignment = message.payload as MatchAssignment;
        this.options.onMatch?.(this.assignment);
        this.send('join_room', { roomId: this.assignment.roomId, reconnectToken: this.assignment.reconnectToken });
      }
      if (message.type === 'reconnect_state') {
        this.options.onReconnectState?.(message.payload as MultiplayerTransportEvents['reconnect_state']);
      }
    } catch {
      // Ignore malformed frames. Production client telemetry may count these without logging sensitive payloads.
    }
  }

  private scheduleReconnect() {
    this.reconnectAttempts += 1;
    const delay = Math.min(10_000, 500 * Math.pow(2, Math.min(this.reconnectAttempts, 5))) + Math.floor(Math.random() * 250);
    this.reconnectTimer = window.setTimeout(() => void this.connect(), delay);
  }
}

// Server requirements:
// - Validate Supabase JWT during the upgrade/handshake; do not trust userId from client payloads.
// - Rate-limit input/matchmaking and authorize every room join.
// - Store only a hash of reconnect tokens server-side and rotate tokens after successful reconnect.
// - Never send service-role credentials to this client.
