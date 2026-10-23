import { describe, it, expect } from 'vitest';
import { featureHealth, fleetHealth, totalConsumers, formatFeature } from './feature';
describe('feature', () => {
  it('featureHealth serving fresh = 100', () => {
    const f = { id: '1', name: 'user_age', type: 'numeric', source: 'db', status: 'serving', version: 1, consumers: 5, stalenessHours: 2 };
    expect(featureHealth(f)).toBe(100);
  });
  it('featureHealth serving stale = 80', () => {
    const f = { id: '2', name: 'user_age', type: 'numeric', source: 'db', status: 'serving', version: 1, consumers: 5, stalenessHours: 48 };
    expect(featureHealth(f)).toBe(80);
  });
  it('featureHealth archived = 0', () => {
    const f = { id: '3', name: 'old_feat', type: 'numeric', source: 'db', status: 'archived', version: 1, consumers: 0 };
    expect(featureHealth(f)).toBe(0);
  });
  it('fleetHealth averages correctly', () => {
    const features = [
      { id: '1', name: 'f1', type: 'numeric', source: 'db', status: 'serving', version: 1, consumers: 5 },
      { id: '2', name: 'f2', type: 'numeric', source: 'db', status: 'archived', version: 1, consumers: 0 }
    ];
    expect(fleetHealth(features)).toBe(50);
  });
  it('totalConsumers sums correctly', () => {
    const features = [
      { id: '1', name: 'f1', type: 'numeric', source: 'db', status: 'serving', version: 1, consumers: 5 },
      { id: '2', name: 'f2', type: 'numeric', source: 'db', status: 'serving', version: 1, consumers: 3 }
    ];
    expect(totalConsumers(features)).toBe(8);
  });
  it('formats correctly', () => {
    const f = { id: '1', name: 'user_age', type: 'numeric', source: 'db', status: 'serving', version: 2, consumers: 10 };
    expect(formatFeature(f)).toBe('user_age [numeric] v2 serving consumers:10');
  });
});