const axios = require('axios');

const handleBalance = async (bot, msg) => {
  const chatId = msg.chat.id;

  try {
    const apiResponse = await axios.post(process.env.SMM_API_URL, {
      key: process.env.SMM_API_KEY,
      action: 'balance',
    });

    const data = apiResponse.data;
    const balanceMsg = `
💰 *SMM Panel Balance*
━━━━━━━━━━━━━━━
💵 Balance: $${parseFloat(data.balance || 0).toFixed(2)}
💱 Currency: ${data.currency || 'USD'}
━━━━━━━━━━━━━━━

🌐 Top up your balance at:
${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet
    `;
    bot.sendMessage(chatId, balanceMsg, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Balance fetch error:', error.message);
    bot.sendMessage(chatId, '❌ Failed to fetch balance. Please try again later.');
  }
};

module.exports = handleBalance;
