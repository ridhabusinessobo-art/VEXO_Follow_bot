const handleStart = (bot, msg) => {
  const chatId = msg.chat.id;
  const firstName = msg.from.first_name || 'User';

  const welcomeMessage = `
🚀 *Welcome to VEXO Follow Bot!* 🚀

Hello, ${firstName}! 👋

I'm your personal SMM (Social Media Marketing) assistant. I can help you grow your social media presence with real followers, likes, and engagement.

📌 *Available Commands:*
/packages — Browse available SMM packages
/order — Place a new order
/orders — View your recent orders
/balance — Check your wallet balance
/help — Get help & support

💰 *Get started* by checking our /packages and place your first order!

🌟 *VEXO Follow Bot* — Your growth partner!
`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📦 Browse Packages', callback_data: 'packages' },
          { text: '📋 My Orders', callback_data: 'orders' },
        ],
        [
          { text: '💰 My Balance', callback_data: 'balance' },
          { text: '❓ Help', callback_data: 'help' },
        ],
      ],
    },
  };

  bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown', ...keyboard });
};

module.exports = handleStart;
