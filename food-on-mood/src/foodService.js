import foodsData from './foods.json';

export function getFilteredFoods(currentWeather, currentMood) {
  // Normalize inputs to match your JSON arrays (e.g. 'good' / 'bad')
  const moodKey = currentMood.toLowerCase() === 'happy' || currentMood.toLowerCase() === 'good' ? 'good' : 'bad';
  
  // Map weather selection to your JSON weather tags ('sunny', 'rainy', 'snowy')
  let weatherKey = 'sunny';
  if (typeof currentWeather === 'string') {
    const lower = currentWeather.toLowerCase();
    if (lower.includes('rain')) weatherKey = 'rainy';
    else if (lower.includes('snow')) weatherKey = 'snowy';
  } else if (typeof currentWeather === 'number') {
    if (currentWeather <= 0) weatherKey = 'snowy';
    else if (currentWeather < 15) weatherKey = 'rainy';
  }

  // Score and sort matches based on weather and mood overlap
  const scored = foodsData.map((f) => ({
    ...f,
    score: (f.weather.includes(weatherKey) ? 1 : 0) + (f.mood.includes(moodKey) ? 1 : 0),
  }))
  .sort((a, b) => b.score - a.score);

  return scored.slice(0, 4); // Return top 4 matching food objects
}