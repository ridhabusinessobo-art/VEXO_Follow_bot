const handleHelp = (bot, msg) => {
  const chatId = msg.chat.id;
  const adminId = process.env.ADMIN_TELEGRAM_ID;

  const helpMessage = `
❓ *VEXO Follow Bot - Help & Support*
━━━━━━━━━━━━━━━━━━━━━

📌 *Available Commands:*
/start — Welcome message & main menu
/packages — Browse SMM packages
/order — Place a new order
/orders — Check order status
/balance — Check panel balance
/help — Show this help message
/support — Contact support

━━━━━━━━━━━━━━━━━━━━━

💡 *How to Order:*
1️⃣ Browse packages with /packages
2️⃣ Note the Service ID you want
3️⃣ Use /order and follow the steps
4️⃣ Track your order with /orders

━━━━━━━━━━━━━━━━━━━━━

🌐 *Web Panel:* ${process.env.CLIENT_URL || 'http://localhost:3000'}

📞 *Support:* Contact admin on Telegram
👤 *Admin ID:* ${adminId ? `[Contact Admin](tg://user?id=${adminId})` : 'N/A'}

━━━━━━━━━━━━━━━━━━━━━
💎 *VEXO Follow Bot* — Premium SMM Services
  `;

  bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
  });
};

module.exports = handleHelp;
