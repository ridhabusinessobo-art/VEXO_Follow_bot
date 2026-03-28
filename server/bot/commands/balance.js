const axios = require('axios');

const handleBalance = async (bot, msg) => {
  const chatId = msg.chat.id;

  try {
    const apiResponse = await axios.post(
      process.env.SMM_API_URL,
      new URLSearchParams({ key: process.env.SMM_API_KEY, action: 'balance' }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const data = apiResponse.data;
    const balanceMsg = `
💰 *رصيد لوحة SMM | SMM Panel Balance*
━━━━━━━━━━━━━━━
💵 الرصيد | Balance: $${parseFloat(data.balance || 0).toFixed(2)}
💱 العملة | Currency: ${data.currency || 'USD'}
━━━━━━━━━━━━━━━

🌐 لشحن رصيدك | Top up your balance:
${process.env.CLIENT_URL || 'http://localhost:3000'}/wallet
    `;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📦 الباقات | Packages', callback_data: 'packages' },
            { text: '🛒 طلب جديد | New Order', callback_data: 'order' },
          ],
          [{ text: '🏠 القائمة الرئيسية | Main Menu', callback_data: 'start' }],
        ],
      },
    };

    bot.sendMessage(chatId, balanceMsg, { parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    console.error('Balance fetch error:', error.message);
    bot.sendMessage(
      chatId,
      '❌ فشل تحميل الرصيد. يرجى المحاولة لاحقاً.\nFailed to fetch balance. Please try again later.'
    );
  }
};

module.exports = handleBalance;
