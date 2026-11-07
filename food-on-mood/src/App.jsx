import { useState } from "react";
import "./App.css";

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

const IMAGE_POSITIONS = ["20% 13%", "66% 10%", "25% 88%", "75% 85%"];

const MOCK_FOODS = [
  { 
    id: 1,
    name: "Roasted Tomato Soup", 
    note: "Rich and creamy soup paired with garlic herb sourdough toast.", 
    weather: ["rainy", "snowy"], 
    mood: ["bad", "good"] 
  },
  { 
    id: 2,
    name: "Citrus Harvest Bowl", 
    note: "Fresh grapefruit, avocado, and toasted grains with citrus dressing.", 
    weather: ["sunny"], 
    mood: ["good"] 
  },
  { 
    id: 3,
    name: "Wild Mushroom Pasta", 
    note: "Sautéed wild mushrooms tossed with fresh thyme and pecorino cheese.", 
    weather: ["rainy", "snowy"], 
    mood: ["bad"] 
  },
  { 
    id: 4,
    name: "Green Herb Noodles", 
    note: "Chewy noodles tossed in fresh aromatic herbs and crispy chili oil.", 
    weather: ["sunny", "rainy"], 
    mood: ["good"] 
  },
  { 
    id: 5,
    name: "Spiced Coconut Curry", 
    note: "Warm coconut broth infused with lemongrass, lime, and fresh coriander.", 
    weather: ["rainy", "snowy"], 
    mood: ["bad", "good"] 
  },
  { 
    id: 6,
    name: "Charred Peach Salad", 
    note: "Grilled summer peaches served over creamy burrata and fresh basil.", 
    weather: ["sunny"], 
    mood: ["good", "bad"] 
  },
];

const getMockRecommendations = (weather, mood) =>
  MOCK_FOODS.map((f) => ({
    ...f,
    score: (f.weather.includes(weather) ? 1 : 0) + (f.mood.includes(mood) ? 1 : 0),
  }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);

/* ---------- Components ---------- */
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
          src={food.image ?? "/seasonal-table.png"}
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
      await new Promise((r) => setTimeout(r, 900));
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
            <img src="/seasonal-table.png" alt="A seasonal table of soup, grain bowl, pasta and herb noodles" />
            <div className="hero__shade" />
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
                  <FoodCard key={food.id ?? index} food={food} index={index} />
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