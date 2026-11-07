import.meta.env.VITE_GEMINI_API_KEY
export async function fetchFoodRecommendations(weather, mood) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  // Instruct Gemini to return a clean, stringified JSON array
  const prompt = `The current weather is ${weather} and I am feeling ${mood}. Recommend 3 to 5 specific food dishes or categories to eat. Respond ONLY with a valid JSON array of strings, like ["Food 1", "Food 2", "Food 3"]. Do not include markdown formatting or backticks.`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch from Gemini API");
    }

    const data = await response.json();
    
    // Extract the raw text from Gemini's response
    const rawText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON string into an actual JavaScript array
    const foodList = JSON.parse(rawText);
    return foodList; 

  } catch (error) {
    console.error("Error fetching food recommendations:", error);
    return ["Error loading foods. Try some comfort food!"]; // Fallback
  }
}