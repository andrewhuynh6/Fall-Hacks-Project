import { useState } from "react";
import "./App.css";
import foodsData from "./foods.json";
import foodImage from "./assets/vietnamese_do_and_dont.jpg"
import heroImage from "./assets/hero.png";


const images = import.meta.glob('./assets/*.{png,jpg,jpeg,webp,avif}', { eager: true, import: 'default' });

// Helper function to find the right image based on the slug
const getFoodImage = (slug) => {
  // Look for a key ending in `/slug.extension`
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

const MOODS = [
  { id: "good", label: "Good", subtitle: "Feeling bright", icon: "smile" },
  { id: "bad", label: "Bad", subtitle: "Need comfort", icon: "frown" },
];

// Dữ liệu mẫu tạm thời (chưa nối backend). Sau này thay bằng fetch("/api/recommend").
const MOCK_FOODS = [
  { name: "Beef Phở", image: "/foods/pho.png", note: "with fresh herbs & lime", time: 40, difficulty: "Medium", weather: ["rainy", "snowy"], mood: ["bad", "good"] },
  { name: "Roasted Tomato Soup", image: "/foods/tomato-soup.jpg", note: "with herb sourdough", time: 25, difficulty: "Easy", weather: ["rainy", "snowy"], mood: ["bad", "good"] },
  { name: "Citrus Harvest Bowl", image: "/foods/citrus-bowl.jpg", note: "with toasted grains", time: 20, difficulty: "Easy", weather: ["sunny"], mood: ["good"] },
  { name: "Wild Mushroom Pasta", image: "/foods/mushroom-pasta.jpg", note: "with thyme & pecorino", time: 35, difficulty: "Medium", weather: ["rainy", "snowy"], mood: ["bad"] },
  { name: "Green Herb Noodles", image: "/foods/herb-noodles.jpg", note: "with chili crisp", time: 20, difficulty: "Easy", weather: ["sunny", "rainy"], mood: ["good"] },
  { name: "Spiced Coconut Curry", image: "/foods/coconut-curry.jpg", note: "with lime & coriander", time: 30, difficulty: "Medium", weather: ["rainy", "snowy"], mood: ["bad", "good"] },
  { name: "Charred Peach Salad", image: "/foods/peach-salad.jpg", note: "with basil & burrata", time: 15, difficulty: "Easy", weather: ["sunny"], mood: ["good", "bad"] },
];

const getMockRecommendations = (weather, mood) =>
  foodsData.map((f) => ({
    ...f,
    score: (f.weather.includes(weather) ? 1 : 0) + (f.mood.includes(mood) ? 1 : 0),
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
  return <img src={src} alt="" className="card__img" onError={() => setFailed(true)} />;
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
        <div className="skeleton skeleton--line" style={{ width: "75%", height: 24 }} />
        <div className="skeleton skeleton--line" style={{ width: "50%", marginTop: 12 }} />
        <div className="skeleton skeleton--line" style={{ width: "100%", height: 40, marginTop: 20 }} />
      </div>
    </div>
  );
}

/* Dish Card component with local toggle state */
function FoodCard({ food, index }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <article className="card">
      <div className={`card__media ${index % 2 === 0 ? "card__media--tall" : "card__media--short"}`}>
        <img
          src={food.image ?? "./assets/vietnamese_do_and_dont.png"}
          alt={food.name}
          className={food.image ? "card__img" : "card__img card__img--crop"}
          style={food.image ? undefined : { objectPosition: IMAGE_POSITIONS[index % IMAGE_POSITIONS.length] }}
        />
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
          onClick={() => setIsOpen(!isOpen)}
          className="restaurant-btn"
        >
          <span>Find nearest restaurant</span>
          <span style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}>
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
  // State chính
  const [weather, setWeather] = useState(null);
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(false);
  const [foodResults, setFoodResults] = useState([]);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const canSubmit = weather && mood && !loading;

  const handleRecommend = async () => {
    if (!canSubmit) return;
    setLoading(true);
    setError("");
    setFoodResults([]);
    setHasSearched(true);

    try {
      await new Promise((r) => setTimeout(r, 900)); // giả lập thời gian chờ API
      setFoodResults(getMockRecommendations(weather, mood));
    } catch (err) {
      console.error(err);
      setError("We couldn't load your menu. Check your connection and try again.");
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
              <Icon name="sparkle" size={16} /> Food that meets you where you are
            </p>
            <h1 className="title">
              Eat for the
              <br />
              <em>moment.</em>
            </h1>
            <p className="lead">Pick the weather and your mood. We’ll find food that fits both.</p>

            <div className="group">
              <h2 className="group__title">What’s the weather?</h2>
              <div className="choices choices--3">
                {WEATHERS.map((item) => (
                  <ChoiceButton key={item.id} option={item} active={weather === item.id} onSelect={setWeather} />
                ))}
              </div>
            </div>

            <div className="group">
              <h2 className="group__title">How are you feeling?</h2>
              <div className="choices choices--2">
                {MOODS.map((item) => (
                  <ChoiceButton key={item.id} option={item} active={mood === item.id} onSelect={setMood} />
                ))}
              </div>
            </div>

            <button type="button" className="cta" onClick={handleRecommend} disabled={!canSubmit}>
              {loading ? "Finding food…" : "Suggest food"}
            </button>
          </div>

          <div className="hero__image">
            <img
              src={foodImage}
              alt="A seasonal table of soup, grain bowl, pasta and herb noodles"
              className="hero__img-background"
            />

            {/* Search Overlay Widget */}
            <div className="search-widget">
              <div className="search-widget__row">
                <Icon name="search" size={18} />
                <input
                  type="text"
                  placeholder="Search city · Lisbon"
                  className="search-widget__input"
                />
                <button type="button" className="search-widget__btn">
                  Go
                </button>
              </div>

              <button type="button" className="search-widget__location">
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
                {selectedWeather.label} weather, {selectedMood.label.toLowerCase()} mood.
              </p>
            )}

            {error && <p className="error">{error}</p>}

            <div className="grid">
              {loading && Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} index={i} />)}

              {!loading &&
                foodResults.map((food, index) => (
                  <article key={food.id ?? food.name ?? index} className="card">
                    <div className={`card__media ${index % 2 === 0 ? "card__media--tall" : "card__media--short"}`}>
                      <FoodImage src={getFoodImage(food.slug)} alt={food.name} />
                      {index === 0 && <span className="badge">Best match</span>}
                    </div>
                    <div className="card__body">
                      <h3 className="card__name">{food.name}</h3>
                      {(food.note ?? food.description) && (
                        <p className="card__note">{food.note ?? food.description}</p>
                      )}
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
                    </div>
                  </article>
                ))}
            </div>

            {!loading && !error && foodResults.length === 0 && (
              <p className="empty">No matches for this combination yet. Try a different weather or mood.</p>
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