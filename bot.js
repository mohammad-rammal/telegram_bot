const TelegramBot = require("node-telegram-bot-api");
const dotenv = require("dotenv");
const axios = require("axios");
const schedule = require("node-schedule");

dotenv.config();

const bot = new TelegramBot(process.env.BOTKEY, { polling: true });

// Start Command
bot.onText(/\/start/, (msg) => {
  const welcomeMessage = `
🎉 **Welcome to AI Bot!** 🎉

I'm here to make your day brighter and keep you entertained. Choose an option below to get started!
  `;

  const options = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: "🔮 Get a Quote", callback_data: "quote" },
          { text: "😂 Hear a Joke", callback_data: "joke" },
        ],
        [
          { text: "💡 Learn a Fact", callback_data: "fact" },
          { text: "🌦️ Weather Info", callback_data: "weather" },
        ],
        [
          { text: "🧠 Play Trivia", callback_data: "trivia" },
          { text: "📰 Latest News", callback_data: "news" },
        ],
        [
          { text: "💵 Currency Converter", callback_data: "currency" },
          { text: "📊 Create a Poll", callback_data: "poll" },
        ],
        [
          { text: "⏰ Set a Reminder", callback_data: "reminder" },
          { text: "😂 Get a Meme", callback_data: "meme" },
        ],
        [{ text: "🌟 Get Inspired", callback_data: "inspire" }],
      ],
    },
  };

  bot.sendMessage(msg.chat.id, welcomeMessage, options);
});

// Handle callback queries
bot.on("callback_query", async (query) => {
  const { data, message } = query;

  try {
    switch (data) {
      case "quote":
        const quoteResponse = await axios.get("https://api.quotable.io/random");
        const quote = `${quoteResponse.data.content} - ${quoteResponse.data.author}`;
        bot.sendMessage(message.chat.id, quote);
        break;
      case "joke":
        const jokeResponse = await axios.get(
          "https://official-joke-api.appspot.com/random_joke"
        );
        const joke = `${jokeResponse.data.setup}\n\n${jokeResponse.data.punchline}`;
        bot.sendMessage(message.chat.id, joke);
        break;
      case "fact":
        const factResponse = await axios.get(
          "https://uselessfacts.jsph.pl/random.json?language=en"
        );
        const fact = factResponse.data.text;
        bot.sendMessage(message.chat.id, fact);
        break;
      case "weather":
        bot.sendMessage(
          message.chat.id,
          "Please provide the city name using the command: /weather <city>"
        );
        break;
      case "trivia":
        const triviaResponse = await axios.get(
          "https://opentdb.com/api.php?amount=1&type=multiple"
        );
        const triviaData = triviaResponse.data.results[0];
        const question = triviaData.question;
        const correctAnswer = triviaData.correct_answer;
        const options = [...triviaData.incorrect_answers, correctAnswer].sort(
          () => Math.random() - 0.5
        );

        const triviaOptions = options.map((option) => ({
          text: option,
          callback_data: option,
        }));

        bot.sendMessage(message.chat.id, question, {
          reply_markup: {
            inline_keyboard: [triviaOptions],
          },
        });

        bot.on("callback_query", (query) => {
          if (query.message.chat.id === message.chat.id) {
            if (query.data === correctAnswer) {
              bot.sendMessage(message.chat.id, "Correct! 🎉");
            } else {
              bot.sendMessage(
                message.chat.id,
                `Oops! The correct answer was ${correctAnswer}.`
              );
            }
          }
        });
        break;
      case "news":
        const newsResponse = await axios.get(
          `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
        );
        const articles = newsResponse.data.articles.slice(0, 5);
        let newsMessage = "Here are the latest news headlines:\n";
        articles.forEach((article, index) => {
          newsMessage += `\n${index + 1}. ${article.title}\n${article.url}`;
        });
        bot.sendMessage(message.chat.id, newsMessage);
        break;
      case "currency":
        bot.sendMessage(
          message.chat.id,
          "Please provide the amount and currency codes using the command: /currency <amount> <from_currency> <to_currency>"
        );
        break;
      case "poll":
        bot.sendMessage(
          message.chat.id,
          "Please provide a question for the poll using the command: /poll <question>"
        );
        break;
      case "reminder":
        bot.sendMessage(
          message.chat.id,
          "Please provide the number of minutes and reminder message using the command: /reminder <minutes> <message>"
        );
        break;
      case "meme":
        const memeResponse = await axios.get("https://meme-api.com/gimme");
        const memeUrl = memeResponse.data.url;
        bot.sendPhoto(message.chat.id, memeUrl);
        break;
      case "inspire":
        const inspireResponse = await axios.get(
          "https://api.quotable.io/random?tags=inspirational"
        );
        const inspireQuote = `${inspireResponse.data.content} - ${inspireResponse.data.author}`;
        bot.sendMessage(message.chat.id, inspireQuote);
        break;
      default:
        bot.sendMessage(message.chat.id, "Unknown command.");
    }
  } catch (error) {
    bot.sendMessage(
      message.chat.id,
      "Sorry, something went wrong. Please try again later."
    );
  }
});

// Random Quote Command
bot.onText(/\/quote/, async (msg) => {
  try {
    const response = await axios.get("https://api.quotable.io/random");
    const quote = `${response.data.content} - ${response.data.author}`;
    bot.sendMessage(msg.chat.id, quote);
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, I couldn't fetch a quote at the moment."
    );
  }
});

// Joke Command
bot.onText(/\/joke/, async (msg) => {
  try {
    const response = await axios.get(
      "https://official-joke-api.appspot.com/random_joke"
    );
    const joke = `${response.data.setup}\n\n${response.data.punchline}`;
    bot.sendMessage(msg.chat.id, joke);
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, I couldn't fetch a joke at the moment."
    );
  }
});

// Fun Fact Command
bot.onText(/\/fact/, async (msg) => {
  try {
    const response = await axios.get(
      "https://uselessfacts.jsph.pl/random.json?language=en"
    );
    const fact = response.data.text;
    bot.sendMessage(msg.chat.id, fact);
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, I couldn't fetch a fact at the moment."
    );
  }
});

// Weather Command
bot.onText(/\/weather (.+)/, async (msg, match) => {
  const city = match[1];
  const apiKey = process.env.OPENWEATHERMAP_KEY;
  const url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=${apiKey}&contentType=json`;

  try {
    const response = await axios.get(url);
    const weather = response.data.currentConditions;
    const weatherMessage = `Weather in ${city}:\nTemperature: ${weather.temp}°C\nDescription: ${weather.conditions}\nHumidity: ${weather.humidity}%\nWind Speed: ${weather.windspeed} km/h`;
    bot.sendMessage(msg.chat.id, weatherMessage);
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      `Sorry, I couldn't fetch the weather for ${city}. Please check the city name and try again.`
    );
  }
});

// Trivia Quiz Command
bot.onText(/\/trivia/, async (msg) => {
  try {
    const response = await axios.get(
      "https://opentdb.com/api.php?amount=1&type=multiple"
    );
    const questionData = response.data.results[0];
    const question = questionData.question;
    const correctAnswer = questionData.correct_answer;
    const options = [...questionData.incorrect_answers, correctAnswer].sort(
      () => Math.random() - 0.5
    );

    const triviaOptions = options.map((option) => ({
      text: option,
      callback_data: option,
    }));

    bot.sendMessage(msg.chat.id, question, {
      reply_markup: {
        inline_keyboard: [triviaOptions],
      },
    });

    bot.once("callback_query", (query) => {
      if (query.message.chat.id === msg.chat.id) {
        if (query.data === correctAnswer) {
          bot.sendMessage(msg.chat.id, "Correct! 🎉");
        } else {
          bot.sendMessage(
            msg.chat.id,
            `Oops! The correct answer was ${correctAnswer}.`
          );
        }
      }
    });
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, I couldn't fetch a trivia question at the moment."
    );
  }
});

// News Command
bot.onText(/\/news/, async (msg) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/top-headlines?country=us&apiKey=${process.env.NEWS_API_KEY}`
    );
    const articles = response.data.articles.slice(0, 5);
    let newsMessage = "Here are the latest news headlines:\n";
    articles.forEach((article, index) => {
      newsMessage += `\n${index + 1}. ${article.title}\n${article.url}`;
    });
    bot.sendMessage(msg.chat.id, newsMessage);
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, I couldn't fetch the latest news at the moment."
    );
  }
});

// Currency Conversion Command
bot.onText(/\/currency (.+) (.+) (.+)/, async (msg, match) => {
  const amount = match[1];
  const fromCurrency = match[2].toUpperCase();
  const toCurrency = match[3].toUpperCase();
  const apiKey = process.env.CURRENCY_API_KEY;
  const url = `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`;

  try {
    const response = await axios.get(url);
    const rate = response.data.rates[toCurrency];
    const convertedAmount = (amount * rate).toFixed(2);
    bot.sendMessage(
      msg.chat.id,
      `${amount} ${fromCurrency} = ${convertedAmount} ${toCurrency}`
    );
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, I couldn't convert the currency at the moment."
    );
  }
});

// Poll Command
bot.onText(/\/poll (.+)/, (msg, match) => {
  const question = match[1];
  bot.sendMessage(msg.chat.id, `Creating poll: ${question}`, {
    reply_markup: {
      inline_keyboard: [
        [{ text: "Option 1", callback_data: "option1" }],
        [{ text: "Option 2", callback_data: "option2" }],
        [{ text: "Option 3", callback_data: "option3" }],
        [{ text: "Option 4", callback_data: "option4" }],
      ],
    },
  });
});

// Reminder Command
bot.onText(/\/reminder (\d+) (.+)/, (msg, match) => {
  const minutes = parseInt(match[1], 10);
  const reminderMessage = match[2];

  if (isNaN(minutes)) {
    bot.sendMessage(msg.chat.id, "Please provide a valid number of minutes.");
    return;
  }

  schedule.scheduleJob(Date.now() + minutes * 60 * 1000, () => {
    bot.sendMessage(msg.chat.id, `Reminder: ${reminderMessage}`);
  });

  bot.sendMessage(msg.chat.id, `Reminder set for ${minutes} minutes.`);
});

// Meme Command
bot.onText(/\/meme/, async (msg) => {
  try {
    const response = await axios.get("https://meme-api.com/gimme");
    const memeUrl = response.data.url;
    bot.sendPhoto(msg.chat.id, memeUrl);
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, I couldn't fetch a meme at the moment."
    );
  }
});

// Inspire Command
bot.onText(/\/inspire/, async (msg) => {
  try {
    const response = await axios.get(
      "https://api.quotable.io/random?tags=inspirational"
    );
    const inspireQuote = `${response.data.content} - ${response.data.author}`;
    bot.sendMessage(msg.chat.id, inspireQuote);
  } catch (error) {
    bot.sendMessage(
      msg.chat.id,
      "Sorry, I couldn't fetch an inspirational quote at the moment."
    );
  }
});

bot.on("polling_error", (error) => {
  console.log(`Polling error: ${error.code} - ${error.message}`);
});

console.log("Bot is running...");
