// controllers/commandController.js
const { getIntentFromGemini } = require("../utils/gemini");
const {
  handleWeatherIntent,
  handleCurrencyConverterIntent,
  handleChatGPTIntent,
  handleGNewsHeadlines,
  handleStockPriceIntent,
  handleFindPlacesIntent
} = require("../handlers/intentHandlers");

const handleCommand = async (intentData) => {
  const { intent } = intentData;

  if (intent === "weather") {
    return await handleWeatherIntent(intentData);
  } else if (intent === "currency_converter") {
    return await handleCurrencyConverterIntent(intentData);
  } else if (intent === "news"){
    return await handleGNewsHeadlines(intentData);
  } else if (intent==="stock_price"){
    return await handleStockPriceIntent(intentData)
  }
   else if (intent==="find_places"){
    return await handleFindPlacesIntent(intentData)
  }
    else {
    return await handleChatGPTIntent(intentData);
  }
};

const executeIntent = async (req, res) => {
  try {
    const { commandText } = req.body;

    // Step 1: Get intent and structured info from Gemini
    const intentData = await getIntentFromGemini(commandText);

    // Step 2: Route it based on the intent
    const response = await handleCommand(intentData);

    res.status(200).json({ intent: intentData.intent, data: response });
  } catch (err) {
    console.error("executeIntent error:", err);
    res.status(500).json({ error: "Something went wrong", details: err.message });
  }
};

module.exports = {
  executeIntent,
};
