const axios = require('axios');

const handlePackages = async (bot, msg) => {
  const chatId = msg.chat.id;

  try {
    await bot.sendMessage(chatId, '⏳ Fetching available packages...');

    const response = await axios.post(process.env.SMM_API_URL, {
      key: process.env.SMM_API_KEY,
      action: 'services',
    });

    const services = response.data;
    if (!Array.isArray(services) || services.length === 0) {
      return bot.sendMessage(chatId, '❌ No packages available at the moment. Try again later.');
    }

    // Group by category
    const categories = {};
    for (const s of services.slice(0, 50)) {
      const cat = s.category || 'General';
      if (!categories[cat]) categories[cat] = [];
      categories[cat].push(s);
    }

    const categoryNames = Object.keys(categories).slice(0, 10);
    let message = '📦 *Available SMM Packages:*\n\n';

    for (const cat of categoryNames) {
      message += `📌 *${cat}*\n`;
      for (const svc of categories[cat].slice(0, 3)) {
        message += `  • ${svc.name}\n`;
        message += `    💵 Rate: $${parseFloat(svc.rate).toFixed(4)}/1000\n`;
        message += `    📊 Min: ${svc.min} | Max: ${svc.max}\n`;
      }
      message += '\n';
    }

    message += '💡 Use /order to place an order!\n';
    message += `🌐 Full list at: ${process.env.CLIENT_URL || 'http://localhost:3000'}`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Packages fetch error:', error.message);
    bot.sendMessage(chatId, '❌ Failed to fetch packages. Please try again later.');
  }
};

module.exports = handlePackages;
