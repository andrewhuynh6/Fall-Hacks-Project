import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [weather, setWeather] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-xl border border-slate-700 text-center">
        <h1 className="text-2xl font-bold mb-4 text-emerald-400">Weather & Food Finder</h1>
        
        {loading && <p className="text-slate-400 animate-pulse">Detecting location & fetching weather...</p>}
        
        {error && <p className="text-red-400 text-sm bg-red-950/50 p-3 rounded-lg border border-red-800">{error}</p>}

        {weather && !loading && (
          <div className="space-y-3">
            <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
              <p className="text-sm text-slate-300">Current Temperature</p>
              <p className="text-4xl font-extrabold text-white mt-1">{weather.temperature}°C</p>
            </div>
            <div className="bg-slate-700/50 p-4 rounded-xl border border-slate-600">
              <p className="text-sm text-slate-300">Wind Speed</p>
              <p className="text-xl font-bold text-emerald-300 mt-1">{weather.windspeed} km/h</p>
            </div>
            <p className="text-xs text-slate-500 mt-4">API Connected Successfully! Ready for mood & food features.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App