import assert from 'node:assert';
import { test } from 'node:test';
import { resolveLocationDetails } from '../src/domain/geocoding.js';

test('resolveLocationDetails - Abuja, Nigeria coordinates', async () => {
  // Abuja, Nigeria coordinates: Lat 9.0765, Lng 7.3986
  const result = await resolveLocationDetails(9.0765, 7.3986);

  assert.strictEqual(result.timezone, 'Africa/Lagos');
  assert.ok(typeof result.locationName === 'string');
  assert.ok(result.locationName.length > 0);
  assert.ok(result.country.includes('Nigeria') || result.locationName.includes('Nigeria') || result.locationName.includes('Lagos'));
});

test('resolveLocationDetails - London, UK coordinates', async () => {
  // London, UK coordinates: Lat 51.5074, Lng -0.1278
  const result = await resolveLocationDetails(51.5074, -0.1278);

  assert.strictEqual(result.timezone, 'Europe/London');
  assert.ok(typeof result.locationName === 'string');
  assert.ok(result.country.includes('United Kingdom') || result.locationName.includes('London') || result.locationName.includes('Kingdom'));
});

test('resolveLocationDetails - Fallback with invalid API coordinates', async () => {
  // Out of bounds coordinates (e.g. 0, 0 in ocean)
  const result = await resolveLocationDetails(0, 0);

  assert.ok(typeof result.timezone === 'string');
  assert.ok(typeof result.locationName === 'string');
});
