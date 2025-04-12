require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");
const yahooFinance = require('yahoo-finance2').default;
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const GNEWS_API_KEY = process.env.NEWS_API_KEY 


const handleStockPriceIntent = async ({ company }) => {
    try {
      const result = await yahooFinance.search(company);
      const symbol = result.quotes[0].symbol;
  
      const quote = await yahooFinance.quote(symbol);
      console.log(quote)
      return `${quote.displayName} is trading at ₹${quote.regularMarketPrice}`;
    } catch (err) {
      return `Sorry, couldn't fetch stock data for ${company} , ${err}`;
    }
  };


  const amenityMapper = {
    "coffee shop": "cafe",
    "hospital": "hospital",
    "restaurant": "restaurant",
    "school": "school",
    "atm": "atm",
    "pharmacy": "pharmacy",
    "gym": "gym",
    "bank": "bank"
  };

  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "VirtualAssistantApp (rishabhcryadav@gmail.com)"
        }
      });
  
      const data = await res.json();
      return data.display_name || "Address not found";
    } catch (err) {
      console.error("Reverse geocoding error:", err.message);
      return "Address not found";
    }
  };
  
  const handleFindPlacesIntent = async ({ place_type, location }) => {
    const { lat, lon } = location;
    const amenity = amenityMapper[place_type.toLowerCase()] || place_type.toLowerCase();
  
    const overpassQuery = `
      [out:json];
      node
        [amenity=${amenity}]
        (around:3000,${lat},${lon});
      out body;
    `;
  
    try {
      const res = await fetch("https://overpass-api.de/api/interpreter", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: overpassQuery
      });
  
      const data = await res.json();
      const places = data.elements.slice(0, 5);
  
      if (places.length === 0) {
        return `Sorry, I couldn't find any ${place_type}s nearby.`;
      }
  
      let response = `Here are some nearby ${place_type}s:\n`;
  
      for (let i = 0; i < places.length; i++) {
        const place = places[i];
        const name = place.tags.name || "Unnamed";
        const address = await reverseGeocode(place.lat, place.lon);
  
        response += `${i + 1}. ${name} (${place.tags.amenity}) at ${address}\n`;
      }
  
      return response;
    } catch (err) {
      console.error("Overpass/Nominatim fetch error:", err.message);
      return "Sorry, I ran into an issue trying to find nearby places.";
    }
  };

  

const handleGNewsHeadlines = async ({ 
  category = "general", 
  country = "in", 
  language = "en", 
  max = 5 
}) => {
  try {
    const url = `https://gnews.io/api/v4/top-headlines?category=${category}&country=${country}&lang=${language}&max=${max}&apikey=${GNEWS_API_KEY}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();

    // Debug logging
    console.log("GNews API Response:", {
      totalArticles: data.totalArticles,
      country,
      category
    });

    if (!data.articles || data.articles.length === 0) {
      // Try without category if no results
      const backupUrl = `https://gnews.io/api/v4/top-headlines?country=${country}&lang=${language}&max=${max}&apikey=${GNEWS_API_KEY}`;
      const backupResponse = await fetch(backupUrl);
      const backupData = await backupResponse.json();
      
      if (backupData.articles?.length > 0) {
        const topNews = backupData.articles.slice(0, max).map((a, idx) => 
          `${idx + 1}. ${a.title} (${a.source.name})`
        ).join("\n");
        return `No ${category} news found, but here are general headlines for ${country.toUpperCase()}:\n${topNews}`;
      }
      
      return `Sorry, I couldn't find any ${category} news for ${country.toUpperCase()}. Try a different category or country.`;
    }

    const topNews = data.articles.slice(0, max).map((a, idx) => 
      `${idx + 1}. ${a.title}${a.source?.name ? ` (${a.source.name})` : ''}`
    ).join("\n");

    return `Top ${category} headlines for ${country.toUpperCase()}:\n${topNews}`;
  } catch (err) {
    console.error("GNews API Error:", err.message);
    return `Sorry, I can't fetch news right now. (Error: ${err.message})`;
  }
};

// Available categories for GNews (different from NewsAPI)
const GNEWS_CATEGORIES = [
  "general", "world", "nation", "business", 
  "technology", "entertainment", "sports", 
  "science", "health"
];

// // Test the function
// (async () => {
//   console.log(await getGNewsHeadlines({ 
//     category: "technology", 
//     country: "in",
//     max: 3
//   }));
// })();


const handleWeatherIntent = async ({ city }) => {
  try {
    const apiKey = process.env.OPENWEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();

    return `The weather in ${data.name} is ${data.weather[0].description} with a temperature of ${data.main.temp}°C.`;
  } catch (err) {
    console.error("Weather API Error:", err.message);
    return "Sorry, I couldn't fetch the weather information.";
  }
};

const handleCurrencyConverterIntent = async ({ amount, from, to }) => {
  try {
    const apiKey = process.env.CURRENCY_API_KEY;
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${from}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    const rate = data.conversion_rates[to];

    if (!rate) {
      return "Sorry, I couldn't find conversion data for that currency.";
    }

    const converted = (amount * rate).toFixed(2);
    return `${amount} ${from} is equal to ${converted} ${to}.`;
  } catch (err) {
    console.error("Currency API Error:", err.message);
    return "Sorry, I couldn't convert the currency.";
  }
};


const handleChatGPTIntent = async ({ message }) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // Add strict instructions for concise responses
    const prompt = `
      Respond to the following in a VERY SHORT and CRISP manner (1-2 sentences max).
      Be direct and avoid fluff.
      
      Query: ${message}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const reply = response.text();

    // Enforce brevity in case the model ignores instructions
    return reply.split('\n')[0].substring(0, 120); // Take first line, max 120 chars
  } catch (err) {
    console.error("Gemini Error:", err.message);
    return "Can't respond now."; // Even shorter error message
  }
};


module.exports = {
  handleWeatherIntent,
  handleCurrencyConverterIntent,
  handleChatGPTIntent,
  handleGNewsHeadlines,
  GNEWS_CATEGORIES ,
  handleStockPriceIntent,
  handleFindPlacesIntent
};