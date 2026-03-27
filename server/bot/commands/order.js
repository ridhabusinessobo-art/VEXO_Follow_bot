const axios = require('axios');

const orderSessions = {};

const handleOrder = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  orderSessions[userId] = { step: 'service_id', chatId };

  await bot.sendMessage(
    chatId,
    `🛒 *Place a New Order*\n\nPlease enter the *Service ID* from our package list.\n\nUse /packages to browse available services and get the Service ID.`,
    { parse_mode: 'Markdown' }
  );

  const listener = async (response) => {
    if (response.from.id !== userId || response.chat.id !== chatId) return;
    if (response.text && response.text.startsWith('/')) return;

    const session = orderSessions[userId];
    if (!session) return;

    if (session.step === 'service_id') {
      session.serviceId = response.text.trim();
      session.step = 'link';
      bot.sendMessage(chatId, '🔗 Now enter the *link* (e.g., Instagram profile URL, post URL):',
        { parse_mode: 'Markdown' });

    } else if (session.step === 'link') {
      session.link = response.text.trim();
      session.step = 'quantity';
      bot.sendMessage(chatId, '🔢 Enter the *quantity* you want to order:',
        { parse_mode: 'Markdown' });

    } else if (session.step === 'quantity') {
      const qty = parseInt(response.text.trim());
      if (isNaN(qty) || qty < 1) {
        return bot.sendMessage(chatId, '❌ Invalid quantity. Please enter a valid number.');
      }
      session.quantity = qty;
      session.step = 'confirm';

      const confirmMsg = `
📋 *Order Summary:*
━━━━━━━━━━━━━━━
🆔 Service ID: \`${session.serviceId}\`
🔗 Link: ${session.link}
🔢 Quantity: ${session.quantity}
━━━━━━━━━━━━━━━

Reply *YES* to confirm or *NO* to cancel.
      `;
      bot.sendMessage(chatId, confirmMsg, { parse_mode: 'Markdown' });

    } else if (session.step === 'confirm') {
      if (response.text.toUpperCase() === 'YES') {
        try {
          await bot.sendMessage(chatId, '⏳ Processing your order...');
          const apiResponse = await axios.post(process.env.SMM_API_URL, {
            key: process.env.SMM_API_KEY,
            action: 'add',
            service: session.serviceId,
            link: session.link,
            quantity: session.quantity,
          });

          if (apiResponse.data.order) {
            bot.sendMessage(
              chatId,
              `✅ *Order Placed Successfully!*\n\n🆔 Order ID: \`${apiResponse.data.order}\`\n\nUse /orders to track your order status.`,
              { parse_mode: 'Markdown' }
            );
          } else {
            bot.sendMessage(chatId, `❌ Order failed: ${apiResponse.data.error || 'Unknown error'}`);
          }
        } catch (err) {
          bot.sendMessage(chatId, '❌ Failed to place order. Please try again.');
        }
      } else {
        bot.sendMessage(chatId, '❌ Order cancelled.');
      }
      delete orderSessions[userId];
      bot.removeListener('message', listener);
    }
  };

  bot.on('message', listener);

  setTimeout(() => {
    if (orderSessions[userId]) {
      delete orderSessions[userId];
      bot.removeListener('message', listener);
      bot.sendMessage(chatId, '⏰ Order session timed out. Use /order to start again.');
    }
  }, 5 * 60 * 1000);
};

module.exports = handleOrder;
