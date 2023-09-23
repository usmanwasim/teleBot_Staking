const TelegramBot = require("node-telegram-bot-api");

const apiToken = "6104050518:AAFZL6wRK-YQZ-7L8eEU3DMESlN6G9azLR4"; //development
// const apiToken = "6645848236:AAFRkRvLUjbNM0qQjKbBY7B73mZFAX4luM4"; //production

const bot = new TelegramBot(apiToken, {
	polling: true,
});

module.exports.bot = bot;
