const TelegramBot = require("node-telegram-bot-api");

// const apiToken = "6104050518:AAFZL6wRK-YQZ-7L8eEU3DMESlN6G9azLR4"; //development
const apiToken = "6633726543:AAHNatJ0T7hS0F3xGE6zuGqJ-iJl0bZC0LM"; //production

const bot = new TelegramBot(apiToken, {
	polling: true,
});

module.exports.bot = bot;
