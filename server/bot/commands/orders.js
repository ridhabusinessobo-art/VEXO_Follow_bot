const axios = require('axios');

const handleOrders = async (bot, msg) => {
  const chatId = msg.chat.id;

  await bot.sendMessage(
    chatId,
    '⏳ أدخل رقم (أرقام) طلبك للتحقق من الحالة (افصل بين الأرقام بفاصلة):\nEnter your Order ID(s) to check status (separate multiple IDs with commas):'
  );

  const listener = async (response) => {
    if (response.from.id !== msg.from.id || response.chat.id !== chatId) return;
    if (response.text && response.text.startsWith('/')) return;

    bot.removeListener('message', listener);

    const orderIds = response.text
      .split(',')
      .map((id) => id.trim())
      .filter(Boolean);
    if (orderIds.length === 0) {
      return bot.sendMessage(
        chatId,
        '❌ لم يتم إدخال أرقام طلبات صالحة.\nNo valid order IDs provided.'
      );
    }

    try {
      await bot.sendMessage(
        chatId,
        '⏳ جارٍ التحقق من حالة الطلب... | Fetching order status...'
      );

      const apiResponse = await axios.post(
        process.env.SMM_API_URL,
        new URLSearchParams({
          key: process.env.SMM_API_KEY,
          action: 'status',
          orders: orderIds.join(','),
        }).toString(),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      );

      const data = apiResponse.data;
      if (data.error) {
        return bot.sendMessage(chatId, `❌ خطأ | Error: ${data.error}`);
      }

      let message = '📋 *حالة الطلبات | Order Status:*\n━━━━━━━━━━━━━━━\n';
      if (orderIds.length === 1) {
        const order = data;
        message += `🆔 الطلب | Order: \`${orderIds[0]}\`\n`;
        message += `📊 الحالة | Status: ${order.status || 'Unknown'}\n`;
        message += `💲 التكلفة | Charge: $${order.charge || '0'}\n`;
        if (order.start_count) message += `📈 العدد الأولي | Start Count: ${order.start_count}\n`;
        if (order.remains) message += `⏳ المتبقي | Remains: ${order.remains}\n`;
      } else {
        for (const id of orderIds) {
          const order = data[id] || {};
          message += `\n🆔 الطلب | Order \`${id}\`:\n`;
          message += `  الحالة | Status: ${order.status || 'Not found'}\n`;
          if (order.remains) message += `  المتبقي | Remains: ${order.remains}\n`;
        }
      }

      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '🛒 طلب جديد | New Order', callback_data: 'order' },
              { text: '📦 الباقات | Packages', callback_data: 'packages' },
            ],
          ],
        },
      };

      bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...keyboard });
    } catch (err) {
      bot.sendMessage(
        chatId,
        '❌ فشل التحقق من حالة الطلب. يرجى المحاولة لاحقاً.\nFailed to fetch order status. Please try again.'
      );
    }
  };

  bot.on('message', listener);

  setTimeout(() => {
    bot.removeListener('message', listener);
  }, 60 * 1000);
};

module.exports = handleOrders;
