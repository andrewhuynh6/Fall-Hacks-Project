import { useState } from "react";
import { setOptions, importLibrary } from "@googlemaps/js-api-loader";
import "./App.css";
import foodsData from "./foods.json";
import foodImage from "./assets/vietnamese_do_and_dont.jpg";
import { resolveLocation, fetchWeather } from "./weatherService";

const images = import.meta.glob("./assets/*.{png,jpg,jpeg,webp,avif}", {
  eager: true,
  import: "default",
});

// Helper function to find the right image based on the slug
const getFoodImage = (slug) => {
  const key = Object.keys(images).find((k) => k.includes(`/${slug}.`));
  return key ? images[key] : null;
};

/* ---------- Icons ---------- */
const ICON_PATHS = {
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  rain: (
    <>
      <path d="M7 15h10a4 4 0 0 0 .6-7.95A6 6 0 0 0 6.15 5.4 4.8 4.8 0 0 0 7 15Z" />
      <path d="M8 19l-1 2M12 19l-1 2M16 19l-1 2" />
    </>
  ),
  snow: <path d="M12 2v20M4.2 7l15.6 10M4.2 17 19.8 7" />,
  smile: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    </>
  ),
  frown: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 16s1.5-2 4-2 4 2 4 2M9 9h.01M15 9h.01" />
    </>
  ),
  bowl: (
    <>
      <path d="M4 11h16c0 5-3.5 8-8 8s-8-3-8-8Z" />
      <path d="M8 7c0-1 1-1.5 1-2.5S8 3 8 2M13 7c0-1 1-1.5 1-2.5S13 3 13 2" />
    </>
  ),
  sparkle: (
    <path d="m12 3 1.2 4.1a5 5 0 0 0 3.7 3.7L21 12l-4.1 1.2a5 5 0 0 0-3.7 3.7L12 21l-1.2-4.1a5 5 0 0 0-3.7-3.7L3 12l4.1-1.2a5 5 0 0 0 3.7-3.7L12 3Z" />
  ),
  arrowDown: <path d="M12 5v14M19 12l-7 7-7-7" />,
  search: (
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  locationPin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  cloud: <path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z" />,
  droplet: (
    <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 15.1 5 17 5 15a7 7 0 0 0 7 7Z" />
  ),
  wind: (
    <path d="M17.7 7.7A2.5 2.5 0 1 1 15 11H3M19.4 17a2.5 2.5 0 1 0-2.4-3H3M12.5 4a2 2 0 1 1-1.8 3H3" />
  ),
};

function Icon({ name, size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

/* ---------- Static options ---------- */
const WEATHERS = [
  { id: "sunny", label: "Sunny", subtitle: "Bright & warm", icon: "sun" },
  { id: "rainy", label: "Rainy", subtitle: "Grey & damp", icon: "rain" },
  { id: "snowy", label: "Snowy", subtitle: "Cold & quiet", icon: "snow" },
];

const getWeatherCategory = (code) => {
  // Snow
  if ([71, 73, 75, 77, 85, 86].includes(code)) {
    return "snowy";
  }

  // Rain, drizzle, showers, thunderstorms
  if (
    [
      51, 53, 55, 56, 57,
      61, 63, 65, 66, 67,
      80, 81, 82, 95, 96, 99,
    ].includes(code)
  ) {
    return "rainy";
  }

  // Clear, partly cloudy, cloudy, foggy
  return "sunny";
};

const MOODS = [
  { id: "good", label: "Good", subtitle: "Feeling bright", icon: "smile" },
  { id: "bad", label: "Bad", subtitle: "Need comfort", icon: "frown" },
];

const getRecommendations = (weather, mood) => {
  // 1. Score and filter out non-matches
  const validMatches = foodsData
    .map((f) => ({
      ...f,
      score: (f.weather.includes(weather) ? 1 : 0) + (f.mood.includes(mood) ? 1 : 0),
    }))
    .filter((f) => f.score > 0);

  // 2. Shuffle the array randomly
  const shuffled = validMatches.sort(() => 0.5 - Math.random());

  // 3. Sort by score (keeps random order within the same score group) and take 4
  return shuffled
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
};

/* ---------- Components ---------- */
function FoodImage({ src }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div className="card__placeholder">
        <Icon name="bowl" size={40} />
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="card__img"
      onError={() => setFailed(true)}
    />
  );
}

function ChoiceButton({ option, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(option.id)}
      aria-pressed={active}
      className={`choice ${active ? "choice--active" : ""}`}
    >
      <Icon name={option.icon} size={22} />
      <span className="choice__label">{option.label}</span>
      <span className="choice__sub">{option.subtitle}</span>
    </button>
  );
}

function SkeletonCard({ index }) {
  const shape = index % 2 === 0 ? "card__media--tall" : "card__media--short";
  return (
    <div aria-hidden="true">
      <div className={`card__media skeleton ${shape}`} />
      <div className="card__body">
        <div
          className="skeleton skeleton--line"
          style={{ width: "75%", height: 24 }}
        />
        <div
          className="skeleton skeleton--line"
          style={{ width: "50%", marginTop: 12 }}
        />
        <div
          className="skeleton skeleton--line"
          style={{ width: "100%", height: 40, marginTop: 20 }}
        />
      </div>
    </div>
  );
}

/* Dish Card component with Google Places API */
function FoodCard({ food, index }) {
  const [isOpen, setIsOpen] = useState(false);
  const [restaurants, setRestaurants] = useState([]);
  const [isLoadingPlaces, setIsLoadingPlaces] = useState(false);
  const [placesError, setPlacesError] = useState("");

  const handleFindRestaurants = async () => {
    const nextOpenState = !isOpen;
    setIsOpen(nextOpenState);

    if (nextOpenState && restaurants.length === 0 && !isLoadingPlaces) {
      setIsLoadingPlaces(true);
      setPlacesError("");

      if (!navigator.geolocation) {
        setPlacesError("Geolocation is not supported by your browser.");
        setIsLoadingPlaces(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          try {
            setOptions({
              key: "AIzaSyDn1J7VWqclntfoED2oRrUGf3EVNkq_8LI", // Your Key
              v: "weekly",
            });

            const { Place } = await importLibrary("places");

            const request = {
              textQuery: `${food.name} near me`,
              fields: ["displayName", "formattedAddress", "location"],
              locationBias: {
                center: userLocation,
                radius: 5000,
              },
              maxResultCount: 3,
            };

            const { places } = await Place.searchByText(request);

            if (places && places.length > 0) {
              const formatted = places.map((place) => ({
                place_id: place.id,
                name: place.displayName,
                vicinity: place.formattedAddress,
              }));
              setRestaurants(formatted);
            } else {
              setRestaurants([]);
            }

            setIsLoadingPlaces(false);
          } catch (error) {
            console.error("Places Error:", error);
            setPlacesError(`Google Error: ${error.message || "Unknown error"}`);
            setIsLoadingPlaces(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          setPlacesError("Please allow location access to find restaurants.");
          setIsLoadingPlaces(false);
        },
        { timeout: 10000 }
      );
    }
  };

  return (
    <article className="card">
      <div
        className={`card__media ${index % 2 === 0 ? "card__media--tall" : "card__media--short"
          }`}
      >
        <FoodImage src={getFoodImage(food.slug)} />
        {index === 0 && <span className="badge">Best match</span>}
      </div>

      <div className="card__body">
        <h3 className="card__name">{food.name}</h3>
        {(food.note ?? food.description) && (
          <p className="card__note">{food.note ?? food.description}</p>
        )}

        {/* Dropdown Toggle Button */}
        <button
          type="button"
          onClick={handleFindRestaurants}
          className="restaurant-btn"
        >
          <span>Find nearest restaurant</span>
          <span
            style={{
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.2s ease",
            }}
          >
            <Icon name="arrowDown" size={16} />
          </span>
        </button>

        {/* Dropdown Content */}
        {isOpen && (
          <div className="restaurant-dropdown-content">
            {isLoadingPlaces ? (
              <p>Searching nearby...</p>
            ) : placesError ? (
              <p style={{ color: "var(--error)" }}>{placesError}</p>
            ) : restaurants.length > 0 ? (
              <ul style={{ listStyle: "none", padding: 0, margin: 0, textAlign: "left" }}>
                {restaurants.map((place) => (
                  <li
                    key={place.place_id}
                    style={{
                      marginBottom: "10px",
                      borderBottom: "1px solid #e5e5e5",
                      paddingBottom: "6px",
                    }}
                  >
                    <strong style={{ color: "#292524" }}>{place.name}</strong>
                    <br />
                    <small style={{ color: "#78716c" }}>{place.vicinity}</small>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No restaurants found nearby.</p>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function App() {
  const [weather, setWeather] = useState(null);
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodResults, setFoodResults] = useState([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  // City search and API weather data
  const [cityInput, setCityInput] = useState("");
  const [locationData, setLocationData] = useState(null);
  const [apiWeather, setApiWeather] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Search weather by city name
  const handleLocationSearch = async (e) => {
    e.preventDefault();

    if (!cityInput.trim()) {
      setLocationError("Please enter a city name.");
      return;
    }

    try {
      setLocationLoading(true);
      setLocationError("");

      // Get city coordinates
      const location = await resolveLocation(cityInput);

      // Get weather using coordinates
      const weatherData = await fetchWeather(location.lat, location.lon);

      setLocationData(location);
      setApiWeather(weatherData);
      setWeather(getWeatherCategory(weatherData.weathercode));
    } catch (err) {
      setLocationError(err.message);
      setLocationData(null);
      setApiWeather(null);
    } finally {
      setLocationLoading(false);
    }
  };

  const canSubmit = weather && mood && !loading;

  const handleRecommend = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setFoodResults([]);
    setHasSearched(true);

    try {
      await new Promise((r) => setTimeout(r, 900));
      setFoodResults(getRecommendations(weather, mood));
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't load your menu. Check your connection and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedWeather = WEATHERS.find((w) => w.id === weather);
  const selectedMood = MOODS.find((m) => m.id === mood);

  return (
    <main className="page">
      <header className="header">
        <div className="container header__inner">
          <a href="#" className="logo" aria-label="Food on Mood home">
            <span className="logo__badge">
              <Icon name="bowl" size={18} />
            </span>
            <span className="logo__text">
              Food on <em>Mood</em>
            </span>
          </a>
        </div>
      </header>

      <section className="container hero">
        <div className="hero__grid">
          <div className="hero__copy">

            <h1 className="title">
              Eat for the
              <br />
              <em>moment.</em>
            </h1>
            <p className="lead">
              Choose the weather and your current mood, then we will help you select the best dishes :)
            </p>

            <div className="group">
              <h2 className="group__title">What’s the weather today?</h2>
              <div className="choices choices--3">
                {WEATHERS.map((item) => (
                  <ChoiceButton
                    key={item.id}
                    option={item}
                    active={weather === item.id}
                    onSelect={setWeather}
                  />
                ))}
              </div>
            </div>

            <div className="group">
              <h2 className="group__title">What's the vibe? :') </h2>
              <div className="choices choices--2">
                {MOODS.map((item) => (
                  <ChoiceButton
                    key={item.id}
                    option={item}
                    active={mood === item.id}
                    onSelect={setMood}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              className={`cta ${loading ? "cta--loading" : ""}`}
              onClick={handleRecommend}
              disabled={!canSubmit}
            >
              <span>{loading ? "Finding food…" : "Suggest food"}</span>

              <span className="cta__sparkle">q
                <Icon name="sparkle" size={20} />
              </span>
            </button>
          </div>

          <div className="hero__image">
            <img
              src={foodImage}
              alt="A seasonal table of soup, grain bowl, pasta and herb noodles"
            />

            {/* Search Overlay Widget */}
            <div className="search-widget">
              <form
                className="search-widget__row"
                onSubmit={handleLocationSearch}
              >
                <Icon name="search" size={18} />

                <input
                  type="text"
                  placeholder="Search city · Vancouver"
                  className="search-widget__input"
                  value={cityInput}
                  onChange={(e) => setCityInput(e.target.value)}
                />

                <button
                  type="submit"
                  className="search-widget__btn"
                  disabled={locationLoading}
                >
                  {locationLoading ? "..." : "Go"}
                </button>
              </form>

              {locationError && <p className="error">{locationError}</p>}

              <button
                type="button"
                className="search-widget__location"
                onClick={async () => {
                  try {
                    setLocationLoading(true);
                    setLocationError("");

                    const location = await resolveLocation();

                    setLocationData(location);

                    const weatherData = await fetchWeather(
                      location.lat,
                      location.lon
                    );

                    setApiWeather(weatherData);
                    setWeather(getWeatherCategory(weatherData.weathercode));
                  } catch (err) {
                    setLocationError(err.message);
                  } finally {
                    setLocationLoading(false);
                  }
                }}
                disabled={locationLoading}
              >
                <Icon name="locationPin" size={16} />
                <span>Use my current location</span>
              </button>
            </div>

            {/* Bottom Weather Display Widget */}
            {locationData && apiWeather && (
              <div className="weather-overlay">
                <div className="weather-overlay__location">
                  <Icon name="locationPin" size={14} />
                  <span>{locationData.name || cityInput}</span>
                </div>

                <div className="weather-overlay__main">
                  <Icon name="cloud" size={40} />
                  <span className="weather-overlay__temp">
                    {Math.round(apiWeather.temperature ?? apiWeather.temp ?? 18)}°
                  </span>
                </div>

                <div className="weather-overlay__meta">
                  <div className="weather-overlay__condition">
                    {apiWeather.condition || "Partly cloudy"}
                    {` · feels like ${Math.round(
                      apiWeather.apparentTemperature ??
                      apiWeather.feelsLike ??
                      apiWeather.temperature ??
                      17
                    )}°`}
                  </div>
                  <div className="weather-overlay__stats">
                    <span>
                      <Icon name="droplet" size={14} />{" "}
                      {apiWeather.humidity ?? 64}%
                    </span>
                    <span>
                      <Icon name="wind" size={14} />{" "}
                      {apiWeather.windspeed ?? apiWeather.windSpeed ?? 7} km/h
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {(hasSearched || error) && (
        <section className="results" aria-live="polite">
          <div className="container results__inner">
            <h2 className="results__title">Your menu</h2>
            {selectedWeather && selectedMood && (
              <p className="results__sub">
                {selectedWeather.label} weather,{" "}
                {selectedMood.label.toLowerCase()} mood.
              </p>
            )}

            {error && <p className="error">{error}</p>}

            <div className="grid">
              {loading &&
                Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonCard key={i} index={i} />
                ))}

              {!loading &&
                foodResults.map((food, index) => (
                  <FoodCard
                    key={food.id ?? food.name ?? index}
                    food={food}
                    index={index}
                  />
                ))}
            </div>

            {!loading && !error && foodResults.length === 0 && (
              <p className="empty">
                No matches for this combination yet. Try a different weather or
                mood.
              </p>
            )}
          </div>
        </section>
      )}

      <footer className="footer">
        <div className="container footer__inner">
          <span className="logo__text">
            Food on <em>Mood</em>
          </span>
        </div>
      </footer>
    </main>
  );
}