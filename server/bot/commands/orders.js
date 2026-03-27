const axios = require('axios');

const handleOrders = async (bot, msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(chatId, '⏳ Please enter your Order ID(s) to check status (separate multiple IDs with commas):');

  const listener = async (response) => {
    if (response.from.id !== msg.from.id || response.chat.id !== chatId) return;
    if (response.text && response.text.startsWith('/')) return;

    bot.removeListener('message', listener);

    const orderIds = response.text.split(',').map((id) => id.trim()).filter(Boolean);
    if (orderIds.length === 0) {
      return bot.sendMessage(chatId, '❌ No valid order IDs provided.');
    }

    try {
      await bot.sendMessage(chatId, '⏳ Fetching order status...');

      const apiResponse = await axios.post(process.env.SMM_API_URL, {
        key: process.env.SMM_API_KEY,
        action: 'status',
        orders: orderIds.join(','),
      });

      const data = apiResponse.data;
      if (data.error) {
        return bot.sendMessage(chatId, `❌ Error: ${data.error}`);
      }

      let message = '📋 *Order Status:*\n━━━━━━━━━━━━━━━\n';
      if (orderIds.length === 1) {
        const order = data;
        message += `🆔 Order: \`${orderIds[0]}\`\n`;
        message += `📊 Status: ${order.status || 'Unknown'}\n`;
        message += `🔢 Charge: $${order.charge || '0'}\n`;
        if (order.start_count) message += `📈 Start Count: ${order.start_count}\n`;
        if (order.remains) message += `⏳ Remains: ${order.remains}\n`;
      } else {
        for (const id of orderIds) {
          const order = data[id] || {};
          message += `\n🆔 Order \`${id}\`:\n`;
          message += `  Status: ${order.status || 'Not found'}\n`;
          if (order.remains) message += `  Remains: ${order.remains}\n`;
        }
      }

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      bot.sendMessage(chatId, '❌ Failed to fetch order status. Please try again.');
    }
  };

  bot.on('message', listener);

  setTimeout(() => {
    bot.removeListener('message', listener);
  }, 60 * 1000);
};

module.exports = handleOrders;
