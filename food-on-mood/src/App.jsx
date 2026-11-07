import { useState } from "react";
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
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
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

const getMockRecommendations = (weather, mood) =>
  foodsData
    .map((f) => ({
      ...f,
      score:
        (f.weather.includes(weather) ? 1 : 0) + (f.mood.includes(mood) ? 1 : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

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

/* Dish Card component with local toggle state */
function FoodCard({ food, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="card">
      <div
        className={`card__media ${
          index % 2 === 0 ? "card__media--tall" : "card__media--short"
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

        {/* Meta info (Time & Difficulty) */}
        {(food.time || food.difficulty) && (
          <div className="card__meta">
            {food.time && (
              <span className="card__time">
                <Icon name="clock" size={14} /> {food.time} min
              </span>
            )}
            {food.difficulty && <span>{food.difficulty}</span>}
          </div>
        )}

        {/* Dropdown Toggle Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
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

        {/* Empty Dropdown Content */}
        {isOpen && (
          <div className="restaurant-dropdown-content">
            <p>No restaurants available yet.</p>
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
  const [cityInput, setCityInput] = useState("Lisbon");
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
    const weatherData = await fetchWeather(
      location.lat,
      location.lon
    );

    setLocationData(location);
    setApiWeather(weatherData);
    setWeather(getWeatherCategory(weatherData.weathercode));
    // Automatically select the closest weather button
    const weatherCategory = getWeatherCategory(
      weatherData.weathercode
    );

    setWeather(weatherCategory);

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
      setFoodResults(getMockRecommendations(weather, mood));
    } catch (err) {
      console.error(err);
      setError(
        "We couldn't load your menu. Check your connection and try again.",
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
            <p className="eyebrow">
              <Icon name="sparkle" size={16} /> Food that meets you where you
              are
            </p>
            <h1 className="title">
              Eat for the
              <br />
              <em>moment.</em>
            </h1>
            <p className="lead">
              Pick the weather and your mood. We’ll find food that fits both.
            </p>

            <div className="group">
              <h2 className="group__title">What’s the weather?</h2>
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
              <h2 className="group__title">How are you feeling?</h2>
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

              <span className="cta__sparkle">
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
                  placeholder="Search city · Lisbon"
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

              {/* Display search results */}
              {locationData && apiWeather && (
                <div className="location-weather">
                  <p>{locationData.name}</p>
                  <h3>{apiWeather.temperature}°C</h3>
                  <p>Wind: {apiWeather.windspeed} km/h</p>
                </div>
              )}

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
                      location.lon,
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
          <p>A little inspiration, whatever the weather.</p>
        </div>
      </footer>
    </main>
  );
}
