export type FeatureStatus = 'draft' | 'registered' | 'serving' | 'deprecated' | 'archived';
export type FeatureType = 'numeric' | 'categorical' | 'text' | 'embedding' | 'timestamp';
export interface Feature { id: string; name: string; type: FeatureType; source: string; status: FeatureStatus; version: number; consumers: number; lastServed?: string; stalenessHours?: number }
export function featureHealth(f: Feature): number {
  if (f.status === 'archived') return 0;
  if (f.status === 'deprecated') return 25;
  if (f.status === 'draft') return 50;
  if (f.status === 'registered') return 75;
  if (f.stalenessHours && f.stalenessHours > 24) return 80;
  return 100;
}
export function fleetHealth(features: Feature[]): number {
  if (features.length === 0) return 100;
  return Math.round(features.reduce((s, f) => s + featureHealth(f), 0) / features.length);
}
export function totalConsumers(features: Feature[]): number {
  return features.reduce((s, f) => s + f.consumers, 0);
}
export function formatFeature(f: Feature): string { return `${f.name} [${f.type}] v${f.version} ${f.status} consumers:${f.consumers}`; }