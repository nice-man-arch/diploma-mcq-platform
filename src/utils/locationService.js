// src/utils/locationService.js

/**
 * Silently captures the student's IP address and geographic location
 * in the background using network IP lookup.
 * NOTE: navigator.geolocation is intentionally NOT used to prevent
 * any browser location permission prompt from showing to the student.
 */
export async function detectStudentLocation() {
  const result = {
    city: 'Local Area',
    region: '',
    country: 'India',
    latitude: null,
    longitude: null,
    ip: 'Unknown IP',
    source: 'ip',
    displayText: 'Local Network'
  };

  // Try primary IP provider (ipapi.co)
  try {
    const ipRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data && (data.ip || data.city)) {
        result.ip = data.ip || 'Unknown IP';
        result.city = data.city || 'Unknown City';
        result.region = data.region || data.region_code || '';
        result.country = data.country_name || 'India';
        result.latitude = data.latitude || null;
        result.longitude = data.longitude || null;
        result.displayText = `${result.city}${result.region ? ', ' + result.region : ''} (${result.ip})`;
        return result;
      }
    }
  } catch (e) {
    // Continue to fallback provider
  }

  // Try secondary IP provider (ipwho.is)
  try {
    const ipRes2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(2500) });
    if (ipRes2.ok) {
      const data2 = await ipRes2.json();
      if (data2 && data2.success) {
        result.ip = data2.ip || 'Unknown IP';
        result.city = data2.city || 'Unknown City';
        result.region = data2.region || '';
        result.country = data2.country || 'India';
        result.latitude = data2.latitude || null;
        result.longitude = data2.longitude || null;
        result.displayText = `${result.city}${result.region ? ', ' + result.region : ''} (${result.ip})`;
        return result;
      }
    }
  } catch (e) {
    // Fallback silent
  }

  return result;
}
