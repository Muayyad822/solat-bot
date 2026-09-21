import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';
import { find as findTimezone } from 'geo-tz';
import { DateTime } from 'luxon';

export interface PrayerSchedule {
  fajr: Date;
  dhuhr: Date;
  asr: Date;
  maghrib: Date;
  isha: Date;
}

export interface CalculatedDaySchedule {
  timezone: string;
  schedule: PrayerSchedule;
}

const MINDFUL_REFLECTIONS: Record<string, string[]> = {
  Fajr: [
    "Take a moment to pause and begin your day with quiet serenity.",
    "Prayer is better than sleep. Welcome the early morning light.",
    "Start your morning with calm devotion and peace.",
    "Breathe deeply in the morning quietness and remember your Lord.",
    "The two rak'ahs of Fajr bring light to the rest of your day."
  ],
  Dhuhr: [
    "Take a moment to pause amidst your busy day.",
    "Step away quietly, refresh your mind, and stand before your Creator.",
    "Success is found in prayer. Find tranquility in your midday break.",
    "Pause your work, clear your thoughts, and reconnect with peace.",
    "Midday is a moment to refresh your soul and renew your energy."
  ],
  Asr: [
    "Take a moment to pause as the afternoon wanes.",
    "A peaceful moment to reflect and renew your intentions.",
    "Preserve your inner serenity with gentle devotion.",
    "Guard your late afternoon prayer and feel quiet inner strength.",
    "Let the busyness of the afternoon fade into calm worship."
  ],
  Maghrib: [
    "As the sun sets, take a moment to pause and give gratitude.",
    "End your daily work with quiet worship and peace.",
    "The supplication at sunset brings calm to the soul.",
    "Reflect on the blessings of the day as twilight arrives.",
    "Turn towards gratitude and peace as nightfall approaches."
  ],
  Isha: [
    "Take a moment to pause and close your day in peace.",
    "Night prayer brings tranquility to the mind and body.",
    "Rest gently after standing before your Lord.",
    "Unwind from the day's events in quiet, serene reflection.",
    "End your evening with peaceful devotion before resting."
  ]
};

export function getRandomReflection(prayerName: string): string {
  const reflections = MINDFUL_REFLECTIONS[prayerName] || ["Take a moment to pause."];
  const randomIndex = Math.floor(Math.random() * reflections.length);
  return reflections[randomIndex];
}

export function calculateDailyPrayers(
  lat: number,
  lng: number,
  date: Date = new Date(),
  methodName: keyof typeof CalculationMethod = 'MuslimWorldLeague'
): CalculatedDaySchedule {
  const coordinates = new Coordinates(lat, lng);
  
  // Detect timezone from lat/lng coordinates
  const timezones = findTimezone(lat, lng);
  const timezone = timezones[0] || 'UTC';

  // Retrieve calculation method parameters
  const methodFn = CalculationMethod[methodName] || CalculationMethod.MuslimWorldLeague;
  const params = methodFn();

  // Compute prayer times
  const prayerTimes = new PrayerTimes(coordinates, date, params);

  return {
    timezone,
    schedule: {
      fajr: prayerTimes.fajr,
      dhuhr: prayerTimes.dhuhr,
      asr: prayerTimes.asr,
      maghrib: prayerTimes.maghrib,
      isha: prayerTimes.isha,
    },
  };
}

export function formatPrayerTime(date: Date, timezone: string): string {
  return DateTime.fromJSDate(date).setZone(timezone).toFormat('h:mm a');
}
