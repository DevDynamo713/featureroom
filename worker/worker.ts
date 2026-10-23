export interface Env { FEATUREROOM_DO: DurableObjectNamespace; }
export class FeatureRoomDO {
  private state: DurableObjectState;
  private features: Map<string, any> = new Map();
  private websockets: WebSocket[] = [];
  constructor(state: DurableObjectState, env: Env) { this.state = state; }
  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      const pair = new WebSocketPair();
      this.state.acceptWebSocket(pair[1]);
      return new Response(null, { status: 101, webSocket: pair[0] });
    }
    if (url.pathname === '/features' && request.method === 'GET') {
      return Response.json(Array.from(this.features.values()));
    }
    if (url.pathname === '/feature' && request.method === 'POST') {
      const data = await request.json();
      const feature = { ...data, id: crypto.randomUUID(), version: 1, consumers: 0 };
      this.features.set(feature.id, feature);
      this.broadcast(JSON.stringify({ type: 'feature', data: feature }));
      return Response.json({ success: true, feature });
    }
    return new Response('Not Found', { status: 404 });
  }
  webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) { }
  webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) { this.websockets = this.websockets.filter(w => w !== ws); }
  private broadcast(msg: string) { for (const ws of this.websockets) { if (ws.readyState === 1) ws.send(msg); } }
}
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    const id = env.FEATUREROOM_DO.idFromName(url.pathname);
    const stub = env.FEATUREROOM_DO.get(id);
    return stub.fetch(request);
  }
}