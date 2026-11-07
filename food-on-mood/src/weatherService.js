
// src/weatherService.js

// 1. Resolve Location (GPS or manually entered city)
export async function resolveLocation(cityInput = null) {

  // If the user typed a city name
  if (cityInput && cityInput.trim() !== '') {
    const response = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityInput)}&count=1&format=json`
    );

    if (!response.ok) {
      throw new Error('Failed to connect to geocoding service.');
    }

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      throw new Error(`City "${cityInput}" not found.`);
    }

    const city = data.results[0];

    return {
      lat: city.latitude,
      lon: city.longitude,
      name: `${city.name}, ${city.country || ''}`
    };
  }

  // Otherwise, use browser GPS coordinates
  return new Promise((resolve, reject) => {

    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(

      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          name: 'Current Location (GPS)'
        });
      },

      (error) => {
        let message;

        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = 'Location permission denied. Please allow location access.';
            break;

          case error.POSITION_UNAVAILABLE:
            message = 'Your current location is unavailable. Please try again.';
            break;

          case error.TIMEOUT:
            message = 'Location request timed out. Please try again.';
            break;

          default:
            message = 'An unknown location error occurred.';
        }

        reject(new Error(message));
      },

      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

  }); // <-- Missing closing Promise was here!

}


// 2. Fetch Weather using Coordinates
export async function fetchWeather(latitude, longitude) {

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
  );

  if (!response.ok) {
    throw new Error('Failed to fetch weather data');
  }

  const data = await response.json();

  return data.current_weather;
}