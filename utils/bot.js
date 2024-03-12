const TelegramBot = require("node-telegram-bot-api");

const bot = new TelegramBot(process.env.Bot_Token, {
  polling: true,
});

module.exports.bot = bot;
