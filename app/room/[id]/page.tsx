"use client";
import { useState, useEffect, useRef } from 'react';
export default function Room({ params }: { params: { id: string } }) {
  const [features, setFeatures] = useState<any[]>([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('numeric');
  const [source, setSource] = useState('');
  const wsRef = useRef<WebSocket | null>(null);
  useEffect(() => {
    const ws = new WebSocket(`wss://featureroom.devdynamo713.com/room/${params.id}/ws`);
    ws.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === 'feature') {
        setFeatures(prev => [...prev, data.data]);
      }
    };
    wsRef.current = ws;
    const poll = setInterval(async () => {
      const res = await fetch(`https://featureroom.devdynamo713.com/room/${params.id}/features`);
      if (res.ok) setFeatures(await res.json());
    }, 3000);
    return () => { ws.close(); clearInterval(poll); };
  }, [params.id]);
  const addFeature = async () => {
    const data = { name, type, source, status: 'draft' };
    await fetch(`https://featureroom.devdynamo713.com/room/${params.id}/feature`, { method: 'POST', body: JSON.stringify(data) });
    setName(''); setSource('');
  };
  const statusColor: Record<string, string> = { draft: '#a1a1aa', registered: '#60a5fa', serving: '#4ade80', deprecated: '#fbbf24', archived: '#f87171' };
  const healthScore = features.length > 0 ? Math.round(features.reduce((s, f) => {
    if (f.status === 'archived') return s;
    if (f.status === 'deprecated') return s + 25;
    if (f.status === 'draft') return s + 50;
    if (f.status === 'registered') return s + 75;
    return s + 100;
  }, 0) / features.length) : 100;
  const totalCons = features.reduce((s, f) => s + f.consumers, 0);
  return (
    <div style={{ padding: 24, fontFamily: 'sans-serif', background: '#0a0a0a', color: '#e5e5e5', minHeight: '100vh' }}>
      <h1>FeatureRoom: {params.id}</h1>
      <div style={{ marginBottom: 16, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div style={{ padding: 16, border: `1px solid ${healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171'}`, borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Fleet Health</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: healthScore >= 80 ? '#4ade80' : healthScore >= 50 ? '#fbbf24' : '#f87171' }}>{healthScore}%</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Total Consumers</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#60a5fa' }}>{totalCons}</div>
        </div>
        <div style={{ padding: 16, border: '1px solid #27272a', borderRadius: 12, background: '#09090b' }}>
          <div style={{ color: '#a1a1aa', fontSize: 13 }}>Features</div>
          <div style={{ fontSize: 24, fontWeight: 'bold', color: '#a78bfa' }}>{features.length}</div>
        </div>
      </div>
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="feature name" className="name-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <select value={type} onChange={(e) => setType(e.target.value)} className="type-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }}>
          <option value="numeric">numeric</option>
          <option value="categorical">categorical</option>
          <option value="text">text</option>
          <option value="embedding">embedding</option>
          <option value="timestamp">timestamp</option>
        </select>
        <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="source" className="source-input" style={{ padding: 8, background: '#111111', border: '1px solid #3f3f46', borderRadius: 6, color: '#fafafa' }} />
        <button className="add-btn" onClick={addFeature} disabled={!name.trim() || !source.trim()} style={{ padding: '8px 16px', background: '#2563eb', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>Register Feature</button>
      </div>
      <div className="feature-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {features.map(f => (
          <div key={f.id} style={{ padding: 16, border: `1px solid ${statusColor[f.status]}`, borderRadius: 12, background: '#09090b' }}>
            <strong style={{ fontSize: 18, color: statusColor[f.status] }}>{f.name}</strong>
            <div style={{ marginTop: 4, color: '#a1a1aa', fontSize: 13 }}>{f.type} | Source: {f.source}</div>
            <div style={{ marginTop: 4, color: '#60a5fa', fontSize: 13 }}>v{f.version} | Consumers: {f.consumers}</div>
            <div style={{ marginTop: 4, fontWeight: 'bold', color: statusColor[f.status], textTransform: 'uppercase' }}>{f.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}