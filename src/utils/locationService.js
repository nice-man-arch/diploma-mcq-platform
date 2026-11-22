// src/utils/locationService.js

/**
 * Detects the student's geographic location using:
 * 1. High-accuracy Browser Geolocation (GPS / Wi-Fi triangulation)
 * 2. Reverse geocoding via OpenStreetMap Nominatim
 * 3. Fallback IP Geolocation via ipapi.co / ipwho.is
 */
export async function detectStudentLocation() {
  // Default fallback
  const result = {
    city: 'Unknown City',
    region: 'Unknown Region',
    country: 'India',
    latitude: null,
    longitude: null,
    ip: 'Unknown IP',
    source: 'unknown',
    displayText: 'Detecting location...'
  };

  // Step 1: Try IP-based location first (fast and does not prompt permission dialog)
  try {
    const ipRes = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3500) });
    if (ipRes.ok) {
      const data = await ipRes.json();
      if (data && data.city) {
        result.city = data.city;
        result.region = data.region || data.region_code || '';
        result.country = data.country_name || 'India';
        result.latitude = data.latitude;
        result.longitude = data.longitude;
        result.ip = data.ip;
        result.source = 'ip';
        result.displayText = `${data.city}, ${data.region ? data.region + ', ' : ''}${data.country_name || ''}`.trim();
      }
    }
  } catch (err) {
    // Try secondary IP provider
    try {
      const ipRes2 = await fetch('https://ipwho.is/', { signal: AbortSignal.timeout(3000) });
      if (ipRes2.ok) {
        const data2 = await ipRes2.json();
        if (data2 && data2.success) {
          result.city = data2.city;
          result.region = data2.region || '';
          result.country = data2.country || 'India';
          result.latitude = data2.latitude;
          result.longitude = data2.longitude;
          result.ip = data2.ip;
          result.source = 'ip';
          result.displayText = `${data2.city}, ${data2.region ? data2.region + ', ' : ''}${data2.country}`.trim();
        }
      }
    } catch (e) {
      console.warn('IP geolocation lookup skipped:', e.message);
    }
  }

  // Step 2: Try high-precision browser GPS if available
  if ('geolocation' in navigator) {
    try {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          timeout: 4000,
          maximumAge: 60000,
          enableHighAccuracy: false
        });
      });

      if (position && position.coords) {
        result.latitude = Number(position.coords.latitude.toFixed(5));
        result.longitude = Number(position.coords.longitude.toFixed(5));
        result.source = 'gps';

        // Attempt reverse geocode to get city name
        try {
          const revRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${result.latitude}&lon=${result.longitude}&format=json`,
            { signal: AbortSignal.timeout(3000) }
          );
          if (revRes.ok) {
            const revData = await revRes.json();
            const addr = revData.address || {};
            const city = addr.city || addr.town || addr.village || addr.suburb || addr.county || result.city;
            const state = addr.state || result.region;
            const country = addr.country || result.country;
            if (city && city !== 'Unknown City') {
              result.city = city;
              result.region = state;
              result.country = country;
              result.displayText = `${city}, ${state ? state + ', ' : ''}${country} (GPS Verified)`;
            }
          }
        } catch (e) {
          result.displayText = `${result.city} (${result.latitude.toFixed(2)}°, ${result.longitude.toFixed(2)}°)`;
        }
      }
    } catch (geoErr) {
      // Permission denied or timed out — keep IP result
      console.log('Browser GPS permission not granted or timeout; utilizing IP location.');
    }
  }

  if (result.displayText === 'Detecting location...') {
    result.displayText = result.city !== 'Unknown City' ? `${result.city}, ${result.country}` : 'Local Student Environment';
  }

  return result;
}
