require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;
if (!token) {
  console.error('BOT_TOKEN is not set');
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });

const handleStart = require('./commands/start');
const handlePackages = require('./commands/packages');
const handleOrder = require('./commands/order');
const handleBalance = require('./commands/balance');
const handleOrders = require('./commands/orders');
const handleHelp = require('./commands/help');

bot.onText(/\/start/, (msg) => handleStart(bot, msg));
bot.onText(/\/packages/, (msg) => handlePackages(bot, msg));
bot.onText(/\/order/, (msg) => handleOrder(bot, msg));
bot.onText(/\/balance/, (msg) => handleBalance(bot, msg));
bot.onText(/\/orders/, (msg) => handleOrders(bot, msg));
bot.onText(/\/help/, (msg) => handleHelp(bot, msg));
bot.onText(/\/support/, (msg) => handleHelp(bot, msg));

bot.on('polling_error', (error) => {
  console.error('Bot polling error:', error.message);
});

bot.on('message', (msg) => {
  if (!msg.text || msg.text.startsWith('/')) return;
  bot.sendMessage(msg.chat.id, '🤖 Use /help to see available commands.');
});

console.log('VEXO Follow Bot is running...');

module.exports = bot;
