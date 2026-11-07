import { useState, useEffect } from 'react'
import './App.css'
import { fetchFoodRecommendations } from './geminiServices'

function App() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // NEw States for the Flow
  const [mood, setMood] = useState(null)
  const [foods, setFoods] = useState([])
  const [findingFood, setFindingFood] = useState(false)
  // Function to call the Open-Meteo API
  const fetchWeather = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`
      )
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data')
      }

      const data = await response.json()
      setWeather(data.current_weather)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Automatically request user location and fetch weather when the page loads
  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        fetchWeather(latitude, longitude)
      },
      (err) => {
        setError('Unable to retrieve your location. Please allow location access.')
        setLoading(false)
      }
    )
  }, [])

  // Trigger Gemini API when mood is selected
  const handleMoodSelect = async (selectedMood) => {
    setMood(selectedMood)
    setFindingFood(true)
    
    // Pass the temperature to Gemini
    const weatherString = weather ? `${weather.temperature}°C` : "mild"
    const results = await fetchFoodRecommendations(weatherString, selectedMood)
    
    setFoods(results)
    setFindingFood(false)
  }
return (
 <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
  <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-center">
    <h1 className="text-2xl font-bold mb-4 text-emerald-400">Weather & Food Finder</h1>
 
    {loading && <p className="text-slate-400 animate-pulse">Detecting location & fetching weather...</p>}
    {error && <p className="text-red-400 text-sm bg-red-950/50 p-3 rounded-lg border border-red-800">{error}</p>}

    {weather && !mood && !loading && (
      <div className="space-y-4 mt-6">
        <p className="text-lg">It's {weather.temperature}°C outside. How are you feeling?</p>
        <div className="flex gap-4 justify-center mt-4">
          <button 
            onClick={() => handleMoodSelect('Happy')}
            className="bg-emerald-500 hover:bg-emerald-600 px-6 py-2 rounded-lg font-bold transition">
            Good Mood
          </button>
          <button 
            onClick={() => handleMoodSelect('Sad')}
            className="bg-indigo-500 hover:bg-indigo-600 px-6 py-2 rounded-lg font-bold transition">
            Bad Mood
          </button>
        </div>
      </div>
    )}

    {findingFood && (
      <p className="text-emerald-300 animate-pulse mt-6">Finding the perfect food...</p>
    )}

    {foods.length > 0 && !findingFood && (
      <div className="mt-6">
        <h2 className="text-xl font-bold mb-4">You should eat:</h2>
        <div className="flex flex-col gap-3">
          {foods.map((food, index) => (
            <button 
              key={index}
              className="bg-slate-700 hover:bg-slate-600 p-3 rounded-lg border border-slate-600 transition text-left">
              {food}
            </button>
          ))}
        </div>
      </div>
    )}
  </div>
</div>
);
}

export default App