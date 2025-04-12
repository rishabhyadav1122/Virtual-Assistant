// utils/gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const getIntentFromGemini = async (commandText) => {
  try {
    const model =  genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    console.log(commandText)
    const prompt = ` 
You are an AI assistant that extracts structured JSON from user commands.

Supported intents:
- "weather" → Required field: city
- "currency_converter" → Required fields: amount, from (currency), to (currency)
- "chat_gpt" → Default fallback for anything else. Required field: message
- "news" → Required field: country , category , language , max  ; (if not found any of the field use deafult-> country:in , category:general , language:en , max:5)
- "stock_price" → Required field:company
- "find_places" → Required field:place_type , location:{lat:23.3873872 , lon:85.3920235} (Right now give these coordinates as object in location)

Extract the correct intent and the necessary fields.
Respond ONLY in JSON format without extra text.

Examples:

User: "What is Stock Price of zomato"
Output:
{
  "intent":"stock_price",
  "company":"zomato"
}

User: "Find a coffee shop near me"
Output:
{
  "intent":"find_places",
  "place_type": "coffee shop",
  "location": {lat:23.3873872 , lon:85.3920235}
}

User: "Tell me the weather in Delhi"
Output:
{
  "intent": "weather",
  "city": "Delhi"
}

User: "Convert 50 dollars to rupees"
Output:
{
  "intent": "currency_converter",
  "amount": 50,
  "from": "USD",
  "to": "INR"
}

User:"Tell me the top 10  business headlines in india"
Output:
{
  "intent":"news",
  "country":"in",
  "category":"bussiness",
  "language":"en",
  "max":10
}

User: "What's the capital of Japan?"
Output:
{
  "intent": "chat_gpt",
  "message": "What's the capital of Japan?"
}

Now process:
"${commandText}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    const cleanedText = text.replace(/```json|```/g, "").trim();
    console.log(cleanedText)
    const parsed = JSON.parse(cleanedText);
    return parsed;
  } catch (err) {
    console.error("Gemini Error:", err.message);
    return {
      intent: "chat_gpt",
      message: commandText,
    };
  }
};

module.exports = {
  getIntentFromGemini,
};
