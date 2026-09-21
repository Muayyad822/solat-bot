import assert from 'node:assert';
import { test } from 'node:test';
import { calculateDailyPrayers, getRandomReflection, formatPrayerTime } from '../src/domain/prayerTimes.js';
import { checkAndDispatchDueReminders } from '../src/workers/checkDueReminders.js';

test('calculateDailyPrayers - Lagos Coordinates', () => {
  // Lagos, Nigeria: Lat 6.5244, Lng 3.3792
  const lat = 6.5244;
  const lng = 3.3792;
  const date = new Date('2026-09-21T00:00:00Z');

  const result = calculateDailyPrayers(lat, lng, date);

  assert.strictEqual(result.timezone, 'Africa/Lagos');
  assert.ok(result.schedule.fajr instanceof Date);
  assert.ok(result.schedule.dhuhr instanceof Date);
  assert.ok(result.schedule.asr instanceof Date);
  assert.ok(result.schedule.maghrib instanceof Date);
  assert.ok(result.schedule.isha instanceof Date);

  // Fajr should be before Dhuhr
  assert.ok(result.schedule.fajr.getTime() < result.schedule.dhuhr.getTime());
  // Dhuhr should be before Asr
  assert.ok(result.schedule.dhuhr.getTime() < result.schedule.asr.getTime());
});

test('getRandomReflection - Returns valid mindful reflection', () => {
  const reflection = getRandomReflection('Asr');
  assert.ok(typeof reflection === 'string');
  assert.ok(reflection.length > 5);
});

test('formatPrayerTime - Formats correctly in timezone', () => {
  const date = new Date('2026-09-21T12:00:00Z');
  const formatted = formatPrayerTime(date, 'Africa/Lagos');
  assert.strictEqual(typeof formatted, 'string');
  assert.ok(formatted.includes('AM') || formatted.includes('PM'));
});

test('checkAndDispatchDueReminders - Executes without error', async () => {
  const count = await checkAndDispatchDueReminders();
  assert.ok(typeof count === 'number');
});
