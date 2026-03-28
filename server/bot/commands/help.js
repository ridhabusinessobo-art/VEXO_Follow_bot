const handleHelp = (bot, msg) => {
  const chatId = msg.chat.id;
  const adminId = process.env.ADMIN_TELEGRAM_ID;

  const helpMessage = `
❓ *VEXO Follow Bot — المساعدة والدعم | Help & Support*
━━━━━━━━━━━━━━━━━━━━━

📌 *الأوامر المتاحة | Available Commands:*
/start — 🏠 القائمة الرئيسية | Main menu
/packages — 📦 استعراض الباقات | Browse packages
/order — 🛒 تقديم طلب | Place an order
/orders — 📋 حالة الطلبات | Check order status
/balance — 💰 الرصيد | Check balance
/help — ❓ المساعدة | Show help
/support — 📞 الدعم | Contact support

━━━━━━━━━━━━━━━━━━━━━

💡 *كيفية الطلب | How to Order:*
1️⃣ استعرض الباقات | Browse packages: /packages
2️⃣ احفظ رقم الخدمة | Note the Service ID
3️⃣ قدّم طلبك | Use /order and follow the steps
4️⃣ تتبّع طلبك | Track your order: /orders

━━━━━━━━━━━━━━━━━━━━━

🌐 *لوحة الويب | Web Panel:* ${process.env.CLIENT_URL || 'http://localhost:3000'}

📞 *الدعم | Support:* تواصل مع الإدارة | Contact admin on Telegram
👤 *المسؤول | Admin:* ${adminId ? `[تواصل | Contact](tg://user?id=${adminId})` : 'N/A'}

━━━━━━━━━━━━━━━━━━━━━
💎 *VEXO Follow Bot* — خدمات SMM المميزة | Premium SMM Services
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

  bot.sendMessage(chatId, helpMessage, {
    parse_mode: 'Markdown',
    disable_web_page_preview: true,
    ...keyboard,
  });
};

module.exports = handleHelp;
