const axios = require('axios');

const handlePackages = async (bot, msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(
      chatId,
      '⏳ جارٍ تحميل الباقات المتاحة...\nFetching available packages...'
    );

    const response = await axios.post(
      process.env.SMM_API_URL,
      new URLSearchParams({ key: process.env.SMM_API_KEY, action: 'services' }).toString(),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const services = response.data;
    if (!Array.isArray(services) || services.length === 0) {
      return bot.sendMessage(
        chatId,
        '❌ لا توجد باقات متاحة حالياً. حاول مرة أخرى لاحقاً.\nNo packages available at the moment. Try again later.'
      );
    }

    // Group by category
    const categories = {};
    for (const s of services.slice(0, 50)) {
      const cat = s.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(s);
    }

    const categoryNames = Object.keys(categories).slice(0, 10);
    let message = '📦 *الباقات المتاحة | Available Packages:*\n\n';

    for (const cat of categoryNames) {
      message += `📌 *${cat}*\n`;
      for (const svc of categories[cat].slice(0, 3)) {
        message += `  • ${svc.name}\n`;
        message += `    💵 السعر | Rate: $${parseFloat(svc.rate).toFixed(4)}/1000\n`;
        message += `    📊 الحد الأدنى | Min: ${svc.min} | الحد الأقصى | Max: ${svc.max}\n`;
        message += `    🆔 رقم الخدمة | Service ID: \`${svc.service}\`\n`;
      }
      message += '\n';
    }

    message += '💡 استخدم /order لتقديم طلب! | Use /order to place an order!\n';
    message += `🌐 ${process.env.CLIENT_URL || 'http://localhost:3000'}`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🛒 اطلب الآن | Order Now', callback_data: 'order' },
            { text: '💰 رصيدي | Balance', callback_data: 'balance' },
          ],
          [{ text: '🏠 القائمة الرئيسية | Main Menu', callback_data: 'start' }],
        ],
      },
    };

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown', ...keyboard });
  } catch (error) {
    console.error('Packages fetch error:', error.message);
    bot.sendMessage(
      chatId,
      '❌ فشل تحميل الباقات. يرجى المحاولة لاحقاً.\nFailed to fetch packages. Please try again later.'
    );
  }
};

module.exports = handlePackages;
