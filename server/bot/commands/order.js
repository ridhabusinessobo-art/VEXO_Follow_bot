const axios = require('axios');

const orderSessions = {};

const handleOrder = async (bot, msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  orderSessions[userId] = { step: 'service_id', chatId };

  await bot.sendMessage(
    chatId,
    `🛒 *تقديم طلب جديد | Place a New Order*\n\nأدخل *رقم الخدمة* من قائمة الباقات.\nPlease enter the *Service ID* from our package list.\n\nاستخدم /packages لاستعراض الخدمات | Use /packages to browse services.`,
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
      bot.sendMessage(
        chatId,
        '🔗 أدخل *الرابط* (مثال: رابط حساب إنستغرام أو المنشور):\nEnter the *link* (e.g., Instagram profile URL, post URL):',
        { parse_mode: 'Markdown' }
      );
    } else if (session.step === 'link') {
      session.link = response.text.trim();
      session.step = 'quantity';
      bot.sendMessage(
        chatId,
        '🔢 أدخل *الكمية* المطلوبة:\nEnter the *quantity* you want to order:',
        { parse_mode: 'Markdown' }
      );
    } else if (session.step === 'quantity') {
      const qty = parseInt(response.text.trim());
      if (isNaN(qty) || qty < 1) {
        return bot.sendMessage(
          chatId,
          '❌ كمية غير صالحة. أدخل رقماً صحيحاً.\nInvalid quantity. Please enter a valid number.'
        );
      }
      session.quantity = qty;
      session.step = 'confirm';

      const confirmMsg = `
📋 *ملخص الطلب | Order Summary:*
━━━━━━━━━━━━━━━
🆔 رقم الخدمة | Service ID: \`${session.serviceId}\`
🔗 الرابط | Link: ${session.link}
🔢 الكمية | Quantity: ${session.quantity}
━━━━━━━━━━━━━━━

اكتب *نعم* للتأكيد أو *لا* للإلغاء.
Reply *YES* to confirm or *NO* to cancel.
      `;
      bot.sendMessage(chatId, confirmMsg, { parse_mode: 'Markdown' });
    } else if (session.step === 'confirm') {
      const answer = response.text.toUpperCase();
      if (answer === 'YES' || answer === 'نعم') {
        try {
          await bot.sendMessage(chatId, '⏳ جارٍ تنفيذ طلبك... | Processing your order...');
          const apiResponse = await axios.post(
            process.env.SMM_API_URL,
            new URLSearchParams({
              key: process.env.SMM_API_KEY,
              action: 'add',
              service: session.serviceId,
              link: session.link,
              quantity: session.quantity,
            }).toString(),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
          );

          if (apiResponse.data.order) {
            const keyboard = {
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '📋 تتبع الطلب | Track Order', callback_data: 'orders' },
                    { text: '🛒 طلب جديد | New Order', callback_data: 'order' },
                  ],
                ],
              },
            };
            bot.sendMessage(
              chatId,
              `✅ *تم تقديم الطلب بنجاح! | Order Placed Successfully!*\n\n🆔 رقم الطلب | Order ID: \`${apiResponse.data.order}\`\n\nاستخدم /orders لتتبع طلبك.\nUse /orders to track your order status.`,
              { parse_mode: 'Markdown', ...keyboard }
            );
          } else {
            bot.sendMessage(
              chatId,
              `❌ فشل الطلب | Order failed: ${apiResponse.data.error || 'Unknown error'}`
            );
          }
        } catch (err) {
          bot.sendMessage(
            chatId,
            '❌ فشل تقديم الطلب. يرجى المحاولة لاحقاً.\nFailed to place order. Please try again.'
          );
        }
      } else {
        bot.sendMessage(chatId, '❌ تم إلغاء الطلب. | Order cancelled.');
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
      bot.sendMessage(
        chatId,
        '⏰ انتهت مهلة الجلسة. استخدم /order للبدء من جديد.\nOrder session timed out. Use /order to start again.'
      );
    }
  }, 5 * 60 * 1000);
};

module.exports = handleOrder;
